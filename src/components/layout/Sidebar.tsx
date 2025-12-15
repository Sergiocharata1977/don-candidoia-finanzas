'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  Kanban,
  Calculator,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface SidebarProps {
  children?: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  { href: '/roadmap', label: 'Roadmap', icon: <Kanban className="h-5 w-5" /> },
  {
    href: '/contabilidad',
    label: 'Contabilidad',
    icon: <Calculator className="h-5 w-5" />,
  },
  { href: '/team', label: 'Equipo', icon: <Users className="h-5 w-5" /> },
];

const bottomNavItems: NavItem[] = [
  {
    href: '/settings',
    label: 'Configuración',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { organization, organizations } = useOrganization();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white flex flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <span className="text-lg font-bold text-slate-900">
          {process.env.NEXT_PUBLIC_APP_NAME || 'Mi App'}
        </span>
      </div>

      {/* Organization Selector */}
      {organization && (
        <div className="border-b border-slate-200 p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-50 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {organization.name}
              </p>
              <p className="text-xs text-slate-500">
                {organizations.length} organización
                {organizations.length !== 1 ? 'es' : ''}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
              isActive(item.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-slate-100'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {children}

        <div className="my-4 border-t border-slate-200" />

        {bottomNavItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
              isActive(item.href)
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-700 hover:bg-slate-100'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Menu */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {user?.photoURL && (
              <AvatarImage src={user.photoURL} alt={user.displayName || ''} />
            )}
            <AvatarFallback>
              {getInitials(user?.displayName || user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {user?.displayName || 'Usuario'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
