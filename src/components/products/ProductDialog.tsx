'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Product, ProductFormData } from '@/types/products';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (data: ProductFormData) => Promise<void>;
}

const CATEGORIAS = [
  'Alimentos',
  'Bebidas',
  'Limpieza',
  'Higiene Personal',
  'Electrónica',
  'Hogar',
  'Otros',
];

const UNIDADES = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'litro', label: 'Litro' },
  { value: 'metro', label: 'Metro' },
  { value: 'caja', label: 'Caja' },
  { value: 'pack', label: 'Pack' },
];

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    codigo: product?.codigo || '',
    nombre: product?.nombre || '',
    descripcion: product?.descripcion || '',
    categoria: product?.categoria || 'Otros',
    precio: product?.precio || 0,
    costo: product?.costo || 0,
    stock: product?.stock || 0,
    stockMinimo: product?.stockMinimo || 0,
    unidadMedida: product?.unidadMedida || 'unidad',
    activo: product?.activo ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(formData);
      onOpenChange(false);
      // Reset form
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        categoria: 'Otros',
        precio: 0,
        costo: 0,
        stock: 0,
        stockMinimo: 0,
        unidadMedida: 'unidad',
        activo: true,
      });
    } catch (error) {
      console.error('Error al guardar producto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
          <DialogDescription>
            Complete los datos del producto. Los campos marcados con * son
            obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="codigo">
                Código/SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={e =>
                  setFormData({ ...formData, codigo: e.target.value })
                }
                placeholder="Ej: PROD001"
                required
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.categoria}
                onValueChange={value =>
                  setFormData({ ...formData, categoria: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={e =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Nombre del producto"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={e =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Descripción opcional del producto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Precio */}
            <div className="space-y-2">
              <Label htmlFor="precio">
                Precio de Venta <span className="text-red-500">*</span>
              </Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={e =>
                  setFormData({
                    ...formData,
                    precio: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            {/* Costo */}
            <div className="space-y-2">
              <Label htmlFor="costo">Costo</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                min="0"
                value={formData.costo}
                onChange={e =>
                  setFormData({
                    ...formData,
                    costo: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Stock */}
            <div className="space-y-2">
              <Label htmlFor="stock">
                Stock <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={e =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            {/* Stock Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="stockMinimo">Stock Mínimo</Label>
              <Input
                id="stockMinimo"
                type="number"
                min="0"
                value={formData.stockMinimo}
                onChange={e =>
                  setFormData({
                    ...formData,
                    stockMinimo: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Unidad de Medida */}
            <div className="space-y-2">
              <Label htmlFor="unidadMedida">Unidad</Label>
              <Select
                value={formData.unidadMedida}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, unidadMedida: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES.map(unidad => (
                    <SelectItem key={unidad.value} value={unidad.value}>
                      {unidad.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
