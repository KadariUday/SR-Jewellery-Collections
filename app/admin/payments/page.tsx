'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreditCard, IndianRupee, CheckCircle2, Clock, AlertCircle, RefreshCw, Filter, Search, ShoppingBag } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PaymentTransaction } from '@/lib/types';

export default function AdminPaymentsPage() {
  const { payments, orders, updateOrderStatus } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Compute all payment transactions combining explicit payments + order transactions
  const allPaymentTransactions: PaymentTransaction[] = React.useMemo(() => {
    const existingOrderIds = new Set(payments.map((p) => p.order_id));
    
    const orderDerivedPayments: PaymentTransaction[] = orders
      .filter((o) => !existingOrderIds.has(o.id))
      .map((o, idx) => ({
        id: `pay-${o.id}-${idx}`,
        order_id: o.id,
        order_number: o.order_number,
        customer_id: o.customer_id,
        customer_name: o.customer_name,
        payment_method: o.payment_method,
        provider: o.payment_method === 'COD' ? 'COD_RECEIPT' : 'RAZORPAY_TEST',
        amount: o.total_amount,
        status: o.payment_status,
        verified: o.payment_status === 'SUCCESS',
        created_at: o.created_at,
      }));

    return [...payments, ...orderDerivedPayments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [payments, orders]);

  const totalPaid = allPaymentTransactions
    .filter((p) => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const upiAmount = allPaymentTransactions
    .filter((p) => p.payment_method === 'UPI' && p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const codAmount = allPaymentTransactions
    .filter((p) => p.payment_method === 'COD')
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = allPaymentTransactions.filter((p) => {
    const searchMatch =
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.order_number && p.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const methodMatch = methodFilter === 'ALL' || p.payment_method === methodFilter;
    return searchMatch && methodMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Payments & Transactions Hub</h1>
          <p className="text-xs text-slate-500">
            Monitor real-time payments, COD collections, Razorpay test mode logs, and payment analytics.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Verified Paid</span>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(totalPaid)}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">UPI Digital Total</span>
          <h3 className="text-2xl font-bold text-gold-600 mt-1">{formatCurrency(upiAmount)}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">COD Volume</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(codAmount)}</h3>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Payment ID, Order ID, Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI / Online</option>
            <option value="COD">Cash on Delivery (COD)</option>
          </select>
        </div>
      </div>

      {/* Payment Transactions Table or Empty State */}
      {filteredPayments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-slate-900 text-lg">No Payment Transactions Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              When customers place orders using UPI or Cash on Delivery (COD), transactions will automatically appear here in real-time.
            </p>
          </div>
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition"
          >
            <ShoppingBag className="w-4 h-4" /> Place Test Order on Storefront
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Payment ID</th>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((pay, idx) => (
                  <tr key={`${pay.id}-${pay.order_id}-${idx}`} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-mono text-slate-600 font-semibold">{pay.id}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">{pay.order_number || pay.order_id}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{pay.customer_name || 'Customer'}</td>
                    <td className="p-3.5 font-bold">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        pay.payment_method === 'UPI' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pay.payment_method}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{formatCurrency(pay.amount)}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pay.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {pay.verified ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">Pending Delivery</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500" suppressHydrationWarning>{formatDate(pay.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
