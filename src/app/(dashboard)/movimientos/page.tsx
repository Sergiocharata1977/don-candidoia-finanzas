'use client';

import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { AsientoAutomatico } from '@/types/contabilidad-auto';
import { FileText, Calendar, DollarSign } from 'lucide-react';

export default function MovimientosPage() {
    const { organization } = useOrganization();
    const [asientos, setAsientos] = useState<AsientoAutomatico[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (organization?.id) {
            loadAsientos();
        }
    }, [organization?.id]);

    const loadAsientos = async () => {
        if (!organization?.id) return;

        try {
            setLoading(true);
            const asientosRef = collection(db, `organizations/${organization.id}/asientos_auto`);
            const q = query(asientosRef, orderBy('fecha', 'desc'), limit(50));
            const snapshot = await getDocs(q);

            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                fecha: doc.data().fecha?.toDate() || new Date(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            })) as AsientoAutomatico[];

            setAsientos(data);
        } catch (error) {
            console.error('Error loading asientos:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(value);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(date);
    };

    const getTipoOperacionLabel = (tipo: string) => {
        const labels: Record<string, string> = {
            ingreso_dinero: 'Ingreso de Dinero',
            gasto_pago: 'Gasto/Pago',
            compra_credito: 'Compra a Crédito',
            pago_deuda: 'Pago de Deuda',
            venta_producto: 'Venta de Producto',
            cobro_cliente: 'Cobro de Cliente',
            transferencia: 'Transferencia',
        };
        return labels[tipo] || tipo;
    };

    const getTipoOperacionColor = (tipo: string) => {
        const colors: Record<string, string> = {
            ingreso_dinero: 'bg-green-100 text-green-700',
            gasto_pago: 'bg-red-100 text-red-700',
            compra_credito: 'bg-orange-100 text-orange-700',
            pago_deuda: 'bg-blue-100 text-blue-700',
            venta_producto: 'bg-purple-100 text-purple-700',
            cobro_cliente: 'bg-teal-100 text-teal-700',
            transferencia: 'bg-gray-100 text-gray-700',
        };
        return colors[tipo] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Movimientos Contables</h1>
                        <p className="text-slate-400">Historial de asientos automáticos</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-400">Cargando movimientos...</div>
                </div>
            ) : asientos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-700 rounded-lg">
                    <FileText className="h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 font-medium">No hay movimientos registrados</p>
                    <p className="text-slate-500 text-sm mt-1">
                        Los asientos se generarán automáticamente al registrar operaciones
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {asientos.map((asiento) => (
                        <div
                            key={asiento.id}
                            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition-colors"
                        >
                            {/* Header del Asiento */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoOperacionColor(asiento.tipoOperacion)}`}
                                        >
                                            {getTipoOperacionLabel(asiento.tipoOperacion)}
                                        </span>
                                        <span className="text-slate-500 text-sm flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(asiento.fecha)}
                                        </span>
                                    </div>
                                    <p className="text-white font-medium">{asiento.descripcion}</p>
                                    {asiento.terceroNombre && (
                                        <p className="text-slate-400 text-sm mt-1">
                                            Tercero: {asiento.terceroNombre}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-slate-400 text-sm mb-1">Total</div>
                                    <div className="text-white font-bold text-lg flex items-center gap-1">
                                        <DollarSign className="h-4 w-4" />
                                        {formatCurrency(asiento.totalDebe)}
                                    </div>
                                </div>
                            </div>

                            {/* Líneas del Asiento */}
                            <div className="border-t border-slate-700 pt-4">
                                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-slate-400 mb-2">
                                    <div>Cuenta</div>
                                    <div className="text-right">Debe</div>
                                    <div className="text-right">Haber</div>
                                </div>
                                {asiento.lineas.map((linea, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-3 gap-4 text-sm py-2 border-t border-slate-800"
                                    >
                                        <div className="text-slate-300">{linea.cuentaNombre}</div>
                                        <div className="text-right">
                                            {linea.debe > 0 ? (
                                                <span className="text-green-400 font-mono">
                                                    {formatCurrency(linea.debe)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">-</span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            {linea.haber > 0 ? (
                                                <span className="text-red-400 font-mono">
                                                    {formatCurrency(linea.haber)}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600">-</span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Totales */}
                                <div className="grid grid-cols-3 gap-4 text-sm py-2 border-t border-slate-700 font-semibold text-white mt-2">
                                    <div>TOTALES</div>
                                    <div className="text-right text-green-400">
                                        {formatCurrency(asiento.totalDebe)}
                                    </div>
                                    <div className="text-right text-red-400">
                                        {formatCurrency(asiento.totalHaber)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
