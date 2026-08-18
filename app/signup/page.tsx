'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { Gem, ArrowRight, Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react';

import { useStore } from '@/context/StoreContext';

export default function CustomerSignupPage() {
  const router = useRouter();
  const { loginCustomer } = useStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    loginCustomer({
      full_name: form.name || 'New Customer',
      email: form.email,
      phone: form.phone ? (form.phone.startsWith('+91') ? form.phone : `+91 ${form.phone}`) : '+91 98765 00000',
    });

    document.cookie = 'srj_role=CUSTOMER; path=/; max-age=86400';
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex items-center justify-center">
        <div className="w-full bg-white p-8 rounded-3xl border border-cream-300 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gold-gradient mx-auto flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Gem className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Create Customer Account</h1>
            <p className="text-xs text-slate-500">Join SR Jewellery Collections for exclusive offers and fast checkout.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ananya Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="ananya.sharma@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="9876511111"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-gold-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-gold-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 transition"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-md hover:opacity-95 transition text-xs flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500 border-t border-cream-200">
            Already have an account? <Link href="/login" className="text-gold-600 font-bold hover:underline">Log in</Link>
          </div>
        </div>
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}

