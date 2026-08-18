'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';

export default function CategoriesPage() {
  const { categories, products } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-12 w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Royal Collections</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Explore Jewellery Categories</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Browse our hand-crafted collections of Jhumkas, Kundan Chokers, Bangles, and Bridal Sets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id && p.is_active).length;

            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="group bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="h-56 overflow-hidden relative bg-slate-900">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 font-serif font-bold text-xl text-white">
                    {cat.name}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                  <div className="flex justify-between items-center pt-3 border-t border-cream-200 text-xs font-bold text-slate-900">
                    <span>{count} Available Pieces</span>
                    <span className="text-gold-600 group-hover:translate-x-1 transition">Browse Collection →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
