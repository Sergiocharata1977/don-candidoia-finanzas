/**
 * Cliente Credito Service - CRUD for credit clients with portal access
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
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { ClienteCredito } from '@/types/credito';
import crypto from 'crypto';

const COLLECTION_NAME = 'clientes';

function getClientesRef(organizationId: string) {
    return collection(db, 'organizations', organizationId, COLLECTION_NAME);
}

/**
 * Crear un nuevo cliente de crédito
 */
export async function crearClienteCredito(
    organizationId: string,
    data: {
        nombre: string;
        dni: string;
        email?: string;
        telefono?: string;
        direccion?: string;
        limiteCredito?: number;
    }
): Promise<ClienteCredito> {
    const now = new Date();

    const clienteData: Omit<ClienteCredito, 'id'> = {
        organizationId,
        nombre: data.nombre,
        dni: data.dni,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
        limiteCredito: data.limiteCredito || 100000,
        creditoUtilizado: 0,
        creditoDisponible: data.limiteCredito || 100000,
        saldoDeudor: 0,
        cuotasVencidas: 0,
        createdAt: now,
        updatedAt: now,
    };

    const docRef = await addDoc(getClientesRef(organizationId), {
        ...clienteData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
    });

    return { ...clienteData, id: docRef.id };
}

/**
 * Obtener cliente por ID
 */
export async function obtenerCliente(
    organizationId: string,
    clienteId: string
): Promise<ClienteCredito | null> {
    const clienteRef = doc(getClientesRef(organizationId), clienteId);
    const snapshot = await getDoc(clienteRef);

    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    return {
        id: snapshot.id,
        ...data,
        tokenExpira: data.tokenExpira?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
    } as ClienteCredito;
}

/**
 * Buscar cliente por DNI
 */
export async function buscarClientePorDni(
    organizationId: string,
    dni: string
): Promise<ClienteCredito | null> {
    const q = query(
        getClientesRef(organizationId),
        where('dni', '==', dni)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        tokenExpira: data.tokenExpira?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
    } as ClienteCredito;
}

/**
 * Generar token de acceso para el portal del cliente (Magic Link)
 */
export async function generarTokenAcceso(
    organizationId: string,
    clienteId: string,
    horasValidez: number = 48
): Promise<string> {
    // Generar token aleatorio
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expira = new Date();
    expira.setHours(expira.getHours() + horasValidez);

    const clienteRef = doc(getClientesRef(organizationId), clienteId);
    await updateDoc(clienteRef, {
        tokenAcceso: tokenHash,
        tokenExpira: Timestamp.fromDate(expira),
        updatedAt: Timestamp.now(),
    });

    // Retornar token sin hashear (el que se envía por email/sms)
    return token;
}

/**
 * Validar token de acceso
 */
export async function validarTokenAcceso(
    organizationId: string,
    token: string
): Promise<ClienteCredito | null> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const q = query(
        getClientesRef(organizationId),
        where('tokenAcceso', '==', tokenHash)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Verificar expiración
    const expira = data.tokenExpira?.toDate();
    if (!expira || expira < new Date()) {
        return null; // Token expirado
    }

    return {
        id: doc.id,
        ...data,
        tokenExpira: expira,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
    } as ClienteCredito;
}

/**
 * Actualizar saldos denormalizados del cliente
 */
export async function actualizarSaldosCliente(
    organizationId: string,
    clienteId: string,
    saldoDeudor: number,
    cuotasVencidas: number,
    creditoUtilizado: number
): Promise<void> {
    const clienteRef = doc(getClientesRef(organizationId), clienteId);
    const cliente = await getDoc(clienteRef);

    if (!cliente.exists()) return;

    const limiteCredito = cliente.data().limiteCredito || 0;

    await updateDoc(clienteRef, {
        saldoDeudor,
        cuotasVencidas,
        creditoUtilizado,
        creditoDisponible: Math.max(0, limiteCredito - creditoUtilizado),
        updatedAt: Timestamp.now(),
    });
}

/**
 * Listar todos los clientes de una organización
 */
export async function listarClientes(
    organizationId: string
): Promise<ClienteCredito[]> {
    const snapshot = await getDocs(getClientesRef(organizationId));

    return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            tokenExpira: data.tokenExpira?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
        } as ClienteCredito;
    });
}
