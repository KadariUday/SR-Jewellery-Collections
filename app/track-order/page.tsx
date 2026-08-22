'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate, getOrderStatusBadgeClass } from '@/lib/utils';
import { Search, Truck, CheckCircle2, Clock } from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get('orderNumber');

  const { orders } = useStore();
  const [query, setQuery] = useState(orderNumberParam || '');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (orderNumberParam || query) {
      handleSearch(orderNumberParam || query);
    }
  }, [orderNumberParam, orders]);

  const handleSearch = (ordNum: string) => {
    const clean = ordNum.trim().toLowerCase();
    const found = orders.find(
      (o) => o.order_number.toLowerCase() === clean || o.customer_phone.includes(clean)
    );
    setSearchedOrder(found || null);
    setSearched(true);
  };

  const steps = ['ORDER PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 md:px-6 py-12 w-full space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-serif font-bold text-slate-900">Track Your Jewellery Order</h1>
        <p className="text-xs text-slate-500">
          Enter your Order ID (e.g. SRJ-8821-4912) or registered phone number for real-time tracking.
        </p>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="flex gap-2 max-w-md mx-auto"
      >
        <input
          type="text"
          placeholder="Enter Order ID or Phone number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-3 bg-white border border-cream-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-gold-400"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition"
        >
          Track
        </button>
      </form>

      {searched && !searchedOrder && (
        <div className="p-8 bg-white border border-cream-300 rounded-2xl text-center text-xs text-slate-500">
          No order found for "{query}". Please check your Order ID.
        </div>
      )}

      {searchedOrder && (
        <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm space-y-8">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Order Number</span>
              <span className="font-mono font-bold text-slate-900 text-base">{searchedOrder.order_number}</span>
              <span className="text-xs text-slate-400 block">Placed on {formatDate(searchedOrder.created_at)}</span>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getOrderStatusBadgeClass(searchedOrder.order_status)}`}>
              {searchedOrder.order_status}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-sm text-slate-900">Delivery Status Timeline</h3>
            <div className="grid grid-cols-5 gap-2">
              {steps.map((step, idx) => {
                const currentIdx = steps.indexOf(searchedOrder.order_status);
                const isCompleted = currentIdx >= idx;
                const isCurrent = currentIdx === idx;

                return (
                  <div key={step} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                        isCompleted
                          ? 'bg-gold-500 text-slate-950 shadow-md'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold ${isCurrent ? 'text-gold-600' : 'text-slate-500'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier Details */}
          {searchedOrder.delivery_details && searchedOrder.delivery_details.courier_name && (
            <div className="p-4 bg-cream-100 border border-cream-300 rounded-xl space-y-1 text-xs">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-gold-600" /> Courier Info: {searchedOrder.delivery_details.courier_name}
              </span>
              <p className="font-mono text-slate-700">Tracking Number: <strong>{searchedOrder.delivery_details.tracking_number}</strong></p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-xs">Loading Track Order...</div>}>
        <TrackOrderContent />
      </Suspense>
      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
