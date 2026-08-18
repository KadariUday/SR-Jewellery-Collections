'use client';

import React, { useState } from 'react';
import { Building2, Save, Phone, MapPin, Globe, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { storeProfileSchema, isValidUpiVpa } from '@/lib/validation';

export default function AdminStoreProfilePage() {
  const { storeProfile, updateStoreProfile } = useStore();
  const [formData, setFormData] = useState({ ...storeProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Keep form data in sync with storeProfile when loaded from Supabase
  React.useEffect(() => {
    const upiVal = storeProfile.upi_vpa || storeProfile.upi_id || '992438853@fam';
    setFormData({
      ...storeProfile,
      upi_vpa: upiVal,
      upi_id: upiVal,
    });
  }, [storeProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSavedSuccess(false);

    const upiCandidate = formData.upi_vpa || formData.upi_id || '';

    // Validate with Zod Schema
    const parseResult = storeProfileSchema.safeParse({
      store_name: formData.store_name,
      logo_url: formData.logo_url || '/logo.jpg',
      tagline: formData.tagline || '',
      description: formData.description || '',
      email: formData.email,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      address: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      pincode: formData.pincode || '',
      map_url: formData.map_url || '',
      business_hours: formData.business_hours || '',
      instagram_url: formData.instagram_url || '',
      facebook_url: formData.facebook_url || '',
      youtube_url: formData.youtube_url || '',
      upi_vpa: upiCandidate,
    });

    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || 'Invalid profile information';
      setErrorMessage(firstError);
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateStoreProfile({
        ...parseResult.data,
        upi_vpa: upiCandidate,
        upi_id: upiCandidate,
      });

      if (result.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage(result.error || 'Unable to save profile. No changes were applied.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to save profile. No changes were applied.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Store Business Profile</h1>
          <p className="text-xs text-slate-500">
            Single source of truth for public business details. Changes sync automatically to the storefront!
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
          <span>Store profile saved successfully. Customer website updated in real-time.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Brand Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-500" /> Brand & Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={formData.store_name}
                onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Logo Image URL</label>
              <input
                type="text"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Store Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">About / Business Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Contact Numbers & Channels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Phone className="w-5 h-5 text-gold-500" /> Contact Numbers & Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Store Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="918790522579 or +91 87905 22579"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">WhatsApp Number *</label>
              <input
                type="text"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="918790522579"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Store Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">STORE UPI ID / VPA</label>
              <input
                type="text"
                value={formData.upi_vpa || formData.upi_id || ''}
                onChange={(e) => setFormData({ ...formData, upi_vpa: e.target.value, upi_id: e.target.value })}
                placeholder="e.g. example@upi or 992438853@fam"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-gold-700"
              />
              <p className="text-[10px] text-slate-400 mt-1">This UPI ID is used for direct UPI payments where enabled.</p>
            </div>
          </div>
        </div>

        {/* Physical Address & Map */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gold-500" /> Location & Business Hours
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Business Hours</label>
              <input
                type="text"
                value={formData.business_hours}
                onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
                placeholder="Mon - Sat: 10:30 AM - 8:30 PM"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Google Maps Embed Link</label>
              <input
                type="url"
                value={formData.map_url}
                onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-gold-500" /> Social Handles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Instagram URL</label>
              <input
                type="url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Facebook URL</label>
              <input
                type="url"
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">YouTube URL</label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
