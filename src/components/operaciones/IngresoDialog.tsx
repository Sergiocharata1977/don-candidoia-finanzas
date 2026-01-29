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
import type { DatosIngresoDinero, MedioPago, CategoriaIngreso } from '@/types/contabilidad-auto';

interface IngresoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function IngresoDialog({ open, onOpenChange, onSuccess }: IngresoDialogProps) {
    const { organization } = useOrganization();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<DatosIngresoDinero>({
        monto: 0,
        medioPago: 'efectivo',
        categoria: 'ventas',
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
            const operacionId = `ingreso-${Date.now()}`;

            await generarAsientoAutomatico(
                organization.id,
                'ingreso_dinero',
                formData,
                operacionId
            );

            toast({
                title: '✅ Ingreso registrado',
                description: `Se registró un ingreso de $${formData.monto.toLocaleString()}`,
            });

            // Reset form
            setFormData({
                monto: 0,
                medioPago: 'efectivo',
                categoria: 'ventas',
                descripcion: '',
                fecha: new Date(),
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error al registrar ingreso:', error);
            toast({
                title: 'Error',
                description: 'No se pudo registrar el ingreso',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Registrar Ingreso</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Cobros, ventas y otros ingresos
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            className="bg-slate-700/50 border-slate-600 text-white text-lg"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Medio de Pago */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Medio de Pago *
                        </label>
                        <Select
                            value={formData.medioPago}
                            onValueChange={(value) =>
                                setFormData({ ...formData, medioPago: value as MedioPago })
                            }
                        >
                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="efectivo">Efectivo</SelectItem>
                                <SelectItem value="transferencia">Transferencia</SelectItem>
                                <SelectItem value="cheque">Cheque</SelectItem>
                                <SelectItem value="tarjeta">Tarjeta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Categoría *
                        </label>
                        <Select
                            value={formData.categoria}
                            onValueChange={(value) =>
                                setFormData({ ...formData, categoria: value as CategoriaIngreso })
                            }
                        >
                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="ventas">Ventas</SelectItem>
                                <SelectItem value="servicios">Servicios</SelectItem>
                                <SelectItem value="otros_ingresos">Otros Ingresos</SelectItem>
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
                            placeholder="Ej: Venta de producto X"
                            rows={3}
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
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-blue-300 mb-2">
                            Preview del Asiento Contable
                        </h4>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-300">
                                <span>Debe: {formData.medioPago === 'efectivo' ? 'Caja' : 'Bancos'}</span>
                                <span className="font-mono text-green-400">
                                    ${formData.monto.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>
                                    Haber: {formData.categoria === 'ventas' ? 'Ventas de Productos' :
                                        formData.categoria === 'servicios' ? 'Servicios' : 'Otros Ingresos'}
                                </span>
                                <span className="font-mono text-red-400">
                                    ${formData.monto.toLocaleString()}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-blue-700/50 flex justify-between font-semibold text-white">
                                <span>Total</span>
                                <span>
                                    Debe: ${formData.monto.toLocaleString()} = Haber: ${formData.monto.toLocaleString()}
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
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrar Ingreso'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
