'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User, ShoppingBag, MapPin, Heart, LogOut, ChevronRight, ShieldCheck } from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { orders, addresses, currentUser, logoutCustomer } = useStore();

  React.useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-50">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-16 w-full flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-slate-950 font-bold shadow-lg">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-slate-900">Redirecting to Login...</h1>
            <p className="text-xs text-slate-500">
              Please log in to access your account dashboard.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Link
              href="/"
              className="flex-1 py-3 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition shadow"
            >
              Return to Home
            </Link>
            <Link
              href="/login"
              className="flex-1 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl text-xs hover:opacity-95 transition shadow"
            >
              Go to Login
            </Link>
          </div>
        </main>
        <WhatsAppFloat />
        <Footer />
      </div>
    );
  }

  const currentCustomer = currentUser;

  // Generate Initials (e.g., "Ananya Sharma" -> "AS")
  const initials = currentCustomer.full_name
    ? currentCustomer.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'CU';

  // Filter orders strictly for current logged in user
  const myOrders = orders.filter(
    (o) =>
      o.customer_id === currentCustomer.id ||
      (currentCustomer.email && o.customer_email.toLowerCase() === currentCustomer.email.toLowerCase()) ||
      (currentCustomer.phone && o.customer_phone === currentCustomer.phone)
  );

  // Filter addresses for current logged in user
  const myAddresses = addresses.filter(
    (a) => a.customer_id === currentCustomer.id || (currentCustomer.phone && a.phone === currentCustomer.phone)
  );

  const handleLogout = () => {
    logoutCustomer();
    document.cookie = 'srj_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-12 w-full space-y-8">
        {/* User Profile Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-900 text-gold-400 font-bold text-xl flex items-center justify-center border-2 border-gold-400/50 shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-slate-900">{currentCustomer.full_name}</h1>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Active Account
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {currentCustomer.email} {currentCustomer.phone ? `• ${currentCustomer.phone}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-rose-50 hover:text-rose-600 border border-slate-200 transition inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {/* Dashboard Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/account/orders" className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm hover:border-gold-400 transition space-y-2 group">
            <ShoppingBag className="w-6 h-6 text-gold-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif font-bold text-base text-slate-900">My Orders ({myOrders.length})</h3>
            <p className="text-xs text-slate-500">Track shipments and view past purchase history.</p>
          </Link>

          <Link href="/account/addresses" className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm hover:border-gold-400 transition space-y-2 group">
            <MapPin className="w-6 h-6 text-gold-600 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif font-bold text-base text-slate-900">Saved Addresses ({myAddresses.length})</h3>
            <p className="text-xs text-slate-500">Manage shipping addresses for fast checkout.</p>
          </Link>

          <Link href="/wishlist" className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm hover:border-gold-400 transition space-y-2 group">
            <Heart className="w-6 h-6 text-rose-500 group-hover:scale-110 transition-transform" />
            <h3 className="font-serif font-bold text-base text-slate-900">Saved Wishlist</h3>
            <p className="text-xs text-slate-500">View saved favourite jewellery items.</p>
          </Link>
        </div>

        {/* User's Recent Orders List */}
        <div className="bg-white p-6 rounded-3xl border border-cream-300 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-cream-200 pb-3">
            <h3 className="font-serif font-bold text-lg text-slate-900">My Order History</h3>
            <Link href="/account/orders" className="text-xs font-bold text-gold-600 hover:underline">
              View All Orders
            </Link>
          </div>

          {myOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-2">
              <p>You haven't placed any orders yet.</p>
              <Link href="/shop" className="text-gold-600 font-bold underline inline-block">
                Start Shopping Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-cream-100">
              {myOrders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-900 block text-sm">{ord.order_number}</span>
                    <span className="text-[10px] text-slate-400">Placed on {formatDate(ord.created_at)}</span>
                  </div>

                  <span className="font-bold text-slate-900">{formatCurrency(ord.total_amount)}</span>

                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-bold">
                    {ord.order_status}
                  </span>

                  <Link
                    href={`/track-order?orderNumber=${ord.order_number}`}
                    className="px-3.5 py-1.5 bg-slate-900 text-gold-400 font-bold rounded-lg text-[10px] hover:bg-slate-800 transition"
                  >
                    Track Order
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}

