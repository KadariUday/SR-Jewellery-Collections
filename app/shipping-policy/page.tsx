'use client';

import React from 'react';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { Truck, ShieldCheck } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-6 py-12 w-full space-y-6 text-xs text-slate-700 leading-relaxed">
        <h1 className="text-3xl font-serif font-bold text-slate-900">Shipping & Delivery Policy</h1>
        <div className="bg-white p-6 rounded-2xl border border-cream-300 space-y-4">
          <p>We provide insured express shipping on all orders across India via BlueDart, DTDC, and Delhivery.</p>
          <p>Orders are dispatched within 24-48 hours. Free shipping is applicable on orders above ₹1,999.</p>
        </div>
      </main>
      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
