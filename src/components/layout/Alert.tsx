'use client';

import { AlertCircle, XCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: React.ReactNode }
> = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="h-5 w-5 text-blue-500" />,
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: <XCircle className="h-5 w-5 text-red-500" />,
  },
};

/**
 * Alert component for displaying messages
 *
 * @example
 * <Alert variant="error" title="Error">
 *   No se pudo guardar el registro.
 * </Alert>
 */
export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex gap-3 rounded-lg border p-4',
        styles.container,
        className
      )}
    >
      <div className="flex-shrink-0">{styles.icon}</div>
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        <div className={cn('text-sm', title && 'mt-1')}>{children}</div>
      </div>
    </div>
  );
}
