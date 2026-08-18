'use client';

import React from 'react';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function JewelleryCarePage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-6 py-12 w-full space-y-6 text-xs text-slate-700 leading-relaxed">
        <h1 className="text-3xl font-serif font-bold text-slate-900">Jewellery Care & Maintenance Guide</h1>
        <div className="bg-white p-6 rounded-2xl border border-cream-300 space-y-4">
          <h3 className="font-serif font-bold text-sm text-slate-900">How to maintain your Kundan & Polki Jewellery</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Keep away from direct exposure to water, perfume, and hairspray.</li>
            <li>Store each piece separately in a soft velvet cloth pouch to avoid scratch damage.</li>
            <li>Wipe gently with a clean soft cotton cloth after wearing.</li>
          </ul>
        </div>
      </main>
      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
