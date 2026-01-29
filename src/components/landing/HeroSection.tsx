import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, ShieldCheck } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="container relative mx-auto px-4 text-center z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-sm text-emerald-400 mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Sistema de Gestión Financiera Inteligente
                </div>

                {/* Headlines */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white max-w-4xl mx-auto leading-tight">
                    Gestión Contable <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Automática</span> para tu Negocio de Electrodomésticos
                </h1>

                <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Olvídate de la contabilidad manual. Don Cándido Finanzas genera tus asientos contables automáticamente mientras gestionas tu negocio.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <Link href="/register">
                        <Button size="lg" className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-lg rounded-full shadow-lg shadow-emerald-900/20 w-full sm:w-auto">
                            Comenzar Gratis <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/demo">
                        <Button size="lg" variant="outline" className="h-12 px-8 border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-lg rounded-full w-full sm:w-auto">
                            <Play className="mr-2 h-4 w-4 fill-current" /> Ver Demo
                        </Button>
                    </Link>
                </div>

                {/* Feature Highlights (Mini) */}
                <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        <span>Doble Partida Automática</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        <span>Control de Stock</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        <span>Multi-Organización</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
