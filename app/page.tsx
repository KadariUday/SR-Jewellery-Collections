'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, Star, Heart, ShoppingBag, Award, Gem } from 'lucide-react';

export default function CustomerHomePage() {
  const { products, categories, storeProfile } = useStore();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const activeProducts = products.filter((p) => p.is_active);
  const featuredProducts = activeProducts.length > 0
    ? (products.filter((p) => p.is_featured && p.is_active).length > 0
        ? products.filter((p) => p.is_featured && p.is_active)
        : activeProducts)
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <Navbar />

      <main className="flex-1">
        {/* 3D HERO BANNER */}
        <section className="relative bg-emerald-950 text-white overflow-hidden py-20 lg:py-32 perspective-1000">
          {/* Ambient 3D Glowing Background Light Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4AF37_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

          <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/20 text-gold-300 text-xs font-bold uppercase tracking-widest border border-gold-500/40 shadow-lg shadow-gold-500/10 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-gold-400 animate-spin" style={{ animationDuration: '8s' }} /> Royal Indian Craftsmanship
              </span>

              <h1 className="text-4xl md:text-6xl font-serif font-bold text-cream-50 leading-tight drop-shadow-lg">
                {storeProfile.tagline || 'Timeless Elegance & Royal Heritage Jewellery'}
              </h1>

              <p className="text-sm md:text-base text-slate-300 max-w-xl font-light leading-relaxed drop-shadow-sm">
                Discover hand-crafted Kundan, Polki, Gold & Diamond Jewellery designed for modern royalty. Every piece reflects Indian heritage, fine craftsmanship, and luxury.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 pt-4">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-8 py-4 bg-gold-gradient text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider btn-3d-gold flex items-center justify-center gap-2"
                >
                  <span>Explore Collections</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/categories"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900/90 text-gold-300 border border-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wider btn-3d-dark text-center backdrop-blur-md hover:border-gold-500 transition"
                >
                  View Categories
                </Link>
              </div>
            </div>

            {/* 3D Perspective Hero Frame */}
            <div className="relative preserve-3d">
              <div className="w-full h-[420px] md:h-[500px] rounded-3xl overflow-hidden border-2 border-gold-400/40 shadow-[0_30px_60px_-15px_rgba(212,175,55,0.35)] relative card-3d-gold">
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000"
                  alt="Royal Jewellery"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85" />
                <div className="absolute bottom-6 left-6 right-6 text-white glass-3d-dark p-4 rounded-2xl">
                  <span className="text-gold-300 font-serif font-bold text-xl block">The Royal Kundan Collection</span>
                  <span className="text-xs text-slate-300 font-medium">24K Gold Foil • Fresh Water Pearl Drops</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3D BRAND VALUES CARDS */}
        <section className="py-12 bg-white border-y border-cream-300 relative z-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-cream-50 border border-cream-300 card-3d text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gold-gradient text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm text-slate-900">100% Certified Quality</h4>
              <p className="text-[11px] text-slate-500">Hallmarked 22K Gold & Authentic Polki</p>
            </div>

            <div className="p-5 rounded-2xl bg-cream-50 border border-cream-300 card-3d text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gold-gradient text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm text-slate-900">Insured Free Shipping</h4>
              <p className="text-[11px] text-slate-500">Free delivery on orders over ₹1,999</p>
            </div>

            <div className="p-5 rounded-2xl bg-cream-50 border border-cream-300 card-3d text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gold-gradient text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm text-slate-900">7-Day Easy Returns</h4>
              <p className="text-[11px] text-slate-500">Hassle-free replacement policy</p>
            </div>

            <div className="p-5 rounded-2xl bg-cream-50 border border-cream-300 card-3d text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gold-gradient text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm text-slate-900">Handcrafted Heritage</h4>
              <p className="text-[11px] text-slate-500">Made by master Indian karigars</p>
            </div>
          </div>
        </section>

        {/* 3D FEATURED CATEGORIES SECTION */}
        <section className="py-16 max-w-7xl mx-auto px-4 md:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold text-gold-600 tracking-widest">Royal Collections</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Browse by Jewellery Category</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.id}`}
                className="group relative rounded-3xl overflow-hidden aspect-3/4 bg-slate-950 card-3d border border-gold-500/20"
              >
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85" />
                <div className="absolute bottom-4 left-3 right-3 text-center text-white glass-3d-dark p-3 rounded-xl border border-gold-500/30">
                  <h3 className="font-serif font-bold text-sm text-gold-300">{cat.name}</h3>
                  <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider block mt-0.5">Explore Collection →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3D FEATURED PRODUCTS MASTERPIECES */}
        <section className="py-16 bg-white border-y border-cream-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-gold-600 tracking-widest">Featured Elegance</span>
                <h2 className="text-3xl font-serif font-bold text-slate-900">Handpicked Heritage Masterpieces</h2>
              </div>

              <Link href="/shop" className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1">
                <span>View Full Shop</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((p) => {
                const inWish = isInWishlist(p.id);

                return (
                  <div
                    key={p.id}
                    className="bg-cream-50/80 rounded-3xl border border-cream-300 overflow-hidden card-3d flex flex-col justify-between group"
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-100">
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600'}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="absolute top-3 right-3 p-2.5 rounded-full glass-3d text-slate-700 hover:text-rose-600 transition shadow-lg"
                      >
                        <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-600 text-rose-600' : ''}`} />
                      </button>

                      {p.discount_percentage > 0 && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-gold-gradient text-slate-950 text-[10px] font-bold rounded-full shadow-md">
                          {p.discount_percentage}% OFF
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{p.category_name || 'Jewellery'}</span>
                        <Link href={`/products/${p.id}`} className="font-serif font-bold text-sm text-slate-900 hover:text-gold-600 line-clamp-1 transition mt-0.5">
                          {p.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.material}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                        <div>
                          <span className="text-base font-bold text-slate-900">{formatCurrency(p.selling_price)}</span>
                          {p.discount_percentage > 0 && (
                            <span className="text-xs text-slate-400 line-through block">{formatCurrency(p.original_price)}</span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(p, 1)}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-gold-500 hover:text-slate-950 text-gold-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
