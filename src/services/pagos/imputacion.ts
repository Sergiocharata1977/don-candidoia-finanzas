/**
 * Servicio de Imputación de Pagos
 * Distribuye un monto abonado entre cuotas pendientes siguiendo reglas de negocio
 */

import {
    collection,
    doc,
    runTransaction,
    Timestamp,
    query,
    where,
    orderBy,
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Pago, Cuota, Imputacion } from '@/types/credito';
import { calcularDiasMora, calcularPunitorios } from '../credito/calculations';

/**
 * Registra un nuevo pago e imputa automáticamente a las cuotas más antiguas
 */
export async function registrarPagoEImputar(
    organizationId: string,
    clienteId: string,
    data: {
        monto: number;
        metodo: Pago['metodo'];
        externalReference?: string;
        paymentId?: string;
    },
    tasaPunitoria: number = 0.001 // 0.1% diario por defecto
): Promise<{ pagoId: string; imputaciones: Imputacion[] }> {

    // 1. Buscar cuotas pendientes (FEFO - First Expired First Out)
    const cuotasRef = collection(db, 'organizations', organizationId, 'cuotas');
    const q = query(
        cuotasRef,
        where('clienteId', '==', clienteId),
        where('estado', 'in', ['pendiente', 'vencida', 'parcial']),
        orderBy('vencimiento', 'asc')
    );

    const snapshot = await getDocs(q);
    const cuotasPendientes = snapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        ...doc.data()
    })) as (Cuota & { ref: any })[];

    const imputaciones: Imputacion[] = [];
    let montoDisponible = data.monto;
    const now = new Date();

    const batch = writeBatch(db);

    // 2. Distribuir monto
    for (const cuota of cuotasPendientes) {
        if (montoDisponible <= 0.01) break;

        // Calcular deuda real de esta cuota
        const vencimiento = cuota.vencimiento as any;
        const fechaVencimiento = vencimiento.toDate ? vencimiento.toDate() : new Date(vencimiento);
        const diasMora = calcularDiasMora(fechaVencimiento);
        const punitorios = calcularPunitorios(cuota.saldoPendiente, diasMora, tasaPunitoria);
        const totalExigible = cuota.saldoPendiente + punitorios;

        // Determinar cuánto cubrir
        const montoAImputar = Math.min(montoDisponible, totalExigible);

        let tipoImputacion: 'capital' | 'interes' | 'punitorio' = 'capital';

        // Lógica simplificada: si cubre todo es total, sino parcial
        // En un sistema real se imputa primero a punitorios, luego interés, luego capital
        // Aquí asumimos imputación general al saldo

        montoDisponible -= montoAImputar;
        const nuevoSaldo = cuota.saldoPendiente - montoAImputar; // Aquí ignoramos punitorios para simplificar saldo capital, ajustar según regla negocio exacta

        // Actualizar cuota
        const nuevoEstado = nuevoSaldo <= 0.1 ? 'pagada' : 'parcial';

        batch.update(cuota.ref, {
            montoPagado: (cuota.montoPagado || 0) + montoAImputar,
            saldoPendiente: Math.max(0, nuevoSaldo),
            estado: nuevoEstado,
            fechaPago: Timestamp.fromDate(now),
            updatedAt: Timestamp.fromDate(now)
        });

        imputaciones.push({
            cuotaId: cuota.id,
            creditoId: cuota.creditoId,
            montoAplicado: montoAImputar,
            tipo: tipoImputacion
        });
    }

    // 3. Crear registro de pago
    const pagoRef = doc(collection(db, 'organizations', organizationId, 'pagos'));
    const pagoData: Omit<Pago, 'id'> = {
        organizationId,
        clienteId,
        monto: data.monto,
        metodo: data.metodo,
        estado: 'approved',
        externalReference: data.externalReference,
        paymentId: data.paymentId,
        imputaciones,
        fechaCreacion: now,
        fechaConfirmacion: now,
        createdAt: now,
        updatedAt: now
    };

    batch.set(pagoRef, {
        ...pagoData,
        fechaCreacion: Timestamp.fromDate(now),
        fechaConfirmacion: Timestamp.fromDate(now),
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
    });

    // 4. Actualizar saldos del cliente (denormalización)
    // Esto debería hacerse en una Cloud Function idealmente, pero aquí lo hacemos inline o lo dejamos para el clienteService

    await batch.commit();

    return {
        pagoId: pagoRef.id,
        imputaciones
    };
}
