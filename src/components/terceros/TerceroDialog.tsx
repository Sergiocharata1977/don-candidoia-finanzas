'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { crearTercero, actualizarTercero } from '@/services/accounting/terceros';
import type { Tercero, TipoTercero } from '@/types/contabilidad-auto';

interface TerceroDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tercero?: Tercero;
    onSuccess?: () => void;
}

export function TerceroDialog({ open, onOpenChange, tercero, onSuccess }: TerceroDialogProps) {
    const { organization } = useOrganization();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        documento: '',
        tipo: 'cliente' as TipoTercero,
        email: '',
        telefono: '',
        direccion: '',
    });

    useEffect(() => {
        if (tercero) {
            setFormData({
                nombre: tercero.nombre,
                documento: tercero.documento,
                tipo: tercero.tipo,
                email: tercero.email || '',
                telefono: tercero.telefono || '',
                direccion: tercero.direccion || '',
            });
        } else {
            setFormData({
                nombre: '',
                documento: '',
                tipo: 'cliente',
                email: '',
                telefono: '',
                direccion: '',
            });
        }
    }, [tercero, open]);

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

        setLoading(true);

        try {
            if (tercero) {
                // Actualizar
                await actualizarTercero(organization.id, tercero.id, formData);
                toast({
                    title: '✅ Tercero actualizado',
                    description: `Se actualizó ${formData.nombre}`,
                });
            } else {
                // Crear
                await crearTercero(organization.id, {
                    ...formData,
                    activo: true,
                });
                toast({
                    title: '✅ Tercero creado',
                    description: `Se creó ${formData.nombre}`,
                });
            }

            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error('Error saving tercero:', error);
            toast({
                title: 'Error',
                description: 'No se pudo guardar el tercero',
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
                    <DialogTitle className="text-xl">
                        {tercero ? 'Editar Tercero' : 'Nuevo Tercero'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {tercero ? 'Modificar datos del tercero' : 'Registrar nuevo cliente o proveedor'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Nombre / Razón Social *
                        </label>
                        <Input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) =>
                                setFormData({ ...formData, nombre: e.target.value })
                            }
                            required
                            className="bg-slate-700/50 border-slate-600 text-white"
                            placeholder="Ej: Juan Pérez / Electrodomésticos SA"
                        />
                    </div>

                    {/* Documento */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            DNI / CUIT *
                        </label>
                        <Input
                            type="text"
                            value={formData.documento}
                            onChange={(e) =>
                                setFormData({ ...formData, documento: e.target.value })
                            }
                            required
                            className="bg-slate-700/50 border-slate-600 text-white"
                            placeholder="Ej: 20-12345678-9"
                        />
                    </div>

                    {/* Tipo */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Tipo *
                        </label>
                        <Select
                            value={formData.tipo}
                            onValueChange={(value) =>
                                setFormData({ ...formData, tipo: value as TipoTercero })
                            }
                        >
                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="cliente">Cliente</SelectItem>
                                <SelectItem value="proveedor">Proveedor</SelectItem>
                                <SelectItem value="ambos">Ambos (Cliente y Proveedor)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Email
                        </label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            className="bg-slate-700/50 border-slate-600 text-white"
                            placeholder="email@ejemplo.com"
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Teléfono
                        </label>
                        <Input
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) =>
                                setFormData({ ...formData, telefono: e.target.value })
                            }
                            className="bg-slate-700/50 border-slate-600 text-white"
                            placeholder="Ej: +54 9 11 1234-5678"
                        />
                    </div>

                    {/* Dirección */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Dirección
                        </label>
                        <Input
                            type="text"
                            value={formData.direccion}
                            onChange={(e) =>
                                setFormData({ ...formData, direccion: e.target.value })
                            }
                            className="bg-slate-700/50 border-slate-600 text-white"
                            placeholder="Ej: Av. Corrientes 1234, CABA"
                        />
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
                            {loading ? 'Guardando...' : tercero ? 'Actualizar' : 'Crear Tercero'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
