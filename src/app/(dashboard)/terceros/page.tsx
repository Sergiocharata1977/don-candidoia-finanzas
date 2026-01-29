'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Users, Plus, Pencil, Trash2 } from 'lucide-react';
import { obtenerTerceros, desactivarTercero } from '@/services/accounting/terceros';
import type { Tercero } from '@/types/contabilidad-auto';
import { TerceroDialog } from '@/components/terceros/TerceroDialog';

export default function TercerosPage() {
    const { organization } = useOrganization();
    const [terceros, setTerceros] = useState<Tercero[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTercero, setSelectedTercero] = useState<Tercero | undefined>();

    useEffect(() => {
        if (organization?.id) {
            loadTerceros();
        }
    }, [organization?.id]);

    const loadTerceros = async () => {
        if (!organization?.id) return;

        try {
            setLoading(true);
            const data = await obtenerTerceros(organization.id);
            setTerceros(data);
        } catch (error) {
            console.error('Error loading terceros:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!organization?.id) return;
        if (!confirm('¿Estás seguro de eliminar este tercero?')) return;

        try {
            await desactivarTercero(organization.id, id);
            await loadTerceros();
        } catch (error) {
            console.error('Error deleting tercero:', error);
        }
    };

    const handleEdit = (tercero: Tercero) => {
        setSelectedTercero(tercero);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setSelectedTercero(undefined);
        setDialogOpen(true);
    };

    const filteredTerceros = terceros.filter(
        (t) =>
            t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.documento.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(value);
    };

    const getTipoLabel = (tipo: string) => {
        const labels: Record<string, string> = {
            cliente: 'Cliente',
            proveedor: 'Proveedor',
            ambos: 'Ambos',
        };
        return labels[tipo] || tipo;
    };

    const getTipoBadge = (tipo: string) => {
        const colors: Record<string, string> = {
            cliente: 'bg-blue-100 text-blue-700',
            proveedor: 'bg-orange-100 text-orange-700',
            ambos: 'bg-purple-100 text-purple-700',
        };
        return colors[tipo] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Terceros</h1>
                        <p className="text-slate-400">Gestión de clientes y proveedores</p>
                    </div>
                </div>
                <Button
                    onClick={handleNew}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Tercero
                </Button>
            </div>

            {/* Search */}
            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Buscar por nombre o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md bg-slate-800/50 border-slate-700 text-white"
                />
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-400">Cargando terceros...</div>
                </div>
            ) : filteredTerceros.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-700 rounded-lg">
                    <Users className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 font-medium">No hay terceros registrados</p>
                    <p className="text-slate-500 text-sm mt-1">
                        Crea tu primer cliente o proveedor
                    </p>
                </div>
            ) : (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-700 hover:bg-slate-800/50">
                                <TableHead className="text-slate-300">Nombre</TableHead>
                                <TableHead className="text-slate-300">Documento</TableHead>
                                <TableHead className="text-slate-300">Tipo</TableHead>
                                <TableHead className="text-slate-300 text-right">Saldo Cliente</TableHead>
                                <TableHead className="text-slate-300 text-right">Saldo Proveedor</TableHead>
                                <TableHead className="text-slate-300 text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTerceros.map((tercero) => (
                                <TableRow
                                    key={tercero.id}
                                    className="border-slate-700 hover:bg-slate-800/50"
                                >
                                    <TableCell className="text-white font-medium">
                                        {tercero.nombre}
                                    </TableCell>
                                    <TableCell className="text-slate-300">
                                        {tercero.documento}
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoBadge(tercero.tipo)}`}
                                        >
                                            {getTipoLabel(tercero.tipo)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span
                                            className={`font-mono ${tercero.saldoCliente > 0 ? 'text-green-400' : 'text-slate-500'}`}
                                        >
                                            {formatCurrency(tercero.saldoCliente)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span
                                            className={`font-mono ${tercero.saldoProveedor > 0 ? 'text-red-400' : 'text-slate-500'}`}
                                        >
                                            {formatCurrency(tercero.saldoProveedor)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(tercero)}
                                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(tercero.id)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Dialog */}
            <TerceroDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                tercero={selectedTercero}
                onSuccess={loadTerceros}
            />
        </div>
    );
}
