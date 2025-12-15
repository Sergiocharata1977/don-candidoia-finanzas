// Accounting types - Based on sig-agro implementation

// Account types for Chart of Accounts
export type AccountType =
  | 'activo'
  | 'pasivo'
  | 'patrimonio'
  | 'ingreso'
  | 'gasto';
export type AccountNature = 'deudora' | 'acreedora';
export type Currency = 'ARS' | 'USD' | 'EUR';

export interface Account {
  id: string;
  orgId: string;
  codigo: string; // Account code, e.g., "1.1.01.001"
  nombre: string;
  tipo: AccountType;
  naturaleza: AccountNature;
  nivel: number; // Hierarchy level
  cuentaPadreId?: string; // Parent account ID
  admiteMovimientos: boolean; // Can have transactions
  esCuentaStock: boolean; // Is inventory account
  moneda: Currency;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Journal Entry types
export type JournalEntryType = 'apertura' | 'operativo' | 'ajuste' | 'cierre';
export type JournalEntryStatus = 'borrador' | 'contabilizado' | 'anulado';

export interface JournalEntryLine {
  cuentaId: string;
  cuentaNombre: string; // Denormalized for quick display
  debe: number; // Debit
  haber: number; // Credit
}

export interface JournalEntry {
  id: string;
  orgId: string;
  numero: number; // Sequential entry number
  fecha: Date;
  tipo: JournalEntryType;
  concepto: string; // Description
  lineas: JournalEntryLine[];
  totalDebe: number;
  totalHaber: number;
  estado: JournalEntryStatus;

  // Optional references
  referenceId?: string; // Reference to related document
  referenceType?: string; // Type of reference (invoice, order, etc.)

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Product/Inventory types
export type ProductCategory = 'insumo' | 'producto' | 'servicio' | 'otro';
export type UnitOfMeasure = 'kg' | 'lt' | 'un' | 'tn' | 'hr' | 'm2' | 'm3';

export interface Product {
  id: string;
  orgId: string;
  codigo: string; // SKU
  nombre: string;
  descripcion?: string;
  categoria: ProductCategory;
  unidadMedida: UnitOfMeasure;
  precioCompra: number;
  precioVenta: number;
  stockMinimo: number;
  stockActual: number; // Calculated/cached field
  cuentaStockId?: string; // Related asset account
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Stock Movement types
export type StockMovementType =
  | 'entrada_compra'
  | 'salida_venta'
  | 'salida_consumo'
  | 'ajuste_positivo'
  | 'ajuste_negativo';

export interface StockMovement {
  id: string;
  orgId: string;
  productId: string;
  productName: string; // Denormalized
  tipo: StockMovementType;
  cantidad: number;
  precioUnitario: number;
  total: number;

  // References
  journalEntryId?: string;
  referenceId?: string;
  referenceType?: string;

  observaciones?: string;
  fecha: Date;
  createdAt: Date;
  createdBy: string;
}

// Form data types
export interface CreateAccountData {
  codigo: string;
  nombre: string;
  tipo: AccountType;
  naturaleza: AccountNature;
  nivel?: number;
  cuentaPadreId?: string;
  admiteMovimientos?: boolean;
  esCuentaStock?: boolean;
  moneda?: Currency;
}

export interface CreateJournalEntryData {
  fecha: Date;
  tipo: JournalEntryType;
  concepto: string;
  lineas: JournalEntryLine[];
  referenceId?: string;
  referenceType?: string;
}

export interface CreateProductData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: ProductCategory;
  unidadMedida: UnitOfMeasure;
  precioCompra: number;
  precioVenta: number;
  stockMinimo?: number;
  cuentaStockId?: string;
}
