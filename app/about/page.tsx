'use client';

import React from 'react';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';
import { Gem, ShieldCheck, Sparkles, Award } from 'lucide-react';

export default function AboutPage() {
  const { storeProfile } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-16 w-full space-y-12">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gold-gradient mx-auto flex items-center justify-center text-slate-950 font-bold shadow-lg mb-2">
            <Gem className="w-9 h-9" />
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Our Heritage</span>
          <h1 className="text-4xl font-serif font-bold text-slate-900">{storeProfile.store_name}</h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto italic">{storeProfile.tagline}</p>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-cream-300 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <p className="font-serif text-lg font-bold text-slate-900 leading-normal">
            "{storeProfile.description}"
          </p>

          <p>
            At {storeProfile.store_name}, every Kundan choker, Polki earring, and Temple gold bangle is handcrafted by traditional karigars who have preserved the art of royal Indian jewellery making for generations.
          </p>
        </div>
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
