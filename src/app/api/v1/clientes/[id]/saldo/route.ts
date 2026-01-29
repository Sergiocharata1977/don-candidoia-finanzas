/**
 * API Route: Get client balance and pending installments
 * GET /api/v1/clientes/[id]/saldo
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { obtenerCliente } from '@/services/credito/clienteService';
import { calcularSaldoCliente } from '@/services/credito/creditoService';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Validate API key
        const auth = await validateApiKey(request);
        if (!auth.valid) {
            return NextResponse.json(
                { error: 'Unauthorized', message: auth.message },
                { status: 401 }
            );
        }

        const { organizationId } = auth;
        const clienteId = params.id;

        // Get client
        const cliente = await obtenerCliente(organizationId, clienteId);
        if (!cliente) {
            return NextResponse.json(
                { error: 'Not Found', message: 'Cliente no encontrado' },
                { status: 404 }
            );
        }

        // Calculate current balance
        const { saldoTotal, cuotasVencidas, proximasCuotas } = await calcularSaldoCliente(
            organizationId,
            clienteId
        );

        return NextResponse.json({
            success: true,
            data: {
                cliente: {
                    id: cliente.id,
                    nombre: cliente.nombre,
                    dni: cliente.dni,
                },
                saldo: {
                    total: saldoTotal,
                    cuotasVencidas,
                    limiteCredito: cliente.limiteCredito,
                    creditoUtilizado: cliente.creditoUtilizado,
                    creditoDisponible: cliente.creditoDisponible,
                },
                proximasCuotas: proximasCuotas.map(c => ({
                    cuotaId: c.id,
                    creditoId: c.creditoId,
                    numero: c.numero,
                    vencimiento: c.vencimiento,
                    total: c.total,
                    saldoPendiente: c.saldoPendiente,
                    estado: c.estado,
                })),
            },
        });

    } catch (error) {
        console.error('Error getting client balance:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
