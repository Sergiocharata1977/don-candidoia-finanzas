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
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-8 text-foreground bg-background min-h-screen">
        <h2 className="text-2xl font-bold">Sin Organización</h2>
        <p>Por favor selecciona o crea una organización.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-foreground bg-background min-h-screen">
        No data available or error loading stats.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-background min-h-screen">
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
