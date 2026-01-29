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
import type { DatosGastoPago, MedioPago, CategoriaGasto } from '@/types/contabilidad-auto';

interface GastoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function GastoDialog({ open, onOpenChange, onSuccess }: GastoDialogProps) {
    const { organization } = useOrganization();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<DatosGastoPago>({
        monto: 0,
        medioPago: 'efectivo',
        categoria: 'gastos_varios',
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
            const operacionId = `gasto-${Date.now()}`;

            await generarAsientoAutomatico(
                organization.id,
                'gasto_pago',
                formData,
                operacionId
            );

            toast({
                title: '✅ Gasto registrado',
                description: `Se registró un gasto de $${formData.monto.toLocaleString()}`,
            });

            // Reset form
            setFormData({
                monto: 0,
                medioPago: 'efectivo',
                categoria: 'gastos_varios',
                descripcion: '',
                fecha: new Date(),
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error al registrar gasto:', error);
            toast({
                title: 'Error',
                description: 'No se pudo registrar el gasto',
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

    const getCuentaPago = () => {
        if (formData.medioPago === 'efectivo') return 'Caja';
        if (formData.medioPago === 'tarjeta') return 'Tarjetas de Crédito';
        return 'Bancos';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Registrar Gasto</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Pagos, compras y otros gastos
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
                                <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
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
                            placeholder="Ej: Pago de luz del mes"
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
                    <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-red-300 mb-2">
                            Preview del Asiento Contable
                        </h4>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-300">
                                <span>Debe: {getCuentaGasto()}</span>
                                <span className="font-mono text-red-400">
                                    ${formData.monto.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Haber: {getCuentaPago()}</span>
                                <span className="font-mono text-green-400">
                                    ${formData.monto.toLocaleString()}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-red-700/50 flex justify-between font-semibold text-white">
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
                            className="flex-1 bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrar Gasto'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
