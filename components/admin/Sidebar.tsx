'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Truck,
  Users,
  MapPin,
  CreditCard,
  Ticket,
  Star,
  BarChart3,
  MessageSquare,
  Building2,
  Settings,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Gem,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { storeProfile } = useStore();

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Ready to Ship', href: '/admin/orders/ready-to-ship', icon: Truck },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Customer Addresses', href: '/admin/customer-addresses', icon: MapPin },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Coupons & Offers', href: '/admin/coupons', icon: Ticket },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Store Profile', href: '/admin/store-profile', icon: Building2 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Admin Account', href: '/admin/account', icon: UserCheck },
  ];

  const handleLogout = () => {
    document.cookie = 'srj_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'srj_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-slate-900 text-slate-100 transition-all duration-300 flex flex-col border-r border-slate-800 shadow-xl ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60">
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden">
            <img
              src="/logo.jpg"
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-gold-500 shrink-0 shadow-md bg-slate-950 p-0.5"
            />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-serif font-bold text-gold-400 text-sm tracking-wide truncate">
                  {storeProfile.store_name}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Admin Workspace
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-gold-400 hover:bg-slate-800 transition"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items Scroll Area */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gold-gradient text-slate-950 font-bold shadow-[0_6px_20px_rgba(212,175,55,0.4)] scale-105 border-l-4 border-slate-950'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-gold-400'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-gold-400'}`} />
                {!collapsed && <span className="truncate flex-1">{item.name}</span>}

                {isActive && !collapsed && (
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse shrink-0" />
                )}

                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-950 text-gold-300 text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition whitespace-nowrap z-50 border border-slate-700">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Logout Admin Session"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
