/**
 * API Route: Initialize Portal Session
 * GET /api/portal/init
 */

import { NextRequest, NextResponse } from 'next/server';
import { validarTokenAcceso, obtenerCliente } from '@/services/credito/clienteService';
import { calcularSaldoCliente } from '@/services/credito/creditoService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        const organizationId = searchParams.get('org');

        if (!token || !organizationId) {
            return NextResponse.json({ error: 'Missing token or org' }, { status: 400 });
        }

        // 1. Validar Token
        const cliente = await validarTokenAcceso(organizationId, token);

        if (!cliente) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // 2. Obtener Saldos
        const { saldoTotal, cuotasVencidas, proximasCuotas } = await calcularSaldoCliente(
            organizationId,
            cliente.id
        );

        // 3. Retornar Data
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
            }
        });

    } catch (error) {
        console.error('Error initializing portal:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
