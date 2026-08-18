'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Search,
  Filter,
  Truck,
  Download,
  Phone,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate, getOrderStatusBadgeClass } from '@/lib/utils';
import { exportToCSV } from '@/lib/exportUtils';

export default function AdminOrdersPage() {
  const { orders } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'VALUE' | 'PENDING'>('NEWEST');

  const filteredOrders = orders
    .filter((o) => {
      const searchMatch =
        o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_phone.includes(searchTerm) ||
        o.delivery_address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.delivery_address?.pincode?.includes(searchTerm);

      const statusMatch = statusFilter === 'ALL' || o.order_status === statusFilter;
      const paymentMatch = paymentFilter === 'ALL' || o.payment_method === paymentFilter;

      return searchMatch && statusMatch && paymentMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'VALUE') return b.total_amount - a.total_amount;
      if (sortBy === 'PENDING') {
        const priorityOrder: Record<string, number> = {
          'ORDER PLACED': 1,
          'CONFIRMED': 2,
          'PACKED': 3,
          'SHIPPED': 4,
          'DELIVERED': 5,
        };
        return (priorityOrder[a.order_status] || 99) - (priorityOrder[b.order_status] || 99);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleExportCSV = () => {
    const csvData = filteredOrders.map((o) => ({
      OrderNumber: o.order_number,
      CustomerName: o.customer_name,
      CustomerPhone: o.customer_phone,
      CustomerEmail: o.customer_email,
      TotalAmount: o.total_amount,
      PaymentMethod: o.payment_method,
      PaymentStatus: o.payment_status,
      OrderStatus: o.order_status,
      City: o.delivery_address?.city || '',
      Pincode: o.delivery_address?.pincode || '',
      Date: formatDate(o.created_at),
    }));

    exportToCSV(csvData, 'Orders_Report');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Order Management & Fulfillment</h1>
          <p className="text-xs text-slate-500">
            Fast order processing workspace for pending, ready-to-ship, and delivered jewellery orders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl hover:bg-slate-800 transition text-xs shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Orders (CSV)</span>
          </button>

          <Link
            href="/admin/orders/ready-to-ship"
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-900 text-purple-100 font-bold rounded-xl hover:bg-purple-950 transition text-xs shadow-md"
          >
            <Truck className="w-4 h-4 text-gold-400" />
            <span>Fast Delivery View ("Ready to Ship")</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, Name, Phone, City, PIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="ORDER PLACED">ORDER PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="UPI">UPI Digital Payment</option>
          </select>
        </div>

        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="NEWEST">Sort: Newest Orders</option>
            <option value="PENDING">Sort: Urgent Pending First</option>
            <option value="VALUE">Sort: Highest Order Value</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Order ID & Date</th>
                <th className="p-3.5">Customer & Contact</th>
                <th className="p-3.5">Delivery Destination</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const badgeClass = getOrderStatusBadgeClass(o.order_status);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-900 block">{o.order_number}</span>
                        <span className="text-[10px] text-slate-400" suppressHydrationWarning>{formatDate(o.created_at)}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 block">{o.customer_name}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" /> {o.customer_phone}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-medium text-slate-800 block">
                          {o.delivery_address?.city || 'N/A'}, {o.delivery_address?.state || ''}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          PIN: {o.delivery_address?.pincode || 'N/A'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 text-sm">{formatCurrency(o.total_amount)}</span>
                        <span className="text-[10px] text-slate-400 block">{o.items?.length || 1} item(s)</span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.payment_method === 'UPI' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {o.payment_method}
                          </span>
                          <span className={`text-[9px] font-bold ${
                            o.payment_status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {o.payment_status}
                          </span>
                          {(o.upi_utr || o.notes?.includes('UTR')) && (
                            <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300 flex items-center gap-1 mt-0.5" title="Click to copy UTR">
                              <span className="font-sans text-[9px] uppercase font-semibold text-amber-700">UTR:</span>
                              {o.upi_utr || o.notes?.replace('UPI UTR Ref: ', '')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                          {o.order_status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        {o.order_status === 'DELIVERED' ? (
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg font-bold hover:bg-emerald-100 transition inline-flex items-center gap-1 text-xs shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Done</span>
                          </Link>
                        ) : o.order_status === 'CANCELLED' || o.order_status === 'REFUNDED' ? (
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg font-bold hover:bg-slate-200 transition inline-flex items-center gap-1 text-xs"
                          >
                            <span>Closed</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="px-3 py-1.5 bg-slate-900 text-gold-400 rounded-lg font-semibold hover:bg-slate-800 transition inline-flex items-center gap-1 shadow-sm"
                          >
                            <span>Process</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
