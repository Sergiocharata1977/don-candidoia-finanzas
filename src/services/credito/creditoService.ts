/**
 * Credito Service - CRUD operations for credits
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Credito, Cuota, EstadoCredito } from '@/types/credito';
import { generarPlanCuotas, calcularCuotaFrances } from './calculations';

const COLLECTION_NAME = 'creditos';
const CUOTAS_COLLECTION = 'cuotas';

/**
 * Obtiene la referencia a la colección de créditos de una organización
 */
function getCreditosRef(organizationId: string) {
    return collection(db, 'organizations', organizationId, COLLECTION_NAME);
}

function getCuotasRef(organizationId: string) {
    return collection(db, 'organizations', organizationId, CUOTAS_COLLECTION);
}

/**
 * Crear un nuevo crédito con su plan de cuotas
 */
export async function crearCredito(
    organizationId: string,
    clienteId: string,
    data: {
        montoOriginal: number;
        montoFinanciado: number;
        tasaMensual: number;
        cantidadCuotas: number;
        pedidoId?: string;
        fechaPrimerVencimiento?: Date;
        createdBy: string;
    }
): Promise<{ credito: Credito; cuotas: Cuota[] }> {
    const valorCuota = calcularCuotaFrances(
        data.montoFinanciado,
        data.tasaMensual,
        data.cantidadCuotas
    );

    const fechaPrimerVencimiento = data.fechaPrimerVencimiento || new Date();
    const now = new Date();

    // Crear crédito
    const creditoData: Omit<Credito, 'id'> = {
        organizationId,
        clienteId,
        pedidoId: data.pedidoId,
        montoOriginal: data.montoOriginal,
        montoFinanciado: data.montoFinanciado,
        tasaMensual: data.tasaMensual,
        cantidadCuotas: data.cantidadCuotas,
        valorCuota,
        estado: 'vigente',
        saldoCapital: data.montoFinanciado,
        fechaOtorgamiento: now,
        fechaPrimerVencimiento,
        createdAt: now,
        updatedAt: now,
        createdBy: data.createdBy,
    };

    const creditoRef = await addDoc(getCreditosRef(organizationId), {
        ...creditoData,
        fechaOtorgamiento: Timestamp.fromDate(creditoData.fechaOtorgamiento),
        fechaPrimerVencimiento: Timestamp.fromDate(creditoData.fechaPrimerVencimiento),
        createdAt: Timestamp.fromDate(creditoData.createdAt),
        updatedAt: Timestamp.fromDate(creditoData.updatedAt),
    });

    const credito: Credito = { ...creditoData, id: creditoRef.id };

    // Generar plan de cuotas
    const planCuotas = generarPlanCuotas(
        creditoRef.id,
        clienteId,
        organizationId,
        data.montoFinanciado,
        data.tasaMensual,
        data.cantidadCuotas,
        fechaPrimerVencimiento
    );

    // Guardar cuotas en batch
    const batch = writeBatch(db);
    const cuotas: Cuota[] = [];

    for (const cuotaData of planCuotas) {
        const cuotaRef = doc(getCuotasRef(organizationId));
        const now = new Date();
        batch.set(cuotaRef, {
            ...cuotaData,
            vencimiento: Timestamp.fromDate(cuotaData.vencimiento),
            createdAt: Timestamp.fromDate(now),
            updatedAt: Timestamp.fromDate(now),
        });
        cuotas.push({
            ...cuotaData,
            id: cuotaRef.id,
            createdAt: now,
            updatedAt: now,
        });
    }

    await batch.commit();

    return { credito, cuotas };
}

/**
 * Obtener crédito por ID
 */
export async function obtenerCredito(
    organizationId: string,
    creditoId: string
): Promise<Credito | null> {
    const creditoRef = doc(getCreditosRef(organizationId), creditoId);
    const snapshot = await getDoc(creditoRef);

    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
        id: snapshot.id,
        ...data,
        fechaOtorgamiento: data.fechaOtorgamiento?.toDate(),
        fechaPrimerVencimiento: data.fechaPrimerVencimiento?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
    } as Credito;
}

/**
 * Obtener créditos de un cliente
 */
export async function obtenerCreditosCliente(
    organizationId: string,
    clienteId: string
): Promise<Credito[]> {
    const q = query(
        getCreditosRef(organizationId),
        where('clienteId', '==', clienteId),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            fechaOtorgamiento: data.fechaOtorgamiento?.toDate(),
            fechaPrimerVencimiento: data.fechaPrimerVencimiento?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as Credito;
    });
}

/**
 * Obtener cuotas de un crédito
 */
export async function obtenerCuotasCredito(
    organizationId: string,
    creditoId: string
): Promise<Cuota[]> {
    const q = query(
        getCuotasRef(organizationId),
        where('creditoId', '==', creditoId),
        orderBy('numero', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            vencimiento: data.vencimiento?.toDate(),
            fechaPago: data.fechaPago?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as Cuota;
    });
}

/**
 * Obtener cuotas pendientes de un cliente
 */
export async function obtenerCuotasPendientesCliente(
    organizationId: string,
    clienteId: string
): Promise<Cuota[]> {
    const q = query(
        getCuotasRef(organizationId),
        where('clienteId', '==', clienteId),
        where('estado', 'in', ['pendiente', 'vencida', 'parcial']),
        orderBy('vencimiento', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            vencimiento: data.vencimiento?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as Cuota;
    });
}

/**
 * Actualizar estado de un crédito
 */
export async function actualizarEstadoCredito(
    organizationId: string,
    creditoId: string,
    estado: EstadoCredito
): Promise<void> {
    const creditoRef = doc(getCreditosRef(organizationId), creditoId);
    await updateDoc(creditoRef, {
        estado,
        updatedAt: Timestamp.now(),
    });
}

/**
 * Calcular saldo total de un cliente
 */
export async function calcularSaldoCliente(
    organizationId: string,
    clienteId: string
): Promise<{ saldoTotal: number; cuotasVencidas: number; proximasCuotas: Cuota[] }> {
    const cuotas = await obtenerCuotasPendientesCliente(organizationId, clienteId);
    const ahora = new Date();

    let saldoTotal = 0;
    let cuotasVencidas = 0;
    const proximasCuotas: Cuota[] = [];

    for (const cuota of cuotas) {
        saldoTotal += cuota.saldoPendiente;
        if (cuota.vencimiento < ahora) {
            cuotasVencidas++;
        }
        if (proximasCuotas.length < 3) {
            proximasCuotas.push(cuota);
        }
    }

    return { saldoTotal, cuotasVencidas, proximasCuotas };
}
