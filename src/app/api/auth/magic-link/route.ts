/**
 * API Route: Request Magic Link
 * POST /api/auth/magic-link
 */

import { NextRequest, NextResponse } from 'next/server';
import { buscarClientePorDni, generarTokenAcceso } from '@/services/credito/clienteService';
import { db } from '@/firebase/config';

export async function POST(request: NextRequest) {
    try {
        const { dni, organizationId } = await request.json();

        if (!dni || !organizationId) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'DNI and organizationId are required' },
                { status: 400 }
            );
        }

        const cliente = await buscarClientePorDni(organizationId, dni);

        if (!cliente) {
            // Return 200 even if not found to prevent data enumeration
            return NextResponse.json({ success: true, message: 'If account exists, link sent' });
        }

        const token = await generarTokenAcceso(organizationId, cliente.id);

        // TODO: Implement real email/SMS sending
        // For now, log to console for development
        const link = `${process.env.NEXT_PUBLIC_APP_URL}/mi-cuenta?token=${token}&org=${organizationId}`;
        console.log(`[MAGIC LINK] (${dni}): ${link}`);

        return NextResponse.json({
            success: true,
            message: 'Link generated',
            devLink: process.env.NODE_ENV === 'development' ? link : undefined
        });

    } catch (error) {
        console.error('Error generating magic link:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
