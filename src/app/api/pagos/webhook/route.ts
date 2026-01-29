/**
 * API Route: Mercado Pago Webhook
 * POST /api/pagos/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { obtenerPagoMP, validarFirmaWebhook } from '@/services/pagos/mercadopago';
import { registrarPagoEImputar } from '@/services/pagos/imputacion';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function POST(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const topic = url.searchParams.get('topic') || url.searchParams.get('type');
        const id = url.searchParams.get('id') || url.searchParams.get('data.id');

        if (topic !== 'payment') {
            return NextResponse.json({ status: 'ignored' });
        }

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error('Missing MP Access Token');
            return NextResponse.json({ error: 'Config Error' }, { status: 500 });
        }

        // Consultar pago en MP
        const paymentData = await obtenerPagoMP(accessToken, id);

        if (paymentData.status === 'approved') {
            const externalRef = paymentData.external_reference;

            // Buscar el intent original para saber organizationId y clienteId
            // Como externalRef es el ID del intent, lo buscamos directamente
            // Pero necesitamos buscar en TODAS las organizaciones o tener el orgId en la ref.
            // Para simplificar, asumimos que externalRef es `orgId_intentId` o buscamos globalmente si es posible (no en Firestore structure)
            // SOLUCION: En este diseño multi-tenant, mejor guardar intents en collection global o tener orgId en external_ref.
            // Asumiremos external_ref = "orgId___intentId" para separar.

            let organizationId = '';
            let clienteId = '';

            if (externalRef && externalRef.includes('___')) {
                const parts = externalRef.split('___');
                organizationId = parts[0];
                // intentId = parts[1]

                // Buscar cliente desde el intent
                const intentRef = doc(db, 'organizations', organizationId, 'pagos_intents', parts[1]);
                const intentSnap = await getDoc(intentRef);
                if (intentSnap.exists()) {
                    clienteId = intentSnap.data().clienteId;
                }
            } else {
                // Fallback o error log
                console.error('Invalid external_reference format:', externalRef);
                return NextResponse.json({ error: 'Invalid ref' }, { status: 400 });
            }

            if (organizationId && clienteId) {
                // Registrar pago e imputar
                await registrarPagoEImputar(organizationId, clienteId, {
                    monto: paymentData.transaction_amount,
                    metodo: 'mercadopago',
                    externalReference: externalRef,
                    paymentId: id,
                });
            }
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
