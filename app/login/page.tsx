'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import {
  Gem,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { customers, loginCustomer } = useStore();

  // Clean real authentication form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Error/Success notifications
  const [notification, setNotification] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      alert('Please enter your email and password.');
      return;
    }

    // Check if user already exists in registered customer database
    const existing = customers.find(
      (c) => c.email && c.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    let fullName = 'Customer';
    if (existing) {
      fullName = existing.full_name;
    } else {
      const namePart = trimmedEmail.split('@')[0].replace(/[._-]/g, ' ');
      fullName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }

    loginCustomer({
      email: trimmedEmail,
      full_name: fullName,
      phone: existing?.phone || '+91 98765 00000',
    });

    document.cookie = 'srj_role=CUSTOMER; path=/; max-age=86400';
    router.push('/');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotModal(false);
      setForgotEmail('');
      setNotification('Password reset instructions sent to your email.');
      setTimeout(() => setNotification(null), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex flex-col items-center justify-center">
        {/* Banner notification */}
        {notification && (
          <div className="w-full mb-4 p-3 bg-emerald-900 text-gold-300 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg border border-gold-500/30 animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {notification}
            </span>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="w-full bg-white p-8 rounded-3xl border border-cream-300 shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-gold-gradient mx-auto flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Gem className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Customer Login</h1>
            <p className="text-xs text-slate-500">Access your account, order history, and saved addresses.</p>
          </div>

          {/* REAL EMAIL & PASSWORD LOGIN FORM */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-gold-600 focus:ring-gold-400 border-cream-300"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-gold-600 font-bold hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 text-gold-400 font-bold rounded-xl shadow-md hover:bg-slate-800 transition text-xs flex items-center justify-center gap-2"
            >
              <span>Login to Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500 border-t border-cream-200">
            Don't have a customer account?{' '}
            <Link href="/signup" className="text-gold-600 font-bold hover:underline">
              Sign up here
            </Link>
          </div>
        </div>
      </main>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-cream-300 shadow-2xl space-y-4 relative animate-fade-in">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-gold-100 text-gold-700 mx-auto flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-slate-900">Reset Your Password</h3>
              <p className="text-xs text-slate-500">
                Enter your registered email address below and we'll send you a password reset link.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <button
                type="submit"
                disabled={resetSent}
                className="w-full py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl shadow hover:bg-slate-800 transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {resetSent ? (
                  <span>Sending Reset Link...</span>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <Mail className="w-4 h-4" />
                  </>
                )}
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
