'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  IndianRupee,
  Lock,
  Plus,
  StickyNote,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate, generateWhatsAppUrl } from '@/lib/utils';

export default function CustomerDetailPage() {
  const params = useParams();
  const { customers, orders, addresses, customerNotes, addCustomerNote, storeProfile } = useStore();

  const customerId = params?.id as string;
  let customer = customers.find((c) => c.id === customerId);

  // Fallback to order-derived customer lookup
  if (!customer) {
    const orderMatch = orders.find((o) => o.customer_id === customerId || o.id === customerId);
    if (orderMatch) {
      customer = {
        id: customerId,
        full_name: orderMatch.customer_name,
        email: orderMatch.customer_email,
        phone: orderMatch.customer_phone,
        role: 'CUSTOMER',
        created_at: orderMatch.created_at,
      };
    }
  }

  const [newNote, setNewNote] = useState('');

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Customer record not found.</h2>
        <Link href="/admin/customers" className="px-4 py-2 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs inline-block">
          Return to Customers List
        </Link>
      </div>
    );
  }

  const custOrders = orders.filter(
    (o) =>
      o.customer_id === customer.id ||
      (customer.email && o.customer_email.toLowerCase() === customer.email.toLowerCase()) ||
      (customer.phone && o.customer_phone === customer.phone)
  );
  const custAddresses = addresses.filter(
    (a) => a.customer_id === customer.id || (customer.phone && a.phone === customer.phone)
  );
  const custNotes = customerNotes.filter((n) => n.customer_id === customer.id);

  const totalSpent = custOrders.reduce((sum, o) => sum + (o.payment_status === 'SUCCESS' ? o.total_amount : 0), 0);
  const avgOrderValue = custOrders.length > 0 ? Math.round(totalSpent / custOrders.length) : 0;

  const whatsappMsg = `Hello ${customer.full_name}, this is ${storeProfile.store_name}.`;
  const whatsappUrl = generateWhatsAppUrl(customer.phone || '', whatsappMsg);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addCustomerNote(customer.id, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">{customer.full_name}</h1>
            <p className="text-xs text-slate-500">Customer ID: {customer.id} • Registered {formatDate(customer.created_at)}</p>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="flex items-center gap-2">
          {customer.phone && (
            <>
              <a
                href={`tel:${customer.phone}`}
                className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-gold-400" /> Call
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </>
          )}

          <a
            href={`mailto:${customer.email}`}
            className="px-3.5 py-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </a>
        </div>
      </div>

      {/* Purchase Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Total Orders</span>
          <span className="text-2xl font-bold text-slate-900">{custOrders.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Total Spent</span>
          <span className="text-2xl font-bold text-gold-600">{formatCurrency(totalSpent)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Average Order Value</span>
          <span className="text-2xl font-bold text-emerald-700">{formatCurrency(avgOrderValue)}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-400 font-semibold uppercase block">Saved Addresses</span>
          <span className="text-2xl font-bold text-slate-900">{custAddresses.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Order History & Addresses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order History */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold-500" /> Customer Purchase History
            </h3>

            {custOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No orders placed by this customer yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {custOrders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-900 block">{ord.order_number}</span>
                      <span className="text-[10px] text-slate-400">{formatDate(ord.created_at)}</span>
                    </div>

                    <div className="text-center">
                      <span className="font-bold text-slate-800 block">{formatCurrency(ord.total_amount)}</span>
                      <span className="text-[10px] text-slate-500">{ord.payment_method}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {ord.order_status}
                      </span>
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="px-2.5 py-1 bg-slate-900 text-gold-400 rounded-lg text-[10px] font-bold"
                      >
                        View Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Addresses */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-500" /> Saved Delivery Addresses
            </h3>

            {custAddresses.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No saved delivery addresses found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {custAddresses.map((addr) => (
                  <div key={addr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">{addr.full_name} ({addr.label})</span>
                    <p>{addr.address_line1}</p>
                    {addr.address_line2 && <p>{addr.address_line2}</p>}
                    <p className="font-semibold">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="text-slate-500 font-mono">Phone: {addr.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Private Admin Notes Tool (Requirement #34) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-gold-500" /> Private Internal Admin Notes
            </h3>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Internal staff notes ONLY. Customers never see these.</span>
            </div>

            {/* Existing Notes List */}
            <div className="space-y-3">
              {custNotes.map((note) => (
                <div key={note.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <p className="text-slate-800 font-medium">{note.note}</p>
                  <span className="text-[10px] text-slate-400 block">{formatDate(note.created_at)} by {note.admin_name || 'Admin'}</span>
                </div>
              ))}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2">
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add private note (e.g. Preferred delivery time, VIP request)..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-gold-400"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition"
              >
                Add Internal Note
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
