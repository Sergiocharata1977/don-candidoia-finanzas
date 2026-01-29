'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    DollarSign,
    CreditCard,
    ShoppingCart,
    Users,
    ArrowRightLeft,
    TrendingUp,
    TrendingDown,
    Package
} from 'lucide-react';
import { CompraCreditoDialog } from '@/components/operaciones/CompraCreditoDialog';
import { PagoDeudaDialog } from '@/components/operaciones/PagoDeudaDialog';
import { EntradaMercaderiaDialog } from '@/components/stock/EntradaMercaderiaDialog';
import { IngresoDialog } from '@/components/operaciones/IngresoDialog';
import { GastoDialog } from '@/components/operaciones/GastoDialog';

export default function OperacionesPage() {
    const router = useRouter();
    const [compraCreditoOpen, setCompraCreditoOpen] = useState(false);
    const [pagoDeudaOpen, setPagoDeudaOpen] = useState(false);
    const [entradaMercaderiaOpen, setEntradaMercaderiaOpen] = useState(false);
    const [ingresoOpen, setIngresoOpen] = useState(false);
    const [gastoOpen, setGastoOpen] = useState(false);

    const operaciones = [
        {
            id: 'ingreso',
            titulo: 'Ingreso de Dinero',
            descripcion: 'Registrar cobros, ventas y otros ingresos',
            icon: DollarSign,
            color: 'bg-green-100 text-green-600 hover:bg-green-200',
            borderColor: 'border-green-200',
            href: undefined,
            useModal: true,
            onClick: () => setIngresoOpen(true),
        },
        {
            id: 'gasto',
            titulo: 'Gasto/Pago',
            descripcion: 'Registrar pagos, compras y otros gastos',
            icon: CreditCard,
            color: 'bg-red-100 text-red-600 hover:bg-red-200',
            borderColor: 'border-red-200',
            href: undefined,
            useModal: true,
            onClick: () => setGastoOpen(true),
        },
        {
            id: 'entrada-mercaderia',
            titulo: 'Entrada de Mercadería',
            descripcion: 'Compra de electrodomésticos con detalle',
            icon: Package,
            color: 'bg-green-100 text-green-600 hover:bg-green-200',
            borderColor: 'border-green-200',
            useModal: true,
            onClick: () => setEntradaMercaderiaOpen(true),
        },
        {
            id: 'compra-credito',
            titulo: 'Compra a Crédito',
            descripcion: 'Compra a proveedor sin pago inmediato',
            icon: ShoppingCart,
            color: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
            borderColor: 'border-orange-200',
            useModal: true,
            onClick: () => setCompraCreditoOpen(true),
        },
        {
            id: 'pago-deuda',
            titulo: 'Pago de Deuda',
            descripcion: 'Cancelar deuda con proveedor',
            icon: TrendingDown,
            color: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
            borderColor: 'border-blue-200',
            useModal: true,
            onClick: () => setPagoDeudaOpen(true),
        },
        {
            id: 'venta',
            titulo: 'Venta de Producto',
            descripcion: 'Venta con cuenta corriente a cliente',
            icon: TrendingUp,
            color: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
            borderColor: 'border-purple-200',
            disabled: true,
        },
        {
            id: 'cobro',
            titulo: 'Cobro de Cliente',
            descripcion: 'Cobrar cuenta corriente de cliente',
            icon: Users,
            color: 'bg-teal-100 text-teal-600 hover:bg-teal-200',
            borderColor: 'border-teal-200',
            disabled: true,
        },
        {
            id: 'transferencia',
            titulo: 'Transferencia',
            descripcion: 'Entre cuentas propias (caja/bancos)',
            icon: ArrowRightLeft,
            color: 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            borderColor: 'border-gray-200',
            disabled: true,
        },
    ];

    const handleOperacionClick = (op: typeof operaciones[0]) => {
        if (op.disabled) return;
        if (op.useModal && op.onClick) {
            op.onClick();
        } else if (op.href) {
            router.push(op.href);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Operaciones</h1>
                <p className="text-slate-400">
                    Selecciona el tipo de operación que deseas registrar
                </p>
            </div>

            {/* Grid de Operaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {operaciones.map((op) => {
                    const Icon = op.icon;
                    return (
                        <button
                            key={op.id}
                            onClick={() => handleOperacionClick(op)}
                            disabled={op.disabled}
                            className={`
                relative p-6 rounded-xl border-2 transition-all text-left
                ${op.disabled
                                    ? 'bg-slate-800/30 border-slate-700/50 cursor-not-allowed opacity-50'
                                    : `bg-slate-800/50 ${op.borderColor} hover:scale-105 cursor-pointer`
                                }
              `}
                        >
                            {op.disabled && (
                                <div className="absolute top-3 right-3 px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
                                    Próximamente
                                </div>
                            )}

                            <div className={`
                inline-flex p-3 rounded-lg mb-4 transition-colors
                ${op.disabled ? 'bg-slate-700/50 text-slate-500' : op.color}
              `}>
                                <Icon className="h-6 w-6" />
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-2">
                                {op.titulo}
                            </h3>

                            <p className="text-sm text-slate-400">
                                {op.descripcion}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Info */}
            <div className="mt-8 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <p className="text-sm text-blue-300">
                    💡 <strong>Tip:</strong> Cada operación genera automáticamente el asiento contable correspondiente.
                    No necesitas conocimientos de contabilidad.
                </p>
            </div>

            {/* Modales */}
            <CompraCreditoDialog
                open={compraCreditoOpen}
                onOpenChange={setCompraCreditoOpen}
                onSuccess={() => router.push('/movimientos')}
            />

            <PagoDeudaDialog
                open={pagoDeudaOpen}
                onOpenChange={setPagoDeudaOpen}
                onSuccess={() => router.push('/movimientos')}
            />

            <EntradaMercaderiaDialog
                open={entradaMercaderiaOpen}
                onOpenChange={setEntradaMercaderiaOpen}
                onSuccess={() => router.push('/movimientos')}
            />
        </div>
    );
}
