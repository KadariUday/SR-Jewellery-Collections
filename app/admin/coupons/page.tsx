'use client';

import React, { useState } from 'react';
import { Ticket, Plus, Tag, Copy, Check, Trash2, Percent, IndianRupee, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { Coupon } from '@/lib/types';

export default function AdminCouponsPage() {
  const { coupons, addCoupon, updateCouponStatus, deleteCoupon } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    discount_type: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    discount_value: 10,
    min_order_amount: 999,
    max_discount_amount: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;

    const newCoupon = addCoupon({
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      min_order_amount: Number(form.min_order_amount) || 0,
      max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : undefined,
      status: form.status,
    });

    setSuccessMessage(`Coupon code "${newCoupon.code}" created successfully!`);
    setShowModal(false);
    setForm({
      code: '',
      discount_type: 'PERCENTAGE',
      discount_value: 10,
      min_order_amount: 999,
      max_discount_amount: 0,
      status: 'ACTIVE',
    });

    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Coupons & Promotional Offers</h1>
          <p className="text-xs text-slate-500">
            Create custom promo codes, set percentage or flat discounts, and configure checkout rules.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-md hover:opacity-95 transition text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Coupon</span>
        </button>
      </div>

      {/* Success Banner */}
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

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-slate-900 text-lg">No Coupons Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Create your first promotional discount coupon code for your customers to redeem at checkout.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition"
          >
            + Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((c) => {
            const isCopied = copiedId === c.id;
            const discountLabel =
              c.discount_type === 'PERCENTAGE'
                ? `${c.discount_value}% OFF`
                : `${formatCurrency(c.discount_value)} OFF`;

            return (
              <div
                key={c.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-gold-300 transition"
              >
                {/* Top Section */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gold-50 text-gold-600 rounded-xl border border-gold-200 shrink-0">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-base tracking-wider">{c.code}</span>
                        <button
                          onClick={() => handleCopyCode(c.code, c.id)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-gold-600 transition"
                          title="Copy Code"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-sm font-bold text-emerald-700 block">{discountLabel}</span>
                    </div>
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    onClick={() =>
                      updateCouponStatus(c.id, c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')
                    }
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                      c.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Click to toggle coupon status"
                  >
                    {c.status}
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span>Minimum Order:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(c.min_order_amount)}</span>
                  </div>
                  {c.max_discount_amount && (
                    <div className="flex justify-between items-center">
                      <span>Max Discount Cap:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(c.max_discount_amount)}</span>
                    </div>
                  )}
                  {c.usage_count !== undefined && (
                    <div className="flex justify-between items-center">
                      <span>Times Redeemed:</span>
                      <span className="font-mono font-bold text-gold-600">{c.usage_count} orders</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Created: {new Date(c.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                    title="Delete Coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gold-50 text-gold-600 rounded-lg">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Create Custom Offer Coupon</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BRIDAL2026 or FESTIVE15"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-gold-400 focus:bg-white uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="PERCENTAGE">Percentage (% OFF)</option>
                    <option value="FLAT">Flat Amount (₹ OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                    placeholder={form.discount_type === 'PERCENTAGE' ? 'e.g. 15 for 15%' : 'e.g. 500 for ₹500'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Min Order Value (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.min_order_amount}
                    onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.max_discount_amount}
                    onChange={(e) => setForm({ ...form, max_discount_amount: Number(e.target.value) })}
                    placeholder="Optional (e.g. 1000)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="ACTIVE">ACTIVE (Can be redeemed by customers)</option>
                  <option value="INACTIVE">INACTIVE (Disabled)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-md hover:opacity-95 transition"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
