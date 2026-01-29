'use client';

import { useState } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { useToast } from '@/hooks/use-toast';
import { generarAsientoAutomatico } from '@/services/accounting/asientos-auto';
import type { DatosCompraCredito, CategoriaGasto } from '@/types/contabilidad-auto';

interface CompraCreditoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}


export function CompraCreditoDialog({ open, onOpenChange, onSuccess }: CompraCreditoDialogProps) {
    const { organization } = useOrganization();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<DatosCompraCredito>({
        terceroId: '',
        monto: 0,
        categoria: 'compras',
        descripcion: '',
        fecha: new Date(),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!organization?.id) {
            toast({
                title: 'Error',
                description: 'No hay organización seleccionada',
                variant: 'destructive',
            });
            return;
        }

        if (!formData.terceroId) {
            toast({
                title: 'Error',
                description: 'Debe seleccionar un proveedor',
                variant: 'destructive',
            });
            return;
        }

        if (formData.monto <= 0) {
            toast({
                title: 'Error',
                description: 'El monto debe ser mayor a cero',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const operacionId = `compra-credito-${Date.now()}`;

            await generarAsientoAutomatico(
                organization.id,
                'compra_credito',
                formData,
                operacionId
            );

            toast({
                title: '✅ Compra a crédito registrada',
                description: `Se registró una compra de $${formData.monto.toLocaleString()}`,
            });

            // Reset form
            setFormData({
                terceroId: '',
                monto: 0,
                categoria: 'compras',
                descripcion: '',
                fecha: new Date(),
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error al registrar compra a crédito:', error);
            toast({
                title: 'Error',
                description: 'No se pudo registrar la compra',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const getCuentaGasto = () => {
        const cuentas: Record<CategoriaGasto, string> = {
            compras: 'Compras de Mercadería',
            servicios: 'Servicios',
            alquileres: 'Alquileres',
            gastos_varios: 'Gastos Varios',
        };
        return cuentas[formData.categoria];
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Compra a Crédito</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Registrar compra a proveedor sin pago inmediato
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Proveedor */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Proveedor *
                        </label>
                        <Select
                            value={formData.terceroId}
                            onValueChange={(value) =>
                                setFormData({ ...formData, terceroId: value })
                            }
                        >
                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="proveedor-1">Proveedor Ejemplo 1</SelectItem>
                                <SelectItem value="proveedor-2">Proveedor Ejemplo 2</SelectItem>
                                {/* TODO: Cargar proveedores reales desde Firestore */}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Monto */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Monto *
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={formData.monto || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })
                            }
                            required
                            className="bg-slate-700/50 border-slate-600 text-white"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Categoría *
                        </label>
                        <Select
                            value={formData.categoria}
                            onValueChange={(value) =>
                                setFormData({ ...formData, categoria: value as CategoriaGasto })
                            }
                        >
                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="compras">Compras de Mercadería</SelectItem>
                                <SelectItem value="servicios">Servicios</SelectItem>
                                <SelectItem value="alquileres">Alquileres</SelectItem>
                                <SelectItem value="gastos_varios">Gastos Varios</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Descripción *
                        </label>
                        <Textarea
                            value={formData.descripcion}
                            onChange={(e) =>
                                setFormData({ ...formData, descripcion: e.target.value })
                            }
                            required
                            className="bg-slate-700/50 border-slate-600 text-white"
                            placeholder="Ej: Compra de mercadería para stock"
                            rows={2}
                        />
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Fecha *
                        </label>
                        <Input
                            type="date"
                            value={formData.fecha.toISOString().split('T')[0]}
                            onChange={(e) =>
                                setFormData({ ...formData, fecha: new Date(e.target.value) })
                            }
                            required
                            className="bg-slate-700/50 border-slate-600 text-white"
                        />
                    </div>

                    {/* Preview del Asiento */}
                    <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-orange-300 mb-2">
                            Preview del Asiento
                        </h4>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-300">
                                <span>Debe: {getCuentaGasto()}</span>
                                <span className="font-mono text-red-400">
                                    ${formData.monto.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Haber: Proveedores</span>
                                <span className="font-mono text-green-400">
                                    ${formData.monto.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 border-slate-700 hover:bg-slate-800"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrar Compra'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
