/**
 * API Route: Create Payment Preference (Mercado Pago)
 * POST /api/pagos/crear
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { crearPreferenciaMP } from '@/services/pagos/mercadopago';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export async function POST(request: NextRequest) {
    try {
        // Optional: Validar API Key si es llamada desde server externo
        // Si es desde el portal cliente, validar token de sesión (implementar luego)

        const body = await request.json();
        const { organizationId, cliente, items, backUrls } = body;

        if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            return NextResponse.json(
                { error: 'Server Config Error', message: 'Missing MP Access Token' },
                { status: 500 }
            );
        }

        // Crear intención de pago en DB interna
        const pagoRef = await addDoc(collection(db, 'organizations', organizationId, 'pagos_intents'), {
            clienteId: cliente.id,
            monto: items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0),
            estado: 'pending',
            createdAt: Timestamp.now(),
        });

        // Crear preferencia en MP
        const preferencia = await crearPreferenciaMP(process.env.MERCADOPAGO_ACCESS_TOKEN, {
            items,
            payer: {
                name: cliente.nombre,
                email: cliente.email,
            },
            external_reference: pagoRef.id, // Usamos el ID de nuestro intent como referencia
            back_urls: backUrls || {
                success: `${process.env.NEXT_PUBLIC_APP_URL}/mi-cuenta/pagos/success`,
                failure: `${process.env.NEXT_PUBLIC_APP_URL}/mi-cuenta/pagos/failure`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL}/mi-cuenta/pagos/pending`,
            },
            notification_url: `${process.env.NEXT_PUBLIC_API_URL}/api/pagos/webhook`,
        });

        return NextResponse.json({
            success: true,
            init_point: preferencia.init_point,
            preference_id: preferencia.id,
        });

    } catch (error) {
        console.error('Error creating payment preference:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: String(error) },
            { status: 500 }
        );
    }
}
