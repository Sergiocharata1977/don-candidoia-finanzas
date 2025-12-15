import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowRight,
  LayoutDashboard,
  Database,
  TrendingUp,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
          Hola Don Cándido Finanzas
        </h1>

        <p className="text-xl text-slate-400">
          Sistema Integrado de Retail, Cuentas Corrientes y Tarjetas de Crédito.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <LayoutDashboard className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Dashboard Unificado</h3>
            <p className="text-slate-400 text-sm">
              Gestión centralizada de todos los productos financieros.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <Database className="h-8 w-8 text-blue-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Clientes Únicos</h3>
            <p className="text-slate-400 text-sm">
              Base de datos compartida entre Retail y Crédito.
            </p>
          </div>
          <div className="p-6 rounded-lg border border-slate-800 bg-slate-900/50">
            <TrendingUp className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Finanzas</h3>
            <p className="text-slate-400 text-sm">
              Control de cuentas corrientes, límites y liquidaciones.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-8">
          <Link href="/dashboard">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Ir al Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
