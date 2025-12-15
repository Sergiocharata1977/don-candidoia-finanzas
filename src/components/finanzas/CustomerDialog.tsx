'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { Customer, CustomerFormData } from '@/types/finanzas';

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSave: (data: CustomerFormData) => Promise<void>;
}

const initialFormData: CustomerFormData = {
  organizationId: '',
  type: 'individual',
  name: '',
  document: '',
  taxCondition: 'consumidor_final',
  email: '',
  phone: '',
  address: '',
  hasCurrentAccount: false,
  creditLimit: 0,
  hasCard: false,
  active: true,
};

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerDialogProps) {
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setFormData({
        organizationId: customer.organizationId,
        type: customer.type,
        name: customer.name,
        document: customer.document,
        taxCondition: customer.taxCondition,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        hasCurrentAccount: customer.hasCurrentAccount,
        creditLimit: customer.creditLimit,
        hasCard: customer.hasCard,
        scoring: customer.scoring,
        active: customer.active,
      });
    } else {
      setFormData(initialFormData);
    }
    setError('');
  }, [customer, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo y Nombre */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'individual' | 'business') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="individual">Persona</SelectItem>
                  <SelectItem value="business">Empresa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">
                {formData.type === 'individual'
                  ? 'Nombre Completo'
                  : 'Razón Social'}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
          </div>

          {/* Documento y Condición Fiscal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document">
                {formData.type === 'individual' ? 'DNI' : 'CUIT'}
              </Label>
              <Input
                id="document"
                value={formData.document}
                onChange={e =>
                  setFormData({ ...formData, document: e.target.value })
                }
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxCondition">Condición Fiscal</Label>
              <Select
                value={formData.taxCondition}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    taxCondition: value as CustomerFormData['taxCondition'],
                  })
                }
              >
                <SelectTrigger className="bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="consumidor_final">
                    Consumidor Final
                  </SelectItem>
                  <SelectItem value="monotributo">Monotributo</SelectItem>
                  <SelectItem value="responsable_inscripto">
                    Responsable Inscripto
                  </SelectItem>
                  <SelectItem value="exento">Exento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={e =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="bg-slate-800 border-slate-700"
            />
          </div>

          {/* Cuenta Corriente */}
          <div className="rounded-lg border border-slate-700 p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasCurrentAccount"
                checked={formData.hasCurrentAccount}
                onCheckedChange={checked =>
                  setFormData({
                    ...formData,
                    hasCurrentAccount: checked === true,
                  })
                }
              />
              <Label htmlFor="hasCurrentAccount" className="font-medium">
                Habilitar Cuenta Corriente
              </Label>
            </div>

            {formData.hasCurrentAccount && (
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Límite de Crédito ($)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.creditLimit}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      creditLimit: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? 'Guardando...' : customer ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
