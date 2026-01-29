// Product Types for Don Cándido Finanzas
export interface Product {
  id: string;
  codigo: string; // SKU/Código interno
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio: number;
  costo?: number; // Costo de adquisición
  stock: number;
  stockMinimo?: number;
  unidadMedida: 'unidad' | 'kg' | 'litro' | 'metro' | 'caja' | 'pack';
  activo: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  organizationId: string;
}

export interface ProductFormData {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio: number;
  costo?: number;
  stock: number;
  stockMinimo?: number;
  unidadMedida: 'unidad' | 'kg' | 'litro' | 'metro' | 'caja' | 'pack';
  activo: boolean;
}

export interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  organizationId: string;
}
