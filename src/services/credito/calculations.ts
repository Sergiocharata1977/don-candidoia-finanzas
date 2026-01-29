/**
 * Calculation Service - Sistema Francés
 * Cálculo de cuotas e intereses para créditos de consumo
 */

import type { Cuota } from '@/types/credito';

/**
 * Calcula la cuota fija mensual usando el Sistema Francés
 * @param capital - Monto a financiar
 * @param tasaMensual - Tasa de interés mensual (ej: 0.05 = 5%)
 * @param cantidadCuotas - Número de cuotas
 * @returns Valor de la cuota fija
 */
export function calcularCuotaFrances(
    capital: number,
    tasaMensual: number,
    cantidadCuotas: number
): number {
    if (tasaMensual === 0) {
        // Sin interés, cuota simple
        return Math.round((capital / cantidadCuotas) * 100) / 100;
    }

    const i = tasaMensual;
    const n = cantidadCuotas;
    const cuota = capital * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

    return Math.round(cuota * 100) / 100;
}

/**
 * Calcula el monto total a pagar incluyendo intereses
 */
export function calcularMontoTotal(
    capital: number,
    tasaMensual: number,
    cantidadCuotas: number
): number {
    const cuota = calcularCuotaFrances(capital, tasaMensual, cantidadCuotas);
    return Math.round(cuota * cantidadCuotas * 100) / 100;
}

/**
 * Calcula el total de intereses a pagar
 */
export function calcularTotalIntereses(
    capital: number,
    tasaMensual: number,
    cantidadCuotas: number
): number {
    const total = calcularMontoTotal(capital, tasaMensual, cantidadCuotas);
    return Math.round((total - capital) * 100) / 100;
}

/**
 * Genera el plan de cuotas completo (tabla de amortización)
 * @param creditoId - ID del crédito
 * @param clienteId - ID del cliente
 * @param organizationId - ID de la organización
 * @param capital - Monto a financiar
 * @param tasaMensual - Tasa mensual
 * @param cantidadCuotas - Número de cuotas
 * @param fechaInicio - Fecha de la primera cuota
 * @returns Array de cuotas con desglose capital/interés
 */
export function generarPlanCuotas(
    creditoId: string,
    clienteId: string,
    organizationId: string,
    capital: number,
    tasaMensual: number,
    cantidadCuotas: number,
    fechaInicio: Date
): Omit<Cuota, 'id' | 'createdAt' | 'updatedAt'>[] {
    const cuotaFija = calcularCuotaFrances(capital, tasaMensual, cantidadCuotas);
    let saldo = capital;
    const cuotas: Omit<Cuota, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    for (let i = 1; i <= cantidadCuotas; i++) {
        const interes = Math.round(saldo * tasaMensual * 100) / 100;
        const capitalCuota = Math.round((cuotaFija - interes) * 100) / 100;
        saldo = Math.max(0, saldo - capitalCuota);

        // Calcular fecha de vencimiento (mes siguiente al anterior)
        const vencimiento = new Date(fechaInicio);
        vencimiento.setMonth(vencimiento.getMonth() + i);

        cuotas.push({
            organizationId,
            creditoId,
            clienteId,
            numero: i,
            vencimiento,
            capital: capitalCuota,
            interes,
            total: cuotaFija,
            montoPagado: 0,
            saldoPendiente: cuotaFija,
            estado: 'pendiente',
        });
    }

    // Ajuste de redondeo en la última cuota
    if (cuotas.length > 0) {
        const totalCapital = cuotas.reduce((sum, c) => sum + c.capital, 0);
        const diferencia = Math.round((capital - totalCapital) * 100) / 100;
        if (diferencia !== 0) {
            cuotas[cuotas.length - 1].capital += diferencia;
        }
    }

    return cuotas;
}

/**
 * Obtiene las opciones de financiación disponibles para un monto
 */
export function obtenerOpcionesFinanciacion(
    monto: number,
    tasasPorPlazo: { cuotas: number; tasaMensual: number }[]
): {
    cuotas: number;
    tasaMensual: number;
    valorCuota: number;
    totalAPagar: number;
    totalIntereses: number;
}[] {
    return tasasPorPlazo.map(({ cuotas, tasaMensual }) => {
        const valorCuota = calcularCuotaFrances(monto, tasaMensual, cuotas);
        const totalAPagar = calcularMontoTotal(monto, tasaMensual, cuotas);
        const totalIntereses = calcularTotalIntereses(monto, tasaMensual, cuotas);

        return {
            cuotas,
            tasaMensual,
            valorCuota,
            totalAPagar,
            totalIntereses,
        };
    });
}

/**
 * Calcula punitorios por mora
 */
export function calcularPunitorios(
    montoPendiente: number,
    diasMora: number,
    tasaPunitoriaDiaria: number
): number {
    if (diasMora <= 0) return 0;
    return Math.round(montoPendiente * tasaPunitoriaDiaria * diasMora * 100) / 100;
}

/**
 * Calcula los días de mora de una cuota
 */
export function calcularDiasMora(vencimiento: Date, fechaActual: Date = new Date()): number {
    const diffTime = fechaActual.getTime() - vencimiento.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
}
