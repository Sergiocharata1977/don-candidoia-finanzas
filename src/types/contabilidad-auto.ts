/**
 * Tipos para Sistema Contable Automático
 * Basado en el modelo de SIG-Agro
 */

// ============================================
// TIPOS DE OPERACIONES
// ============================================

export type TipoOperacion =
    | 'ingreso_dinero'
    | 'gasto_pago'
    | 'compra_credito'
    | 'pago_deuda'
    | 'venta_producto'
    | 'cobro_cliente'
    | 'transferencia';

export type MedioPago = 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';

export type CategoriaIngreso = 'ventas' | 'servicios' | 'otros_ingresos';
export type CategoriaGasto = 'compras' | 'servicios' | 'alquileres' | 'gastos_varios';

// ============================================
// ASIENTOS CONTABLES AUTOMÁTICOS
// ============================================

export interface AsientoAutomatico {
    id: string;
    organizationId: string;
    tipoOperacion: TipoOperacion;
    operacionId: string;
    descripcion: string;
    fecha: Date;
    lineas: LineaAsientoAuto[];
    totalDebe: number;
    totalHaber: number;
    terceroId?: string;
    terceroNombre?: string;
    createdAt: Date;
}

export interface LineaAsientoAuto {
    cuentaId: string;
    cuentaNombre: string;
    debe: number;
    haber: number;
}

// ============================================
// DATOS PARA CADA TIPO DE OPERACIÓN
// ============================================

export interface DatosIngresoDinero {
    monto: number;
    medioPago: MedioPago;
    categoria: CategoriaIngreso;
    descripcion: string;
    fecha: Date;
    cuentaBancariaId?: string; // Si es transferencia/cheque
}

export interface DatosGastoPago {
    monto: number;
    medioPago: MedioPago;
    categoria: CategoriaGasto;
    descripcion: string;
    fecha: Date;
    terceroId?: string;
    cuentaBancariaId?: string;
}

export interface DatosCompraCredito {
    terceroId: string;
    monto: number;
    categoria: CategoriaGasto;
    descripcion: string;
    fecha: Date;
}

export interface DatosPagoDeuda {
    terceroId: string;
    monto: number;
    medioPago: MedioPago;
    descripcion: string;
    fecha: Date;
    cuentaBancariaId?: string;
}

export interface DatosVentaProducto {
    terceroId: string;
    productoId: string;
    cantidad: number;
    precioUnitario: number;
    descripcion: string;
    fecha: Date;
}

export interface DatosCobroCliente {
    terceroId: string;
    monto: number;
    medioPago: MedioPago;
    descripcion: string;
    fecha: Date;
    cuentaBancariaId?: string;
}

export interface DatosTransferencia {
    cuentaOrigenId: string;
    cuentaDestinoId: string;
    monto: number;
    descripcion: string;
    fecha: Date;
}

// Union type para todos los datos de operaciones
export type DatosOperacion =
    | DatosIngresoDinero
    | DatosGastoPago
    | DatosCompraCredito
    | DatosPagoDeuda
    | DatosVentaProducto
    | DatosCobroCliente
    | DatosTransferencia;

// ============================================
// TERCEROS (CLIENTES/PROVEEDORES)
// ============================================

export type TipoTercero = 'cliente' | 'proveedor' | 'ambos';

export interface Tercero {
    id: string;
    organizationId: string;
    nombre: string;
    documento: string;
    tipo: TipoTercero;
    email?: string;
    telefono?: string;
    direccion?: string;

    // Saldos acumulados
    saldoCliente: number;    // Cuánto NOS DEBE (activo)
    saldoProveedor: number;  // Cuánto LE DEBEMOS (pasivo)

    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MovimientoTercero {
    id: string;
    organizationId: string;
    terceroId: string;
    fecha: Date;
    tipoOperacion: TipoOperacion;
    descripcion: string;

    // Deltas (incrementos/decrementos)
    montoCliente: number;    // +100 = nos debe más, -100 = nos debe menos
    montoProveedor: number;  // +100 = le debemos más, -100 = le debemos menos

    asientoId: string;  // Referencia al asiento contable
    createdAt: Date;
}

// ============================================
// CUENTAS BANCARIAS (CAJA/BANCOS)
// ============================================

export type TipoCuentaBancaria = 'caja' | 'cuenta_corriente' | 'caja_ahorro';

export interface CuentaBancaria {
    id: string;
    organizationId: string;
    nombre: string;
    tipo: TipoCuentaBancaria;
    banco?: string;
    numeroCuenta?: string;
    moneda: 'ARS' | 'USD';

    // Saldo acumulado
    saldoActual: number;

