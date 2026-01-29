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
import type { DatosPagoDeuda, MedioPago } from '@/types/contabilidad-auto';

interface PagoDeudaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function PagoDeudaDialog({ open, onOpenChange, onSuccess }: PagoDeudaDialogProps) {
    const { organization } = useOrganization();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<DatosPagoDeuda>({
        terceroId: '',
        monto: 0,
        medioPago: 'efectivo',
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
            const operacionId = `pago-deuda-${Date.now()}`;

            await generarAsientoAutomatico(
                organization.id,
                'pago_deuda',
                formData,
                operacionId
            );

            toast({
                title: '✅ Pago de deuda registrado',
                description: `Se registró un pago de $${formData.monto.toLocaleString()}`,
            });

            // Reset form
            setFormData({
                terceroId: '',
                monto: 0,
                medioPago: 'efectivo',
                descripcion: '',
                fecha: new Date(),
            });

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error al registrar pago de deuda:', error);
            toast({
                title: 'Error',
                description: 'No se pudo registrar el pago',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
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
                    <DialogTitle className="text-xl">Pago de Deuda</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Cancelar deuda con proveedor
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
                                <SelectItem value="proveedor-1">Proveedor Ejemplo 1 (Debe: $10,000)</SelectItem>
                                <SelectItem value="proveedor-2">Proveedor Ejemplo 2 (Debe: $5,000)</SelectItem>
                                {/* TODO: Cargar proveedores con saldo desde Firestore */}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Monto */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Monto a Pagar *
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
                            placeholder="Ej: Pago parcial de factura #123"
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
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-blue-300 mb-2">
                            Preview del Asiento
                        </h4>
                        <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-300">
                                <span>Debe: Proveedores</span>
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
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrar Pago'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
