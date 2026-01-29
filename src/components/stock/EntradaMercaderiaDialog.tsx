'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { obtenerTerceros } from '@/services/accounting/terceros';
import { ProductService } from '@/services/products';
import { registrarEntradaMercaderia } from '@/services/accounting/stock';
import type { Tercero } from '@/types/contabilidad-auto';
import type { Product } from '@/types/products';
import type { ItemFacturaCompra } from '@/types/stock';
import { Plus, Trash2, Package } from 'lucide-react';

interface EntradaMercaderiaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EntradaMercaderiaDialog({ open, onOpenChange, onSuccess }: EntradaMercaderiaDialogProps) {
    const router = useRouter();
    const { organization } = useOrganization();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [proveedores, setProveedores] = useState<Tercero[]>([]);
    const [productos, setProductos] = useState<Product[]>([]);

    const [formData, setFormData] = useState({
        proveedorId: '',
        numeroFactura: '',
        fecha: new Date(),
        observaciones: '',
    });

    const [items, setItems] = useState<ItemFacturaCompra[]>([]);
    const [currentItem, setCurrentItem] = useState({
        productoId: '',
        cantidad: 1,
        precioUnitario: 0,
    });

    useEffect(() => {
        if (organization?.id && open) {
            loadData();
        }
    }, [organization?.id, open]);

    const loadData = async () => {
        if (!organization?.id) return;

        try {
            const [proveedoresData, productosData] = await Promise.all([
                obtenerTerceros(organization.id, 'proveedor'),
                ProductService.getAll(organization.id),
            ]);
            setProveedores(proveedoresData);
            setProductos(productosData);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleAddItem = () => {
        if (!currentItem.productoId || currentItem.cantidad <= 0 || currentItem.precioUnitario <= 0) {
            toast({
                title: 'Error',
                description: 'Complete todos los campos del producto',
                variant: 'destructive',
            });
            return;
        }

        const producto = productos.find(p => p.id === currentItem.productoId);
        if (!producto) return;

        const newItem: ItemFacturaCompra = {
            productoId: currentItem.productoId,
            productoNombre: producto.nombre,
            cantidad: currentItem.cantidad,
            precioUnitario: currentItem.precioUnitario,
            subtotal: currentItem.cantidad * currentItem.precioUnitario,
        };

        setItems([...items, newItem]);
        setCurrentItem({ productoId: '', cantidad: 1, precioUnitario: 0 });
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

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

        if (items.length === 0) {
            toast({
                title: 'Error',
                description: 'Debe agregar al menos un producto',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const proveedor = proveedores.find(p => p.id === formData.proveedorId);
            if (!proveedor) throw new Error('Proveedor no encontrado');

            await registrarEntradaMercaderia(
                organization.id,
                {
                    ...formData,
                    items,
                },
                proveedor.nombre
            );

            toast({
                title: '✅ Entrada de mercadería registrada',
                description: `Se registraron ${items.length} productos`,
            });

            // Reset
            setFormData({
                proveedorId: '',
                numeroFactura: '',
                fecha: new Date(),
                observaciones: '',
            });
            setItems([]);

            onOpenChange(false);
            onSuccess?.();
            router.push('/movimientos');
        } catch (error) {
            console.error('Error al registrar entrada:', error);
            toast({
                title: 'Error',
                description: 'No se pudo registrar la entrada de mercadería',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Entrada de Mercadería
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Registrar compra de electrodomésticos con detalle de productos
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Datos de la Factura */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Proveedor *
                            </label>
                            <Select
                                value={formData.proveedorId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, proveedorId: value })
                                }
                            >
                                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                    <SelectValue placeholder="Seleccionar proveedor" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {proveedores.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Número de Factura *
                            </label>
                            <Input
                                type="text"
                                value={formData.numeroFactura}
                                onChange={(e) =>
                                    setFormData({ ...formData, numeroFactura: e.target.value })
                                }
                                required
                                className="bg-slate-700/50 border-slate-600 text-white"
                                placeholder="Ej: 0001-00001234"
                            />
                        </div>

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
                    </div>

                    {/* Agregar Productos */}
                    <div className="border border-slate-700 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-slate-300 mb-3">
                            Agregar Productos
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            <div className="col-span-2">
                                <Select
                                    value={currentItem.productoId}
                                    onValueChange={(value) => {
                                        const producto = productos.find(p => p.id === value);
                                        setCurrentItem({
                                            ...currentItem,
                                            productoId: value,
                                            precioUnitario: producto?.costo || 0,
                                        });
                                    }}
                                >
                                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                        <SelectValue placeholder="Producto" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {productos.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.nombre} (Stock: {p.stock})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Input
                                type="number"
                                min="1"
                                value={currentItem.cantidad}
                                onChange={(e) =>
                                    setCurrentItem({ ...currentItem, cantidad: parseInt(e.target.value) || 1 })
                                }
                                className="bg-slate-700/50 border-slate-600 text-white"
                                placeholder="Cant."
                            />
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={currentItem.precioUnitario}
                                    onChange={(e) =>
                                        setCurrentItem({ ...currentItem, precioUnitario: parseFloat(e.target.value) || 0 })
                                    }
                                    className="bg-slate-700/50 border-slate-600 text-white"
                                    placeholder="Precio"
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddItem}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Productos */}
                    {items.length > 0 && (
                        <div className="border border-slate-700 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800">
                                    <tr>
                                        <th className="text-left p-2 text-slate-300">Producto</th>
                                        <th className="text-right p-2 text-slate-300">Cant.</th>
                                        <th className="text-right p-2 text-slate-300">Precio Unit.</th>
                                        <th className="text-right p-2 text-slate-300">Subtotal</th>
                                        <th className="text-right p-2 text-slate-300"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index} className="border-t border-slate-700">
                                            <td className="p-2 text-white">{item.productoNombre}</td>
                                            <td className="p-2 text-right text-slate-300">{item.cantidad}</td>
                                            <td className="p-2 text-right text-slate-300 font-mono">
                                                ${item.precioUnitario.toLocaleString()}
                                            </td>
                                            <td className="p-2 text-right text-white font-mono">
                                                ${item.subtotal.toLocaleString()}
                                            </td>
                                            <td className="p-2 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-800 font-semibold">
                                    <tr>
                                        <td colSpan={3} className="p-2 text-right text-slate-300">Subtotal:</td>
                                        <td className="p-2 text-right text-white font-mono">${subtotal.toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="p-2 text-right text-slate-300">IVA (21%):</td>
                                        <td className="p-2 text-right text-white font-mono">${iva.toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="p-2 text-right text-slate-300">TOTAL:</td>
                                        <td className="p-2 text-right text-green-400 font-mono text-lg">${total.toLocaleString()}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
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
                            disabled={loading || items.length === 0}
                        >
                            {loading ? 'Registrando...' : 'Registrar Entrada'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