    activa: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MovimientoCajaBanco {
    id: string;
    organizationId: string;
    cuentaId: string;
    fecha: Date;
    tipo: 'ingreso' | 'egreso' | 'transferencia';
    monto: number;  // +1000 = ingreso, -500 = egreso
    descripcion: string;
    asientoId: string;
    createdAt: Date;
}

// ============================================
// PLAN DE CUENTAS
// ============================================

export type TipoCuenta = 'activo' | 'pasivo' | 'patrimonio' | 'ingreso' | 'gasto';

export interface CuentaContable {
    id: string;
    codigo: string;
    nombre: string;
    tipo: TipoCuenta;
    nivel: number;
    cuentaPadreId?: string;
    activa: boolean;
}

// Plan de cuentas simplificado para finanzas
export const PLAN_CUENTAS_FINANZAS: CuentaContable[] = [
    // 1. ACTIVO
    { id: '1', codigo: '1', nombre: 'ACTIVO', tipo: 'activo', nivel: 1, activa: true },
    { id: '1.1', codigo: '1.1', nombre: 'Activo Corriente', tipo: 'activo', nivel: 2, cuentaPadreId: '1', activa: true },

    // 1.1 Caja y Bancos
    { id: '1.1.1', codigo: '1.1.1', nombre: 'Caja', tipo: 'activo', nivel: 3, cuentaPadreId: '1.1', activa: true },
    { id: '1.1.2', codigo: '1.1.2', nombre: 'Bancos', tipo: 'activo', nivel: 3, cuentaPadreId: '1.1', activa: true },

    // 1.2 Créditos
    { id: '1.2.1', codigo: '1.2.1', nombre: 'Clientes', tipo: 'activo', nivel: 3, cuentaPadreId: '1.1', activa: true },

    // 1.3 Bienes de Cambio
    { id: '1.3.1', codigo: '1.3.1', nombre: 'Mercaderías', tipo: 'activo', nivel: 3, cuentaPadreId: '1.1', activa: true },

    // 2. PASIVO
    { id: '2', codigo: '2', nombre: 'PASIVO', tipo: 'pasivo', nivel: 1, activa: true },
    { id: '2.1', codigo: '2.1', nombre: 'Pasivo Corriente', tipo: 'pasivo', nivel: 2, cuentaPadreId: '2', activa: true },
    { id: '2.1.1', codigo: '2.1.1', nombre: 'Proveedores', tipo: 'pasivo', nivel: 3, cuentaPadreId: '2.1', activa: true },
    { id: '2.1.2', codigo: '2.1.2', nombre: 'Tarjetas de Crédito', tipo: 'pasivo', nivel: 3, cuentaPadreId: '2.1', activa: true },

    // 3. PATRIMONIO
    { id: '3', codigo: '3', nombre: 'PATRIMONIO NETO', tipo: 'patrimonio', nivel: 1, activa: true },
    { id: '3.1.1', codigo: '3.1.1', nombre: 'Capital', tipo: 'patrimonio', nivel: 3, cuentaPadreId: '3', activa: true },

    // 4. INGRESOS
    { id: '4', codigo: '4', nombre: 'INGRESOS', tipo: 'ingreso', nivel: 1, activa: true },
    { id: '4.1.1', codigo: '4.1.1', nombre: 'Ventas de Productos', tipo: 'ingreso', nivel: 3, cuentaPadreId: '4', activa: true },
    { id: '4.1.2', codigo: '4.1.2', nombre: 'Servicios', tipo: 'ingreso', nivel: 3, cuentaPadreId: '4', activa: true },
    { id: '4.2.1', codigo: '4.2.1', nombre: 'Otros Ingresos', tipo: 'ingreso', nivel: 3, cuentaPadreId: '4', activa: true },

    // 5. GASTOS
    { id: '5', codigo: '5', nombre: 'GASTOS', tipo: 'gasto', nivel: 1, activa: true },
    { id: '5.1.1', codigo: '5.1.1', nombre: 'Compras de Mercadería', tipo: 'gasto', nivel: 3, cuentaPadreId: '5', activa: true },
    { id: '5.2.1', codigo: '5.2.1', nombre: 'Servicios', tipo: 'gasto', nivel: 3, cuentaPadreId: '5', activa: true },
    { id: '5.2.2', codigo: '5.2.2', nombre: 'Alquileres', tipo: 'gasto', nivel: 3, cuentaPadreId: '5', activa: true },
    { id: '5.3.1', codigo: '5.3.1', nombre: 'Gastos Varios', tipo: 'gasto', nivel: 3, cuentaPadreId: '5', activa: true },
];

// ============================================
// MAPEOS DE CUENTAS
// ============================================

export const CUENTA_POR_MEDIO_PAGO: Record<MedioPago, string> = {
    efectivo: '1.1.1',      // Caja
    transferencia: '1.1.2', // Bancos
    cheque: '1.1.2',        // Bancos
    tarjeta: '2.1.2',       // Tarjetas de Crédito (pasivo)
};

export const CUENTA_POR_CATEGORIA_INGRESO: Record<CategoriaIngreso, string> = {
    ventas: '4.1.1',        // Ventas de Productos
    servicios: '4.1.2',     // Servicios
    otros_ingresos: '4.2.1', // Otros Ingresos
};

export const CUENTA_POR_CATEGORIA_GASTO: Record<CategoriaGasto, string> = {
    compras: '5.1.1',       // Compras de Mercadería
    servicios: '5.2.1',     // Servicios
    alquileres: '5.2.2',    // Alquileres
    gastos_varios: '5.3.1', // Gastos Varios
};
