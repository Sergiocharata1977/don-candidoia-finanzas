/**
 * API Route: Create order with credit
 * POST /api/v1/pedidos
 * 
 * Creates a new order, optionally with credit financing
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api-auth';
import { crearCredito } from '@/services/credito/creditoService';
import { buscarClientePorDni, crearClienteCredito } from '@/services/credito/clienteService';
import { collection, addDoc, doc, getDoc, updateDoc, Timestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Pedido, FormaPago } from '@/types/credito';

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

        const { organizationId } = auth;
        const body = await request.json();

        // Validate required fields
        const { cliente, items, formaPago, credito: creditoConfig } = body;

        if (!cliente || !items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'cliente and items are required' },
                { status: 400 }
            );
        }

        if (!formaPago || !['contado', 'credito'].includes(formaPago)) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'formaPago must be "contado" or "credito"' },
                { status: 400 }
            );
        }

        // Find or create client
        let clienteDoc = await buscarClientePorDni(organizationId, cliente.dni);

        if (!clienteDoc) {
            clienteDoc = await crearClienteCredito(organizationId, {
                nombre: cliente.nombre,
                dni: cliente.dni,
                email: cliente.email,
                telefono: cliente.telefono,
                direccion: cliente.direccion,
            });
        }

        // Validate stock availability
        const batch = writeBatch(db);
        let subtotal = 0;

        for (const item of items) {
            const productoRef = doc(db, 'organizations', organizationId, 'productos', item.productoId);
            const productoSnap = await getDoc(productoRef);

            if (!productoSnap.exists()) {
                return NextResponse.json(
                    { error: 'Bad Request', message: `Producto ${item.productoId} no encontrado` },
                    { status: 400 }
                );
            }

            const producto = productoSnap.data();
            if (producto.stock < item.cantidad) {
                return NextResponse.json(
                    { error: 'Bad Request', message: `Stock insuficiente para ${producto.nombre}` },
                    { status: 400 }
                );
            }

            // Reserve stock
            batch.update(productoRef, {
                stock: producto.stock - item.cantidad,
            });

            subtotal += (formaPago === 'credito' ? producto.precioLista : producto.precioContado) * item.cantidad;
        }

        const now = new Date();
        const anticipo = creditoConfig?.anticipo || 0;
        const total = subtotal - (body.descuento || 0);

        // Create order
        const pedidoData: Omit<Pedido, 'id'> = {
            organizationId,
            clienteId: clienteDoc.id,
            items: items.map((item: { productoId: string; nombre: string; cantidad: number; precioUnitario: number }) => ({
                productoId: item.productoId,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                subtotal: item.cantidad * item.precioUnitario,
            })),
            subtotal,
            descuento: body.descuento || 0,
            total,
            formaPago: formaPago as FormaPago,
            anticipoMonto: anticipo,
            estado: 'pendiente',
            createdAt: now,
            updatedAt: now,
        };

        const pedidoRef = await addDoc(
            collection(db, 'organizations', organizationId, 'pedidos'),
            {
                ...pedidoData,
                createdAt: Timestamp.fromDate(now),
                updatedAt: Timestamp.fromDate(now),
            }
        );

        let creditoCreado = null;

        // If credit payment, create credit
        if (formaPago === 'credito') {
            if (!creditoConfig?.cuotas || !creditoConfig?.tasaMensual) {
                return NextResponse.json(
                    { error: 'Bad Request', message: 'credito.cuotas and credito.tasaMensual required for credit payment' },
                    { status: 400 }
                );
            }

            const montoAFinanciar = total - anticipo;

            const { credito, cuotas } = await crearCredito(organizationId, clienteDoc.id, {
                montoOriginal: total,
                montoFinanciado: montoAFinanciar,
                tasaMensual: creditoConfig.tasaMensual,
                cantidadCuotas: creditoConfig.cuotas,
                pedidoId: pedidoRef.id,
                createdBy: 'api',
            });

            // Update order with credit reference
            await updateDoc(pedidoRef, {
                creditoId: credito.id,
                estado: 'confirmado',
            });

            creditoCreado = {
                id: credito.id,
                valorCuota: credito.valorCuota,
                cantidadCuotas: credito.cantidadCuotas,
                cuotas: cuotas.map(c => ({
                    numero: c.numero,
                    vencimiento: c.vencimiento,
                    total: c.total,
                })),
            };
        }

        // Commit stock changes
        await batch.commit();

        return NextResponse.json({
            success: true,
            data: {
                pedidoId: pedidoRef.id,
                clienteId: clienteDoc.id,
                total,
                formaPago,
                credito: creditoCreado,
            },
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: String(error) },
            { status: 500 }
        );
    }
}
