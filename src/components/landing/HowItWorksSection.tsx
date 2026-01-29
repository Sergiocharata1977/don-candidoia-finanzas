import { ArrowRight, CheckCircle2 } from 'lucide-react';

const steps = [
    {
        number: '01',
        title: 'Registra tu Operación',
        description:
            'Completa un formulario simple: ¿Vendiste un producto? ¿Pagaste un gasto? Solo ingresa los datos básicos.',
    },
    {
        number: '02',
        title: 'El Sistema Procesa',
        description:
            'Calculamos automáticamente las cuentas contables, validamos la doble partida y actualizamos todos los saldos.',
    },
    {
        number: '03',
        title: 'Consulta tus Reportes',
        description:
            'Accede a tu historial de movimientos, saldos actualizados y reportes financieros en tiempo real.',
    },
];

export function HowItWorksSection() {
    return (
        <section id="how-it-works" className="py-24 bg-slate-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Tan Simple como 1-2-3
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        No necesitas ser contador para llevar tus cuentas en orden.
                    </p>
                </div>

                <div className="relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <div key={index} className="text-center">
                                <div className="w-24 h-24 bg-slate-900 border-2 border-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-black/50 relative group hover:border-emerald-500 transition-colors duration-300">
                                    <span className="text-3xl font-bold text-slate-700 group-hover:text-emerald-400 transition-colors">
                                        {step.number}
                                    </span>
                                    <div className="absolute inset-0 rounded-full bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
                        <h4 className="text-center text-lg font-semibold text-white mb-8">
                            Operaciones Soportadas
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                'Ingreso de Dinero',
                                'Gastos y Pagos',
                                'Entrada de Mercadería',
                                'Compra a Crédito',
                                'Pago de Deudas',
                                'Venta de Productos',
                                'Cobro de Clientes',
                                'Transferencias',
                            ].map((op) => (
                                <div key={op} className="flex items-center gap-2 text-slate-400 text-sm">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                    <span>{op}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
