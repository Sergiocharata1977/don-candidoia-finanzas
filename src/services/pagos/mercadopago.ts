/**
 * Mercado Pago Integration Service
 * Manejo de preferencias y notificaciones de pago
 */

import crypto from 'crypto';

const MP_API_URL = 'https://api.mercadopago.com';

interface MPPreferenceItem {
    id: string;
    title: string;
    description?: string;
    picture_url?: string;
    quantity: number;
    currency_id: 'ARS';
    unit_price: number;
}

interface MPPreferencePayer {
    name: string;
    email: string;
    identification?: {
        type: string;
        number: string;
    };
}

interface MPPreferenceBackUrls {
    success: string;
    failure: string;
    pending: string;
}

/**
 * Crea una preferencia de pago en Mercado Pago
 */
export async function crearPreferenciaMP(
    accessToken: string,
    data: {
        items: MPPreferenceItem[];
        payer: MPPreferencePayer;
        external_reference: string;
        back_urls: MPPreferenceBackUrls;
        notification_url?: string;
        auto_return?: 'approved' | 'all';
    }
): Promise<{ id: string; init_point: string; sandbox_init_point: string }> {
    const response = await fetch(`${MP_API_URL}/checkout/preferences`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            items: data.items,
            payer: data.payer,
            external_reference: data.external_reference,
            back_urls: data.back_urls,
            notification_url: data.notification_url,
            auto_return: data.auto_return || 'approved',
            statement_descriptor: 'DON CANDIDO',
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Error creating preference: ${JSON.stringify(error)}`);
    }

    const result = await response.json();
    return {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
    };
}

/**
 * Verifica la firma del webhook de Mercado Pago
 * (Implementación simplificada, en prod usar SDK o validación x-signature)
 */
export function validarFirmaWebhook(
    xSignature: string,
    xRequestId: string,
    dataId: string,
    secret: string
): boolean {
    if (!xSignature || !xRequestId || !dataId) return false;

    // Parse x-signature
    // Format: ts=...,v1=...
    const parts = xSignature.split(',');
    let ts = '';
    let v1 = '';

    parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key === 'ts') ts = value;
        if (key === 'v1') v1 = value;
    });

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(manifest).digest('hex');

    return digest === v1;
}

/**
 * Obtiene la información de un pago por ID
 */
export async function obtenerPagoMP(accessToken: string, paymentId: string) {
    const response = await fetch(`${MP_API_URL}/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Error fetching payment');
    }

    return await response.json();
}
