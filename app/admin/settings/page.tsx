'use client';

import React, { useState } from 'react';
import { Save, CheckCircle2, AlertCircle, CreditCard, Truck, RefreshCw } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { storeSettingsSchema } from '@/lib/validation';

export default function AdminSettingsPage() {
  const { storeSettings, updateStoreSettings } = useStore();
  const [formData, setFormData] = useState({ ...storeSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync form data with storeSettings when loaded from Supabase
  React.useEffect(() => {
    setFormData({ ...storeSettings });
  }, [storeSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSavedSuccess(false);

    // 1. Zod Schema Validation
    const parseResult = storeSettingsSchema.safeParse({
      shipping_fee: Number(formData.shipping_fee),
      free_shipping_threshold: Number(formData.free_shipping_threshold),
      tax_percentage: Number(formData.tax_percentage),
      cod_enabled: Boolean(formData.cod_enabled),
      min_cod_value: Number(formData.min_cod_value),
      max_cod_value: Number(formData.max_cod_value),
      upi_enabled: Boolean(formData.upi_enabled),
      razorpay_test_mode: Boolean(formData.razorpay_test_mode),
    });

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Invalid input values';
      setErrorMessage(`Validation error: ${firstError}`);
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateStoreSettings(parseResult.data);
      if (result.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage(result.error || 'Unable to save settings. No changes were applied.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to save settings. No changes were applied.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">System & Business Settings</h1>
          <p className="text-xs text-slate-500">
            Changes sync automatically to the storefront in real-time backed by Supabase.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-lg shadow-gold-500/20 hover:opacity-95 transition text-xs disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Settings updated successfully. Changes are active on customer storefront.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store & Shipping Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-gold-500" /> Shipping & Tax Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Standard Shipping Fee (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.shipping_fee}
                onChange={(e) => setFormData({ ...formData, shipping_fee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
              <p className="text-[10px] text-slate-400 mt-1">Charged on orders below free threshold.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Free Shipping Above (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.free_shipping_threshold}
                onChange={(e) => setFormData({ ...formData, free_shipping_threshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-gold-600"
              />
              <p className="text-[10px] text-slate-400 mt-1">Orders at or above this amount get free shipping.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">GST / Tax Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.tax_percentage}
                onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
              <p className="text-[10px] text-slate-400 mt-1">Applicable GST percentage.</p>
            </div>
          </div>
        </div>

        {/* COD & Payment Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold-500" /> Cash on Delivery & Payment Gateways
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs font-bold">
              <span>Enable Cash on Delivery (COD)</span>
              <input
                type="checkbox"
                checked={formData.cod_enabled}
                onChange={(e) => setFormData({ ...formData, cod_enabled: e.target.checked })}
                className="w-4 h-4 text-gold-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs font-bold">
              <span>Enable UPI / Digital Payments</span>
              <input
                type="checkbox"
                checked={formData.upi_enabled}
                onChange={(e) => setFormData({ ...formData, upi_enabled: e.target.checked })}
                className="w-4 h-4 text-gold-500 rounded"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Minimum COD Order Value (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.min_cod_value}
                onChange={(e) => setFormData({ ...formData, min_cod_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Maximum COD Order Value (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.max_cod_value}
                onChange={(e) => setFormData({ ...formData, max_cod_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-700"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold cursor-pointer">
              <span>Razorpay Test Mode Active</span>
              <input
                type="checkbox"
                checked={formData.razorpay_test_mode}
                onChange={(e) => setFormData({ ...formData, razorpay_test_mode: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
