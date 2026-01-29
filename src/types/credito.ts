/**
 * Credit Module Types
 * Sistema de Crédito y eCommerce para electrodomésticos/ferretería
 */

// ============================================
// CRÉDITOS
// ============================================

export type EstadoCredito = 'vigente' | 'cancelado' | 'mora' | 'refinanciado';

export interface Credito {
    id: string;
    organizationId: string;
    clienteId: string;
    pedidoId?: string; // Referencia al pedido/venta

    // Montos
    montoOriginal: number;
    montoFinanciado: number; // Puede ser menor si hubo anticipo
    tasaMensual: number; // Ej: 0.05 = 5%
    cantidadCuotas: number;
    valorCuota: number; // Cuota fija (Sistema Francés)

    // Estado
    estado: EstadoCredito;
    saldoCapital: number; // Actualizado con cada pago

    // Fechas
    fechaOtorgamiento: Date;
    fechaPrimerVencimiento: Date;

    // Metadata
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

// ============================================
// CUOTAS
// ============================================

export type EstadoCuota = 'pendiente' | 'pagada' | 'vencida' | 'parcial';

export interface Cuota {
    id: string;
    organizationId: string;
    creditoId: string;
    clienteId: string;

    numero: number;
    vencimiento: Date;

    // Desglose
    capital: number;
    interes: number;
    total: number;

    // Pagos
    montoPagado: number;
    saldoPendiente: number;
    estado: EstadoCuota;

    // Si está pagada
    pagoId?: string;
    fechaPago?: Date;

    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// PAGOS
// ============================================

export type EstadoPago = 'pending' | 'approved' | 'rejected' | 'refunded';
export type MetodoPago = 'mercadopago' | 'efectivo' | 'transferencia' | 'cheque';

export interface Pago {
    id: string;
    organizationId: string;
    clienteId: string;

    monto: number;
    metodo: MetodoPago;
    estado: EstadoPago;

    // Referencias PSP
    externalReference?: string; // MP preference_id
    paymentId?: string; // MP payment_id (después de confirmar)

    // Imputación
    imputaciones: Imputacion[];

    // Fechas
    fechaCreacion: Date;
    fechaConfirmacion?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export interface Imputacion {
    cuotaId: string;
    creditoId: string;
    montoAplicado: number;
    tipo: 'capital' | 'interes' | 'punitorio';
}

// ============================================
// PEDIDOS (eCommerce)
// ============================================

export type EstadoPedido = 'pendiente' | 'confirmado' | 'entregado' | 'cancelado';
export type FormaPago = 'contado' | 'credito';

export interface Pedido {
    id: string;
    organizationId: string;
    clienteId: string;

    // Items
    items: ItemPedido[];

    // Totales
    subtotal: number;
    descuento: number;
    total: number;

    // Forma de pago
    formaPago: FormaPago;
    creditoId?: string; // Si es a crédito
    anticipoMonto?: number; // Entrega inicial

    // Estado
    estado: EstadoPedido;

    // Envío/Entrega
    direccionEntrega?: string;
    fechaEntrega?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export interface ItemPedido {
    productoId: string;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

// ============================================
// CLIENTES (extensión)
// ============================================

export interface ClienteCredito {
    id: string;
    organizationId: string;

    // Datos básicos
    nombre: string;
    dni: string;
    email?: string;
    telefono?: string;
    direccion?: string;

    // Acceso portal
    tokenAcceso?: string; // Hash para magic link
    tokenExpira?: Date;

    // Scoring/Límite
    limiteCredito: number;
    creditoUtilizado: number;
    creditoDisponible: number;

    // Saldos denormalizados
    saldoDeudor: number; // Total de cuotas pendientes
    cuotasVencidas: number; // Cantidad

    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// PRODUCTOS (tienda)
// ============================================

export interface ProductoTienda {
    id: string;
    organizationId: string;

    nombre: string;
    descripcion: string;
    categoria: string;
    marca?: string;
    modelo?: string;

    // Precios
    precioContado: number;
    precioLista: number; // Para crédito

    // Stock
    stock: number;
    stockMinimo: number;

    // Media
    imagenes: string[];

    // Estado
    activo: boolean;
    destacado: boolean;

    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// CONFIGURACIÓN DE CRÉDITO
// ============================================

export interface ConfiguracionCredito {
    organizationId: string;

    // Tasas por plazo
    tasas: {
        cuotas: number;
        tasaMensual: number;
    }[];

    // Límites
    montoMinimoCredito: number;
    montoMaximoCredito: number;

    // Mora
    diasGraciaMora: number;
    tasaPunitoriaDiaria: number;

    updatedAt: Date;
}
