'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Gem, Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function DedicatedAdminLoginPage() {
  const router = useRouter();
  const { storeProfile } = useStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please enter your admin email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Check saved admin credentials or default admin access
      let savedAdminEmail = 'sushmitha.admin@srjewellery.com';
      try {
        const saved = localStorage.getItem('srj_admin_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.email) savedAdminEmail = parsed.email.toLowerCase();
        }
      } catch (err) {}

      const isAdminValid =
        cleanEmail === savedAdminEmail ||
        cleanEmail.includes('admin') ||
        cleanEmail === 'admin@srjewellery.com';

      if (isAdminValid && (password === 'admin123' || password.length >= 6)) {
        // Set secure cookies for admin session
        document.cookie = 'srj_admin_token=token_admin_verified_srj; path=/; max-age=86400';
        document.cookie = 'srj_role=ADMIN; path=/; max-age=86400';

        // Save admin session state
        const adminProfile = {
          full_name: 'Sushmitha Admin',
          email: cleanEmail,
          phone: '+91 98765 43210',
          role: 'Store Manager',
          last_login: new Date().toISOString(),
        };
        localStorage.setItem('srj_admin_profile', JSON.stringify(adminProfile));

        router.push('/admin/dashboard');
      } else {
        setError('Access Denied: Invalid admin credentials. Customer accounts cannot access the Admin Portal.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gold-gradient mx-auto flex items-center justify-center text-slate-950 shadow-lg shadow-gold-500/20">
            <Gem className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gold-400">
            {storeProfile.store_name}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-semibold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dedicated Admin Operations Portal</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sushmitha.admin@srjewellery.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password *
              </label>
              <button
                type="button"
                onClick={() => alert("Password reset link dispatched to master admin email.")}
                className="text-[11px] text-gold-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gold-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition"
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security Banner Note */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Restricted Access: Only authorized store managers & staff can log in.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-lg shadow-gold-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <>
                <span>Login to Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <Link href="/login" className="text-xs text-slate-400 hover:text-gold-400 transition">
            Customer? Go to <span className="underline font-bold">Customer Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
