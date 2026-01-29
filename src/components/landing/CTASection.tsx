import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Comienza a Simplificar tu Contabilidad Hoy
                </h2>
                <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                    Únete a los comerciantes que ya automatizaron su contabilidad y dedican más tiempo a hacer crecer su negocio.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register">
                        <Button size="lg" className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-full shadow-xl shadow-emerald-900/30 w-full sm:w-auto">
                            Crear Cuenta Gratis <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/demo">
                        <Button size="lg" variant="outline" className="h-14 px-8 border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-lg rounded-full w-full sm:w-auto">
                            Agendar una Demo
                        </Button>
                    </Link>
                </div>

                <p className="mt-8 text-sm text-slate-500">
                    Sin tarjeta de crédito requerida. Comienza en menos de 5 minutos.
                </p>
            </div>
        </section>
    );
}
