/**
 * Credit Module - Barrel exports
 */

// Types
export * from '@/types/credito';

// Calculations
export {
    calcularCuotaFrances,
    calcularMontoTotal,
    calcularTotalIntereses,
    generarPlanCuotas,
    obtenerOpcionesFinanciacion,
    calcularPunitorios,
    calcularDiasMora,
} from './calculations';

// Services
export {
    crearCredito,
    obtenerCredito,
    obtenerCreditosCliente,
    obtenerCuotasCredito,
    obtenerCuotasPendientesCliente,
    actualizarEstadoCredito,
    calcularSaldoCliente,
} from './creditoService';

export {
    crearClienteCredito,
    obtenerCliente,
    buscarClientePorDni,
    generarTokenAcceso,
    validarTokenAcceso,
    actualizarSaldosCliente,
    listarClientes,
} from './clienteService';
