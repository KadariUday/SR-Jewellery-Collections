'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Filter, Search, Heart, ShoppingBag } from 'lucide-react';

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const queryParam = searchParams.get('q');

  const { products, categories } = useStore();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>(queryParam || '');
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [sortBy, setSortBy] = useState<'FEATURED' | 'LOW_HIGH' | 'HIGH_LOW'>('FEATURED');

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
    if (queryParam) setSearchQuery(queryParam);
  }, [categoryParam, queryParam]);

  const filteredProducts = products
    .filter((p) => {
      const activeMatch = p.is_active;
      const catMatch = selectedCategory === 'ALL' || p.category_id === selectedCategory;
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const searchMatch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const priceMatch = p.selling_price <= maxPrice;

      return activeMatch && catMatch && searchMatch && priceMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'LOW_HIGH') return a.selling_price - b.selling_price;
      if (sortBy === 'HIGH_LOW') return b.selling_price - a.selling_price;
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-10 w-full space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Catalogue & Collections</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Discover exquisite Indian heritage jewellery. All prices and availability are updated live.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Kundan, Jhumkas, Rings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs focus:ring-2 focus:ring-gold-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-gold-400"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Max Price: {formatCurrency(maxPrice)}</span>
            <input
              type="range"
              min="500"
              max="1000000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-24 accent-gold-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="FEATURED">Featured</option>
              <option value="LOW_HIGH">Price: Low to High</option>
              <option value="HIGH_LOW">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-cream-300 text-center space-y-3">
          <p className="text-slate-500 text-sm">No jewellery items found matching your filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSearchQuery('');
              setMaxPrice(1000000);
            }}
            className="px-4 py-2 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const inWish = isInWishlist(p.id);

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl border border-cream-300 overflow-hidden card-3d flex flex-col justify-between group"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={p.images?.[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-700 hover:text-rose-600 transition"
                  >
                    <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-600 text-rose-600' : ''}`} />
                  </button>

                  {p.discount_percentage > 0 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-gold-500 text-slate-950 text-[10px] font-bold rounded-full">
                      {p.discount_percentage}% OFF
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{p.category_name || 'Jewellery'}</span>
                    <Link href={`/products/${p.id}`} className="font-serif font-bold text-sm text-slate-900 hover:text-gold-600 line-clamp-1 transition">
                      {p.name}
                    </Link>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.material}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-cream-200">
                    <div>
                      <span className="text-base font-bold text-slate-900">{formatCurrency(p.selling_price)}</span>
                      {p.discount_percentage > 0 && (
                        <span className="text-xs text-slate-400 line-through block">{formatCurrency(p.original_price)}</span>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(p, 1)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-gold-500 hover:text-slate-950 text-gold-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
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
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-xs">Loading Catalogue...</div>}>
        <ShopContent />
      </Suspense>
      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
