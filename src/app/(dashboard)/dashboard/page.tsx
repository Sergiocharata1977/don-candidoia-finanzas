'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { getDashboardStats, DashboardStats } from '@/services/stats';

function DashboardContent() {
  const { user } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (organization?.id) {
        try {
          const data = await getDashboardStats(organization.id);
          setStats(data);
        } catch (error) {
          console.error("Error loading stats:", error);
        } finally {
          setLoadingStats(false);
        }
      } else if (!orgLoading && !organization) {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, [organization, orgLoading]);

  if (orgLoading || (loadingStats && organization)) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Sin Organización</h2>
          <p className="text-slate-400">
            No tienes ninguna organización activa. Por favor selecciona una existente o crea una nueva para comenzar a gestionar tus finanzas.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <button onClick={() => window.location.href = '/settings'} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20">
              Crear Organización
            </button>
            <button onClick={() => window.location.href = '/settings'} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors border border-slate-700">
              Gestionar mis Organizaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-slate-300 bg-slate-950 min-h-screen flex items-center justify-center">
        No hay datos disponibles o hubo un error al cargar las estadísticas.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-950 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Financiero</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">{organization.name}</span>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <SalesChart data={stats.incomeTrend} />
        </div>
        <div className="col-span-3">
          <CategoryChart data={stats.expenseByCategory} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
