'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  ExternalLink,
  ShieldCheck,
  Package,
  ShoppingBag,
  User,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface HeaderProps {
  setMobileOpen: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const router = useRouter();
  const { products, orders, customers } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const [adminProfile, setAdminProfile] = useState({
    name: 'Sushmitha Admin',
    email: 'sushmitha.admin@srjewellery.com',
  });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('srj_admin_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setAdminProfile((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Error loading admin profile in header', e);
    }
  }, []);

  const adminInitials = adminProfile.name
    ? adminProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SA';

  // Filter global search results
  const matchingProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const matchingOrders = searchQuery.trim()
    ? orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customer_phone.includes(searchQuery)
      ).slice(0, 3)
    : [];

  const matchingCustomers = searchQuery.trim()
    ? customers.filter(
        (c) =>
          c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.phone && c.phone.includes(searchQuery))
      ).slice(0, 3)
    : [];

  const hasResults =
    matchingProducts.length > 0 || matchingOrders.length > 0 || matchingCustomers.length > 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Global Search Input */}
        <div className="relative w-48 sm:w-72 md:w-96">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, orders, customers, SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-white text-slate-800 transition"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 max-h-96 overflow-y-auto">
              {!hasResults ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  No matching records found for "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-3">
                  {matchingProducts.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1 flex items-center gap-1">
                        <Package className="w-3 h-3" /> Products
                      </div>
                      {matchingProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            router.push(`/admin/products/${p.id}`);
                            setSearchOpen(false);
                          }}
                          className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center text-xs"
                        >
                          <span className="font-medium text-slate-800 truncate">{p.name}</span>
                          <span className="text-slate-400 text-[10px] font-mono">{p.sku}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchingOrders.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" /> Orders
                      </div>
                      {matchingOrders.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => {
                            router.push(`/admin/orders/${o.id}`);
                            setSearchOpen(false);
                          }}
                          className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{o.order_number}</span>
                            <span className="text-slate-400 block text-[10px]">{o.customer_name}</span>
                          </div>
                          <span className="text-gold-600 font-bold">₹{o.total_amount}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {matchingCustomers.length > 0 && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 mb-1 flex items-center gap-1">
                        <User className="w-3 h-3" /> Customers
                      </div>
                      {matchingCustomers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            router.push(`/admin/customers/${c.id}`);
                            setSearchOpen(false);
                          }}
                          className="px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center text-xs"
                        >
                          <span className="font-medium text-slate-800">{c.full_name}</span>
                          <span className="text-slate-400 text-[10px]">{c.phone || c.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Customer Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Notifications Icon */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Admin Profile Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-gold-400 flex items-center justify-center font-bold text-xs ring-2 ring-gold-400/50">
            {adminInitials}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
              {adminProfile.name}
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Store Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};
