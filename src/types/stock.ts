/**
 * Tipos para Movimientos de Stock
 * Sistema de entrada/salida de mercadería
 */

export type TipoMovimientoStock = 'entrada_compra' | 'salida_venta' | 'ajuste';

export interface MovimientoStock {
    id: string;
    organizationId: string;
    productoId: string;
    productoNombre: string;
    tipo: TipoMovimientoStock;
    cantidad: number;
    precioUnitario: number;
    valorTotal: number;
    facturaId?: string;
    asientoId?: string;
    observaciones?: string;
    fecha: Date;
    createdAt: Date;
}

export interface FacturaCompra {
    id: string;
    organizationId: string;
    proveedorId: string;
    proveedorNombre: string;
    numeroFactura: string;
    fecha: Date;
    items: ItemFacturaCompra[];
    subtotal: number;
    iva: number;
    total: number;
    estado: 'pendiente' | 'pagada';
    asientoId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ItemFacturaCompra {
    productoId: string;
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface DatosEntradaMercaderia {
    proveedorId: string;
    numeroFactura: string;
    fecha: Date;
    items: ItemFacturaCompra[];
    observaciones?: string;
}
