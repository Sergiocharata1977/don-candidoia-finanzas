'use client';

import Logo from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  FileText,
  Home,
  Kanban,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
  feature?: string;
  children?: MenuItem[];
}

const navigation: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },

  // ===== Retail =====
  {
    name: 'Retail',
    href: '/dashboard/retail',
    icon: Store,
    children: [
      { name: 'Productos', href: '/dashboard/productos', icon: Package },
      { name: 'Ventas (POS)', href: '/dashboard/ventas', icon: ShoppingCart },
      { name: 'Caja', href: '/dashboard/caja', icon: Wallet }, // Using Wallet as placeholder for Cashbox
    ],
  },

  // ===== Clientes & Cuentas =====
  {
    name: 'Clientes',
    href: '/clientes',
    icon: Users,
    children: [
      { name: 'Directorio', href: '/clientes', icon: Users },
      { name: 'Cuentas Corrientes', href: '/cuentas', icon: FileText },
    ],
  },

  // ===== Tarjetas de Crédito =====
  {
    name: 'Tarjetas',
    href: '/tarjetas',
    icon: CreditCard,
    children: [
      { name: 'Resumen', href: '/tarjetas/resumen', icon: BarChart3 },
      { name: 'Plásticos', href: '/tarjetas/plasticos', icon: CreditCard },
      {
        name: 'Liquidaciones',
        href: '/tarjetas/liquidaciones',
        icon: FileText,
      },
    ],
  },

  // ===== Gestión =====
  { name: 'Roadmap', href: '/roadmap', icon: Kanban },
  { name: 'Contabilidad', href: '/contabilidad', icon: FileText },
  { name: 'Calendario', href: '/calendario', icon: Calendar },

  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
    children: [
      { name: 'Organización', href: '/settings/organization', icon: Home },
      { name: 'Usuarios', href: '/settings/users', icon: Users },
    ],
  },
];

// Componente para renderizar iconos de manera segura
const SafeIcon = memo(
  ({
    Icon,
    className,
    isMounted,
  }: {
    Icon: React.ComponentType<{ className?: string }>;
    className?: string;
    isMounted: boolean;
  }) => {
    if (!isMounted) {
      return (
        <div
          className={className}
          style={{ width: '1.25rem', height: '1.25rem' }}
        />
      );
    }
    return <Icon className={className} />;
  }
);
SafeIcon.displayName = 'SafeIcon';

export const Sidebar = memo(function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    new Set(['Retail', 'Clientes'])
  );
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Evitar errores de hidratación renderizando solo en el cliente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Asegurar que los menús estén expandidos cuando se está en sus rutas
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.forEach(item => {
        if (
          item.children &&
          item.children.some(child => pathname.startsWith(child.href))
        ) {
          setExpandedMenus(prev => new Set([...prev, item.name]));
        }
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const toggleMenu = useCallback((menuName: string) => {
    requestAnimationFrame(() => {
      setExpandedMenus(prev => {
        const newSet = new Set(prev);
        if (newSet.has(menuName)) {
          newSet.delete(menuName);
        } else {
          newSet.add(menuName);
        }
        return newSet;
      });
    });
  }, []);

  const isMenuActive = useCallback(
    (item: MenuItem): boolean => {
      if (pathname === item.href) return true;
      if (item.children?.some(child => pathname === child.href)) return true;
      return false;
    },
    [pathname]
  );

  return (
    <div
      className={`transition-[width] duration-200 ease-in-out flex-shrink-0 ${collapsed ? 'w-24' : 'w-72'}`}
    >
      <div
        className={`sidebar-container bg-slate-800 text-white h-[calc(100vh-2rem)] flex flex-col transition-all duration-200 ease-in-out overflow-hidden mx-4 my-4 rounded-xl shadow-2xl ${collapsed ? 'w-16' : 'w-64'}`}
        style={{
          position: 'fixed',
          zIndex: 40,
        }}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-center min-h-[40px]">
            {collapsed ? (
              <Logo variant="light" size="sm" showText={false} />
            ) : (
              <Logo variant="light" size="sm" showText={true} />
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <div className="flex justify-end p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all"
          >
            {collapsed ? (
              <SafeIcon
                Icon={ChevronRight}
                className="h-4 w-4"
                isMounted={isMounted}
              />
            ) : (
              <SafeIcon
                Icon={ChevronLeft}
                className="h-4 w-4"
                isMounted={isMounted}
              />
            )}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide space-y-1">
          {navigation.map(item => {
            const isActive = isMenuActive(item);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.has(item.name);

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-400'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <SafeIcon
                      Icon={item.icon}
                      className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-500' : ''}`}
                      isMounted={isMounted}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.name}</span>
                        <SafeIcon
                          Icon={isExpanded ? ChevronUp : ChevronDown}
                          className="h-4 w-4 opacity-50"
                          isMounted={isMounted}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 shadow-md shadow-blue-900/20 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <SafeIcon
                      Icon={item.icon}
                      className={`${collapsed ? 'mr-0' : 'mr-3'} h-5 w-5 flex-shrink-0`}
                      isMounted={isMounted}
                    />
                    {!collapsed && item.name}
                  </Link>
                )}

                {/* Submenú */}
                {hasChildren && isExpanded && !collapsed && (
                  <div className="ml-4 mt-1 pl-4 border-l border-slate-700/50 space-y-1">
                    {item.children!.map(child => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            isChildActive
                              ? 'bg-blue-600/20 text-blue-100'
                              : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700/30'
                          }`}
                        >
                          <SafeIcon
                            Icon={child.icon}
                            className="mr-3 h-4 w-4 flex-shrink-0 opacity-70"
                            isMounted={isMounted}
                          />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        {!collapsed && (
          <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-slate-600">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.displayName || 'Usuario'}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
