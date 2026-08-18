'use client';

import React from 'react';
import { Package, Layers, Plus } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminCategoriesPage() {
  const { categories, products } = useStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Category Management</h1>
          <p className="text-xs text-slate-500">Organize jewellery catalogue into royal collections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id).length;
          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="h-36 overflow-hidden relative">
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white font-serif font-bold text-lg">{cat.name}</span>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs font-bold text-slate-800">
                  <span>{count} Products</span>
                  <span className="text-gold-600 font-mono">/{cat.slug}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
