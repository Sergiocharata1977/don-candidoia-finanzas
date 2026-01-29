import {
    Calculator,
    Package,
    Users,
    Wallet,
    Building2,
    FileCheck,
} from 'lucide-react';

const features = [
    {
        icon: Calculator,
        title: 'Contabilidad Automática',
        description:
            'Registra tus ventas y gastos en formularios simples. El sistema genera los asientos de doble partida automáticamente.',
    },
    {
        icon: Package,
        title: 'Control de Stock',
        description:
            'Registra entradas y salidas de mercadería automáticamente. Cada compra actualiza tu stock y genera los asientos.',
    },
    {
        icon: Users,
        title: 'Terceros',
        description:
            'Gestión integral de clientes y proveedores. Los saldos de cuentas corrientes se actualizan con cada operación.',
    },
    {
        icon: Wallet,
        title: 'Caja y Bancos',
        description:
            'Seguimiento en tiempo real de todos tus movimientos de dinero, transferencias y saldos de cuentas.',
    },
    {
        icon: Building2,
        title: 'Multi-Empresa',
        description:
            'Gestiona múltiples negocios desde una sola cuenta. Ideal para contadores y dueños de varias sucursales.',
    },
    {
        icon: FileCheck,
        title: 'Trazabilidad Total',
        description:
            'Cada asiento contable está vinculado a su operación original. Auditoría completa de cada movimiento.',
    },
];

export function FeatureSection() {
    return (
        <section id="features" className="py-24 bg-slate-900 border-y border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Todo lo que Necesitas en un Solo Sistema
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Don Cándido Finanzas automatiza las tareas complejas para que te enfoques en crecer.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="p-8 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300 group"
                        >
                            <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-6 border border-slate-800 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/50 transition-colors">
                                <feature.icon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
