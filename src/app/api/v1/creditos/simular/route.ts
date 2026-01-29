/**
 * API Route: Simulate credit options
 * POST /api/v1/creditos/simular
 * 
 * Returns available financing options for a given amount
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { obtenerOpcionesFinanciacion } from '@/services/credito/calculations';

// Default rates - should be configurable per organization
const TASAS_DEFAULT = [
    { cuotas: 3, tasaMensual: 0.03 },
    { cuotas: 6, tasaMensual: 0.04 },
    { cuotas: 12, tasaMensual: 0.05 },
    { cuotas: 18, tasaMensual: 0.055 },
    { cuotas: 24, tasaMensual: 0.06 },
];

export async function POST(request: NextRequest) {
    try {
        // Validate API key
        const auth = await validateApiKey(request);
        if (!auth.valid) {
            return NextResponse.json(
                { error: 'Unauthorized', message: auth.message },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { monto, anticipo = 0 } = body;

        if (!monto || monto <= 0) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'monto is required and must be positive' },
                { status: 400 }
            );
        }

        const montoAFinanciar = monto - anticipo;

        if (montoAFinanciar <= 0) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'El anticipo no puede ser mayor o igual al monto' },
                { status: 400 }
            );
        }

        // TODO: Get organization-specific rates from Firestore
        const opciones = obtenerOpcionesFinanciacion(montoAFinanciar, TASAS_DEFAULT);

        return NextResponse.json({
            success: true,
            data: {
                montoOriginal: monto,
                anticipo,
                montoAFinanciar,
                opciones: opciones.map(op => ({
                    cuotas: op.cuotas,
                    tasaMensual: (op.tasaMensual * 100).toFixed(1) + '%',
                    valorCuota: op.valorCuota,
                    totalAPagar: op.totalAPagar,
                    totalIntereses: op.totalIntereses,
                    cft: ((op.totalAPagar / montoAFinanciar - 1) * 100).toFixed(1) + '%', // Costo Financiero Total aproximado
                })),
            },
        });

    } catch (error) {
        console.error('Error simulating credit:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
