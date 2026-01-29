/**
 * API Route: List products with stock
 * GET /api/v1/productos
 * 
 * Used by external eCommerce sites to fetch product catalog
 */

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { validateApiKey } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Validate API key and get organization
        const auth = await validateApiKey(request);
        if (!auth.valid) {
            return NextResponse.json(
                { error: 'Unauthorized', message: auth.message },
                { status: 401 }
            );
        }

        const { organizationId } = auth;
        const { searchParams } = new URL(request.url);

        // Optional filters
        const categoria = searchParams.get('categoria');
        const activo = searchParams.get('activo') !== 'false';
        const limit = parseInt(searchParams.get('limit') || '50');

        // Build query
        let productosQuery = query(
            collection(db, 'organizations', organizationId, 'productos'),
            where('activo', '==', activo)
        );

        if (categoria) {
            productosQuery = query(
                collection(db, 'organizations', organizationId, 'productos'),
                where('activo', '==', activo),
                where('categoria', '==', categoria)
            );
        }

        const snapshot = await getDocs(productosQuery);

        const productos = snapshot.docs.slice(0, limit).map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                nombre: data.nombre,
                descripcion: data.descripcion,
                categoria: data.categoria,
                marca: data.marca,
                modelo: data.modelo,
                precioContado: data.precioContado,
                precioLista: data.precioLista,
                stock: data.stock,
                imagenes: data.imagenes || [],
                destacado: data.destacado || false,
            };
        });

        return NextResponse.json({
            success: true,
            data: productos,
            total: productos.length,
        });

    } catch (error) {
        console.error('Error fetching productos:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
