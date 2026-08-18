'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { products } = useStore();

  const wishProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-12 w-full space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Your Saved Wishlist</h1>
          <p className="text-xs text-slate-500">Saved jewellery pieces for future purchases.</p>
        </div>

        {wishProducts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-cream-300 text-center space-y-3 max-w-md mx-auto">
            <Heart className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-slate-800">Your Wishlist is Empty</h3>
            <Link href="/shop" className="inline-block px-6 py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs">
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-cream-300 overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600'} alt={p.name} className="w-full h-full object-cover" />
                  <button onClick={() => toggleWishlist(p.id)} className="absolute top-3 right-3 p-2 rounded-full bg-white/80 text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="font-serif font-bold text-sm text-slate-900 block">{p.name}</span>
                    <span className="text-sm font-bold text-gold-600">{formatCurrency(p.selling_price)}</span>
                  </div>

                  <button
                    onClick={() => addToCart(p, 1)}
                    className="w-full py-2 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
