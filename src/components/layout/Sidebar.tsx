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
import React, { memo, useCallback, useEffect, useState } from 'react';

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
      { name: 'Caja', href: '/dashboard/caja', icon: Wallet },
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
      return false;
    },
    [pathname]
  );

  return (
    <div
      className={`transition-[width] duration-300 ease-in-out flex-shrink-0 ${collapsed ? 'w-20' : 'w-72'}`}
    >
      <div
        className={`sidebar-container bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/50 text-slate-300 h-screen flex flex-col transition-all duration-300 ease-in-out fixed top-0 left-0 z-50 ${collapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            {!collapsed && <span className="font-bold text-white text-lg tracking-tight">Don Cándido</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide space-y-1.5">
          {navigation.map(item => {
            const isActive = isMenuActive(item);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenus.has(item.name);

            return (
              <div key={item.name}>
                {hasChildren ? (
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                          ? 'bg-blue-600/10 text-blue-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                      <SafeIcon
                        Icon={item.icon}
                        className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-blue-500' : ''}`}
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
                    {/* Submenu */}
                    {hasChildren && isExpanded && !collapsed && (
                      <div className="ml-4 pl-4 border-l border-slate-800 space-y-1 animate-in slide-in-from-top-2 duration-200">
                        {item.children!.map(child => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={`group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${isChildActive
                                  ? 'bg-blue-600/20 text-blue-300'
                                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
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
                ) : (
                  <Link
                    href={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                  >
                    <SafeIcon
                      Icon={item.icon}
                      className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5 flex-shrink-0`}
                      isMounted={isMounted}
                    />
                    {!collapsed && item.name}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-white truncate">
                  {user?.displayName || 'Usuario'}
                </p>
                <p className="text-xs text-slate-500 truncate font-mono">{user?.email}</p>
              </div>
            )}
            {!collapsed && <ChevronRight className="h-4 w-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </div>
  );
});
