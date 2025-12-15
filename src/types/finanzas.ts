// Types para Don Cándido Finanzas
// Sistema integrado de Retail + Tarjeta de Crédito

import { Timestamp } from 'firebase/firestore';

// ==========================================
// CLIENTES UNIFICADOS
// ==========================================

export interface Customer {
  id: string;
  organizationId: string;
  type: 'individual' | 'business';
  name: string;
  document: string; // DNI o CUIT
  taxCondition:
    | 'monotributo'
    | 'responsable_inscripto'
    | 'exento'
    | 'consumidor_final';
  email?: string;
  phone?: string;
  address?: string;

  // Retail - Cuenta Corriente
  hasCurrentAccount: boolean;
  creditLimit: number;

  // Tarjeta de Crédito
  hasCard: boolean;
  scoring?: number;

  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==========================================
// CUENTA CORRIENTE
// ==========================================

export interface CurrentAccount {
  id: string;
  customerId: string;
  organizationId: string;
  creditLimit: number;
  balance: number; // Positivo = debe, Negativo = a favor
  lastMovementDate: Timestamp;
  status: 'active' | 'blocked' | 'closed';
}

export interface AccountMovement {
  id: string;
  currentAccountId: string;
  customerId: string;
  organizationId: string;
  type: 'sale' | 'payment' | 'adjustment' | 'interest';
  amount: number; // Positivo = cargo, Negativo = abono
  balanceAfter: number;
  reference?: string;
  description: string;
  date: Timestamp;
  createdBy: string;
}

// ==========================================
// PRODUCTOS Y STOCK
// ==========================================

export interface Product {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost?: number;
  stock: number;
  minStock?: number;
  unit: 'unidad' | 'kg' | 'litro' | 'metro';
  active: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StockMovement {
  id: string;
  productId: string;
  organizationId: string;
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  reference?: string;
  description: string;
  date: Timestamp;
  createdBy: string;
}

// ==========================================
// VENTAS POS
// ==========================================

export interface Sale {
  id: string;
  organizationId: string;
  number: number;
  customerId?: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'current_account' | 'mixed';
  payments: Payment[];
  status: 'pending' | 'completed' | 'cancelled';
  date: Timestamp;
  createdBy: string;
}

export interface SaleItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Payment {
  method: 'cash' | 'card' | 'transfer' | 'current_account';
  amount: number;
  reference?: string;
}

// ==========================================
// TARJETA DE CRÉDITO - COMERCIOS
// ==========================================

export interface Merchant {
  id: string;
  organizationId: string;
  name: string;
  businessName: string;
  cuit: string;
  category: string;
  address?: string;
  phone?: string;
  email?: string;
  saleCommission: number; // % comisión por venta
  bonusCommission: number; // % si aceptan bonificación
  terminals: string[]; // IDs de terminales
  settlementDay: number; // Día del mes para liquidar
  bankAccount?: string;
  status: 'active' | 'suspended' | 'inactive';
  createdAt: Timestamp;
}

export interface Terminal {
  id: string;
  merchantId: string;
  organizationId: string;
  serialNumber: string;
  model: string;
  monthlyCost: number;
  activationCost: number;
  status: 'active' | 'inactive' | 'maintenance';
  installedAt: Timestamp;
}

// ==========================================
// TARJETA DE CRÉDITO - TARJETAS
// ==========================================

export interface Card {
  id: string;
  customerId: string;
  organizationId: string;
  cardNumber: string; // Últimos 4 dígitos visibles
  cardNumberHash: string; // Hash del número completo
  creditLimit: number;
  availableLimit: number;
  financingRate: number; // Tasa de financiamiento
  closingDay: number; // Día de cierre
  dueDay: number; // Día de vencimiento
  status: 'active' | 'blocked' | 'expired' | 'cancelled';
  issuedAt: Timestamp;
  expiresAt: Timestamp;
}

// ==========================================
// TARJETA DE CRÉDITO - TRANSACCIONES
// ==========================================

export interface CardTransaction {
  id: string;
  cardId: string;
  customerId: string;
  merchantId: string;
  terminalId: string;
  organizationId: string;
  amount: number;
  installments: number; // Cantidad de cuotas
  installmentAmount: number;
  interestRate: number;
  merchantCommission: number;
  authorizationCode: string;
  status: 'pending' | 'approved' | 'rejected' | 'reversed';
  date: Timestamp;
}

// ==========================================
// TARJETA DE CRÉDITO - ESTADOS DE CUENTA
// ==========================================

export interface CardStatement {
  id: string;
  cardId: string;
  customerId: string;
  organizationId: string;
  period: string; // "2024-12"
  previousBalance: number;
  purchases: number;
  payments: number;
  interests: number;
  currentBalance: number;
  minimumPayment: number;
  dueDate: Timestamp;
  status: 'open' | 'closed' | 'paid';
  generatedAt: Timestamp;
}

// ==========================================
// TARJETA DE CRÉDITO - LIQUIDACIONES
// ==========================================

export interface Settlement {
  id: string;
  merchantId: string;
  organizationId: string;
  periodFrom: Timestamp;
  periodTo: Timestamp;
  totalSales: number;
  totalCommission: number;
  netAmount: number; // totalSales - totalCommission
  transactionCount: number;
  paymentDate?: Timestamp;
  status: 'pending' | 'paid';
  createdAt: Timestamp;
}

// ==========================================
// TIPOS AUXILIARES
// ==========================================

export type CustomerFormData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type MerchantFormData = Omit<Merchant, 'id' | 'createdAt' | 'terminals'>;
