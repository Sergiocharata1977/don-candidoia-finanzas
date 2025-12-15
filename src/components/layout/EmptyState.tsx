'use client';

import Link from 'next/link';
import { Home, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

/**
 * Empty state component for when there's no data
 *
 * @example
 * <EmptyState
 *   title="Sin tareas"
 *   description="No hay tareas para mostrar"
 *   action={{ label: "Crear tarea", onClick: () => setShowForm(true) }}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
        {icon || <FileQuestion className="h-8 w-8 text-slate-400" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 404 / Not Found component
 */
export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-6">
        <span className="text-4xl font-bold text-slate-400">404</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">
        Página no encontrada
      </h1>
      <p className="text-slate-500 mt-2 max-w-md">
        La página que buscas no existe o ha sido movida.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">
          <Home className="mr-2 h-4 w-4" />
          Ir al inicio
        </Link>
      </Button>
    </div>
  );
}
