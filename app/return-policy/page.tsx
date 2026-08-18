'use client';

import React from 'react';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-6 py-12 w-full space-y-6 text-xs text-slate-700 leading-relaxed">
        <h1 className="text-3xl font-serif font-bold text-slate-900">Return & Exchange Policy</h1>
        <div className="bg-white p-6 rounded-2xl border border-cream-300 space-y-4">
          <p>We offer a 7-day hassle-free return and exchange policy for unworn items in original box packaging.</p>
        </div>
      </main>
      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
