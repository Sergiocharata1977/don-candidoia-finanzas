/**
 * Servicio de Cuentas Bancarias (Caja/Bancos)
 * CRUD + gestión de saldos y movimientos
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    increment,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { CuentaBancaria, TipoCuentaBancaria, MovimientoCajaBanco } from '@/types/contabilidad-auto';

const getCollectionPath = (orgId: string) => `organizations/${orgId}/cuentas_bancarias`;
const getMovimientosPath = (orgId: string) => `organizations/${orgId}/movimientos_caja_banco`;

// ============================================
// CRUD CUENTAS BANCARIAS
// ============================================

/**
 * Obtener todas las cuentas bancarias
 */
export async function obtenerCuentasBancarias(
    orgId: string,
    filtroTipo?: TipoCuentaBancaria
): Promise<CuentaBancaria[]> {
    const cuentasRef = collection(db, getCollectionPath(orgId));

    let q = query(cuentasRef, where('activa', '==', true), orderBy('nombre'));

    if (filtroTipo) {
        q = query(
            cuentasRef,
            where('activa', '==', true),
            where('tipo', '==', filtroTipo),
            orderBy('nombre')
        );
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as CuentaBancaria[];
}

/**
 * Obtener cuenta bancaria por ID
 */
export async function obtenerCuentaBancaria(orgId: string, cuentaId: string): Promise<CuentaBancaria | null> {
    const docRef = doc(db, getCollectionPath(orgId), cuentaId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
    } as CuentaBancaria;
}

/**
 * Crear cuenta bancaria
 */
export async function crearCuentaBancaria(
    orgId: string,
    data: Omit<CuentaBancaria, 'id' | 'organizationId' | 'saldoActual' | 'createdAt' | 'updatedAt'>
): Promise<CuentaBancaria> {
    const cuentasRef = collection(db, getCollectionPath(orgId));

    const cuentaData = {
        ...data,
        organizationId: orgId,
        saldoActual: 0,
        activa: data.activa ?? true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(cuentasRef, cuentaData);

    return {
        id: docRef.id,
        ...data,
        organizationId: orgId,
        saldoActual: 0,
        activa: data.activa ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

/**
 * Actualizar cuenta bancaria
 */
export async function actualizarCuentaBancaria(
    orgId: string,
    cuentaId: string,
    data: Partial<Omit<CuentaBancaria, 'id' | 'organizationId' | 'createdAt'>>
): Promise<void> {
    const docRef = doc(db, getCollectionPath(orgId), cuentaId);

    await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
    });
}

/**
 * Desactivar cuenta bancaria (soft delete)
 */
export async function desactivarCuentaBancaria(orgId: string, cuentaId: string): Promise<void> {
    await actualizarCuentaBancaria(orgId, cuentaId, { activa: false });
}

// ============================================
// SALDOS Y MOVIMIENTOS
// ============================================

/**
 * Registrar movimiento de caja/banco
 * Actualiza automáticamente el saldo de la cuenta
 */
export async function registrarMovimientoCajaBanco(
    orgId: string,
    movimiento: Omit<MovimientoCajaBanco, 'id' | 'organizationId' | 'createdAt'>
): Promise<string> {
    const movRef = collection(db, getMovimientosPath(orgId));

    const movData = {
        ...movimiento,
        organizationId: orgId,
        fecha: Timestamp.fromDate(movimiento.fecha),
        createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(movRef, movData);

    // Actualizar saldo de la cuenta usando increment
    const cuentaRef = doc(db, getCollectionPath(orgId), movimiento.cuentaId);
    await updateDoc(cuentaRef, {
        saldoActual: increment(movimiento.monto),
        updatedAt: Timestamp.now(),
    });

    return docRef.id;
}

/**
 * Obtener movimientos de una cuenta
 */
export async function obtenerMovimientosCuenta(
    orgId: string,
    cuentaId: string
): Promise<MovimientoCajaBanco[]> {
    const movRef = collection(db, getMovimientosPath(orgId));
    const q = query(
        movRef,
        where('cuentaId', '==', cuentaId),
        orderBy('fecha', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fecha: doc.data().fecha?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as MovimientoCajaBanco[];
}

// ============================================
// CONSULTAS ÚTILES
// ============================================

/**
 * Calcular saldo total en caja
 */
export async function obtenerSaldoTotalCaja(orgId: string): Promise<number> {
    const cuentas = await obtenerCuentasBancarias(orgId, 'caja');
    return cuentas.reduce((sum, c) => sum + c.saldoActual, 0);
}

/**
 * Calcular saldo total en bancos
 */
export async function obtenerSaldoTotalBancos(orgId: string): Promise<number> {
    const cuentasCorrientes = await obtenerCuentasBancarias(orgId, 'cuenta_corriente');
    const cajasAhorro = await obtenerCuentasBancarias(orgId, 'caja_ahorro');

    const totalCorrientes = cuentasCorrientes.reduce((sum, c) => sum + c.saldoActual, 0);
    const totalAhorro = cajasAhorro.reduce((sum, c) => sum + c.saldoActual, 0);

    return totalCorrientes + totalAhorro;
}

/**
 * Calcular totales de saldos
 */
export async function calcularTotalesSaldosCajaBanco(orgId: string): Promise<{
    totalCaja: number;
    totalBancos: number;
    totalGeneral: number;
}> {
    const totalCaja = await obtenerSaldoTotalCaja(orgId);
    const totalBancos = await obtenerSaldoTotalBancos(orgId);

    return {
        totalCaja,
        totalBancos,
        totalGeneral: totalCaja + totalBancos,
    };
}
