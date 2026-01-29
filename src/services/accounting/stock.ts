/**
 * Servicio de Movimientos de Stock
 * Gestión de entradas/salidas de mercadería
 */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    increment,
    Timestamp,
    runTransaction,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { MovimientoStock, FacturaCompra, DatosEntradaMercaderia } from '@/types/stock';
import { generarAsientoAutomatico } from './asientos-auto';

const getMovimientosPath = (orgId: string) => `organizations/${orgId}/movimientos_stock`;
const getFacturasPath = (orgId: string) => `organizations/${orgId}/facturas_compra`;
const getProductosPath = (orgId: string) => `organizations/${orgId}/products`;

/**
 * Registrar entrada de mercadería
 * Crea factura de compra, actualiza stock y genera asiento contable
 */
export async function registrarEntradaMercaderia(
    orgId: string,
    datos: DatosEntradaMercaderia,
    proveedorNombre: string
): Promise<string> {
    // Calcular totales
    const subtotal = datos.items.reduce((sum, item) => sum + item.subtotal, 0);
    const iva = subtotal * 0.21; // IVA 21%
    const total = subtotal + iva;

    // Usar transacción para asegurar consistencia
    return await runTransaction(db, async (transaction) => {
        // 1. Crear factura de compra
        const facturaRef = doc(collection(db, getFacturasPath(orgId)));
        const facturaData: Omit<FacturaCompra, 'id'> = {
            organizationId: orgId,
            proveedorId: datos.proveedorId,
            proveedorNombre,
            numeroFactura: datos.numeroFactura,
            fecha: datos.fecha,
            items: datos.items,
            subtotal,
            iva,
            total,
            estado: 'pendiente',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        transaction.set(facturaRef, {
            ...facturaData,
            fecha: Timestamp.fromDate(datos.fecha),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        // 2. Registrar movimientos de stock y actualizar productos
        for (const item of datos.items) {
            // Crear movimiento de stock
            const movRef = doc(collection(db, getMovimientosPath(orgId)));
            const movData: Omit<MovimientoStock, 'id'> = {
                organizationId: orgId,
                productoId: item.productoId,
                productoNombre: item.productoNombre,
                tipo: 'entrada_compra',
                cantidad: item.cantidad,
                precioUnitario: item.precioUnitario,
                valorTotal: item.subtotal,
                facturaId: facturaRef.id,
                observaciones: datos.observaciones,
                fecha: datos.fecha,
                createdAt: new Date(),
            };

            transaction.set(movRef, {
                ...movData,
                fecha: Timestamp.fromDate(datos.fecha),
                createdAt: Timestamp.now(),
            });

            // Actualizar stock del producto
            const productoRef = doc(db, getProductosPath(orgId), item.productoId);
            transaction.update(productoRef, {
                stock: increment(item.cantidad),
                costo: item.precioUnitario, // Actualizar costo con último precio de compra
                updatedAt: Timestamp.now(),
            });
        }

        return facturaRef.id;
    }).then(async (facturaId) => {
        // 3. Generar asiento contable (fuera de la transacción)
        const asientoId = await generarAsientoAutomatico(
            orgId,
            'compra_credito',
            {
                terceroId: datos.proveedorId,
                monto: total,
                categoria: 'compras',
                descripcion: `Factura ${datos.numeroFactura} - ${proveedorNombre}`,
                fecha: datos.fecha,
            },
            facturaId
        );

        // Actualizar factura con asientoId
        const facturaRef = doc(db, getFacturasPath(orgId), facturaId);
        await updateDoc(facturaRef, {
            asientoId,
            updatedAt: Timestamp.now(),
        });

        return facturaId;
    });
}

/**
 * Registrar movimiento de stock individual
 */
export async function registrarMovimientoStock(
    orgId: string,
    movimiento: Omit<MovimientoStock, 'id' | 'organizationId' | 'createdAt'>
): Promise<string> {
    const movRef = collection(db, getMovimientosPath(orgId));

    const movData = {
        ...movimiento,
        organizationId: orgId,
        fecha: Timestamp.fromDate(movimiento.fecha),
        createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(movRef, movData);

    // Actualizar stock del producto
    const productoRef = doc(db, getProductosPath(orgId), movimiento.productoId);
    const stockDelta = movimiento.tipo === 'entrada_compra' || movimiento.tipo === 'ajuste'
        ? movimiento.cantidad
        : -movimiento.cantidad;

    await updateDoc(productoRef, {
        stock: increment(stockDelta),
        updatedAt: Timestamp.now(),
    });

    return docRef.id;
}
