'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, Search, Phone, Mail, ShoppingBag, IndianRupee, ChevronRight, UserCheck, Plus, X, CheckCircle2, MessageCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate, generateWhatsAppUrl } from '@/lib/utils';
import { UserProfile } from '@/lib/types';

export default function AdminCustomersPage() {
  const { customers, orders, loginCustomer, storeProfile } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'ADMIN',
  });

  // Dynamically compute all customer profiles combining registered customers + order customers
  const allCustomerStats = React.useMemo(() => {
    const map = new Map<string, UserProfile & { orderCount: number; totalSpent: number }>();

    // 1. Add registered customers
    customers.forEach((c) => {
      map.set(c.id, {
        ...c,
        orderCount: 0,
        totalSpent: 0,
      });
    });

    // 2. Add/augment customers from orders
    orders.forEach((o) => {
      const matchKey = o.customer_id || o.customer_email || o.customer_phone;
      const existing = Array.from(map.values()).find(
        (c) =>
          c.id === o.customer_id ||
          (c.email && c.email.toLowerCase() === o.customer_email.toLowerCase()) ||
          (c.phone && c.phone === o.customer_phone)
      );

      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += o.total_amount;
      } else if (matchKey) {
        const id = o.customer_id || `cust-${Date.now()}`;
        map.set(id, {
          id,
          full_name: o.customer_name || 'Customer',
          email: o.customer_email || `${o.customer_name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: o.customer_phone || '',
          role: 'CUSTOMER',
          created_at: o.created_at,
          orderCount: 1,
          totalSpent: o.total_amount,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent || new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [customers, orders]);

  const filteredCustomers = allCustomerStats.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;

    const newCust = loginCustomer({
      full_name: form.full_name.trim(),
      email: form.email.trim() || `${form.full_name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: form.phone.trim(),
      role: form.role,
    });

    setSuccessMessage(`Customer profile for "${newCust.full_name}" created successfully!`);
    setShowAddModal(false);
    setForm({ full_name: '', email: '', phone: '', role: 'CUSTOMER' });
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Customer Management Dashboard</h1>
          <p className="text-xs text-slate-500">
            View registered customer profiles, purchase history, and spending metrics.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-md hover:opacity-95 transition text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Registered Date</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Total Spending</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c) => {
                const whatsappMsg = `Hello ${c.full_name}, this is ${storeProfile.store_name}.`;
                const whatsappUrl = generateWhatsAppUrl(c.phone || '', whatsappMsg);

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-gold-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {c.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{c.full_name}</span>
                          <span className="text-[10px] text-slate-400">{c.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600 font-medium">{c.phone || 'N/A'}</td>

                    <td className="p-3.5 text-slate-500" suppressHydrationWarning>{formatDate(c.created_at)}</td>

                    <td className="p-3.5 font-bold text-slate-900">{c.orderCount} orders</td>

                    <td className="p-3.5 font-bold text-emerald-700 text-sm">{formatCurrency(c.totalSpent)}</td>

                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.role === 'ADMIN' ? 'bg-gold-100 text-gold-900 border border-gold-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.role}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.phone && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="px-3 py-1.5 bg-slate-900 text-gold-400 rounded-lg font-semibold hover:bg-slate-800 transition inline-flex items-center gap-1"
                        >
                          <span>Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gold-50 text-gold-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Add New Customer Profile</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Sharma"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-gold-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. radhika@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  User Role
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="CUSTOMER">Valued Customer</option>
                  <option value="ADMIN">Store Administrator</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-md hover:opacity-95 transition"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
