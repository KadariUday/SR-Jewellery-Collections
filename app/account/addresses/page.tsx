'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';
import { MapPin, Plus, X, Building, Phone } from 'lucide-react';
import { CustomerAddress } from '@/lib/types';

import Link from 'next/link';

export default function CustomerAddressesPage() {
  const { addresses, currentUser, addCustomerAddress } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    label: 'Home',
    full_name: currentUser?.full_name || '',
    phone: currentUser?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-50">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-16 w-full flex flex-col items-center justify-center text-center space-y-4">
          <MapPin className="w-12 h-12 text-gold-500 mx-auto" />
          <h1 className="text-2xl font-serif font-bold text-slate-900">Please Log In</h1>
          <p className="text-xs text-slate-500">You must be logged in to view your address book.</p>
          <Link href="/login" className="px-6 py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs">
            Log In Now
          </Link>
        </main>
        <WhatsAppFloat />
        <Footer />
      </div>
    );
  }

  const myAddresses = addresses.filter(
    (a) => a.customer_id === currentUser.id || (currentUser.phone && a.phone === currentUser.phone)
  );

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: CustomerAddress = {
      id: `addr-${Date.now()}`,
      customer_id: currentUser.id,
      label: form.label,
      full_name: form.full_name,
      phone: form.phone,
      address_line1: form.address_line1,
      address_line2: form.address_line2,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      is_default: myAddresses.length === 0,
    };
    addCustomerAddress(newAddr);
    setShowAddModal(false);
    setForm({
      label: 'Home',
      full_name: currentUser.full_name || '',
      phone: currentUser.phone || '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-6 py-12 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Saved Shipping Addresses</h1>
            <p className="text-xs text-slate-500">
              Address book for <strong className="text-slate-800">{currentUser.full_name}</strong>.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition flex items-center gap-1.5 self-start sm:self-auto shadow"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>

        {myAddresses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-cream-300 space-y-3">
            <MapPin className="w-8 h-8 text-gold-500 mx-auto" />
            <p className="text-slate-600 text-xs font-semibold">No saved addresses yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gold-gradient text-slate-950 font-bold rounded-xl text-xs"
            >
              Add Your Shipping Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myAddresses.map((addr) => (
              <div key={addr.id} className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm space-y-2 text-xs relative group">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm block">{addr.full_name}</span>
                  <span className="px-2 py-0.5 bg-gold-100 text-gold-800 font-bold rounded text-[10px] uppercase">
                    {addr.label}
                  </span>
                </div>
                <p className="text-slate-700">{addr.address_line1}</p>
                {addr.address_line2 && <p className="text-slate-600">{addr.address_line2}</p>}
                <p className="font-bold text-slate-900">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-slate-500 font-mono pt-1">Phone: {addr.phone}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD ADDRESS MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-cream-300 shadow-2xl space-y-4 relative animate-fade-in">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-cream-200 pb-3">
              <h3 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold-500" /> Add New Shipping Address
              </h3>
              <p className="text-xs text-slate-500">Provide full delivery details for precise courier dispatch.</p>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Label (e.g. Home, Office)
                  </label>
                  <select
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-slate-900"
                  >
                    <option value="Home">Home</option>
                    <option value="Work / Office">Work / Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address & House / Flat / Building No. *
                </label>
                <input
                  type="text"
                  required
                  value={form.address_line1}
                  onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
                  placeholder="e.g. Flat 301, Emerald Towers, Main Road"
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Landmark / Locality (Optional)
                </label>
                <input
                  type="text"
                  value={form.address_line2}
                  onChange={(e) => setForm({ ...form, address_line2: e.target.value })}
                  placeholder="e.g. Near City Center Mall"
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Hyderabad"
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="Telangana"
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    placeholder="500034"
                    className="w-full px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-gold-400 font-bold rounded-xl shadow-md hover:bg-slate-800 transition text-xs"
              >
                Save Shipping Address
              </button>
            </form>
          </div>
        </div>
      )}

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}

