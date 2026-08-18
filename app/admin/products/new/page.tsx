'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Trash2, Plus, Image as ImageIcon, Sparkles, Star, Link as LinkIcon } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { compressImageFile } from '@/lib/exportUtils';

export default function AddProductPage() {
  const router = useRouter();
  const { categories, addProduct } = useStore();

  const [formData, setFormData] = useState({
    name: '',
    sku: `SRJ-${Math.floor(100 + Math.random() * 900)}`,
    slug: '',
    category_id: categories[0]?.id || '',
    description: '',
    original_price: 1999,
    selling_price: 1499,
    discount_percentage: 25,
    stock_quantity: 15,
    low_stock_threshold: 5,
    material: '22K Gold Plated Brass',
    stone_type: 'Polki & Kundan',
    colour: 'Gold',
    weight: '45g',
    size: 'Free Size',
    dimensions: '6cm x 4cm',
    care_instructions: 'Avoid direct contact with perfumes and moisture. Store in dry cloth pouch.',
    shipping_info: 'Dispatched within 24 hours. Free insured delivery available.',
    return_info: '7-day easy return policy for unworn items with original box.',
    tags: 'Gold, Kundan, Bridal, Wedding',
    is_featured: true,
    is_new_arrival: true,
    is_best_seller: false,
    is_active: true,
  });

  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const calculateDiscount = (orig: number, sell: number) => {
    if (orig <= 0) return 0;
    return Math.round(((orig - sell) / orig) * 100);
  };

  const handlePriceChange = (orig: number, sell: number) => {
    const disc = calculateDiscount(orig, sell);
    setFormData((prev) => ({
      ...prev,
      original_price: orig,
      selling_price: sell,
      discount_percentage: disc,
    }));
  };

  // Local File Upload Handler with Canvas Compression
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const compressedDataUrl = await compressImageFile(file);
        setImages((prev) => [...prev, compressedDataUrl]);
      } catch (err) {
        console.error("Error compressing image file", err);
      }
    }

    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImages((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const remaining = images.filter((_, idx) => idx !== index);
    setImages([selected, ...remaining]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      alert('Please fill out Product Name and SKU.');
      return;
    }

    const tagArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    addProduct({
      ...formData,
      slug: slug || `prod-${Date.now()}`,
      tags: tagArray,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800'],
    });

    router.push('/admin/products');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Add New Jewellery Product</h1>
            <p className="text-xs text-slate-500">
              Create a new item in catalogue. Updates will sync live to the customer storefront.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-5 py-2.5 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-lg shadow-gold-500/20 hover:opacity-95 transition text-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save & Publish</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              General Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Kundan Pearl Choker Set"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-gold-400 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Product Code / SKU *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-gold-400"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of craftsmanship, design inspiration, and heritage..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-gold-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Pricing & Stock Management */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Pricing & Stock Control (Single Source of Truth)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.original_price}
                  onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0, formData.selling_price)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.selling_price}
                  onChange={(e) => handlePriceChange(formData.original_price, parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-gold-600 focus:ring-2 focus:ring-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  readOnly
                  value={formData.discount_percentage}
                  className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Available Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Low-Stock Warning Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 5 })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Jewellery Specifications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Jewellery Attributes & Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Material</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  placeholder="e.g. 22K Gold Plated Brass"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Stone Type</label>
                <input
                  type="text"
                  value={formData.stone_type}
                  onChange={(e) => setFormData({ ...formData, stone_type: e.target.value })}
                  placeholder="e.g. Kundan / Polki / Pearls"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Colour</label>
                <input
                  type="text"
                  value={formData.colour}
                  onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Weight</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g. 45g"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Size</label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="e.g. Free Size / Adjustable"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Dimensions</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="e.g. 6cm x 3cm"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Care Instructions</label>
              <input
                type="text"
                value={formData.care_instructions}
                onChange={(e) => setFormData({ ...formData, care_instructions: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Media, Visibility Flags & Tags */}
        <div className="space-y-6">
          {/* Enhanced Product Images Manager (File Upload & URL Paste) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gold-500" /> Product Images
              </span>
              <span className="text-[10px] text-slate-400 font-normal">{images.length} added</span>
            </h3>

            {/* File Upload Zone */}
            <label className="border-2 border-dashed border-gold-300 hover:border-gold-500 bg-gold-50/40 hover:bg-gold-50 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center group">
              <Upload className="w-7 h-7 text-gold-600 group-hover:scale-110 transition mb-1" />
              <span className="font-bold text-xs text-slate-900 block">Upload Image File(s)</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Click to choose PNG, JPG, WEBP from device</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Paste Image URL Box */}
            <div className="space-y-1 pt-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or Paste Image URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-gold-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3.5 py-1.5 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition"
                >
                  Add URL
                </button>
              </div>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Image Gallery (First is Primary)</span>
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-50 shadow-sm">
                      <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                      
                      {/* Hover Overlay Controls */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="p-1.5 bg-gold-500 text-slate-950 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-gold-400"
                            title="Set as Primary"
                          >
                            <Star className="w-3 h-3 fill-slate-950" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {idx === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-slate-950/90 text-gold-400 text-[9px] font-bold rounded flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-gold-400" /> Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Marketing & Badges Toggles */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-500" /> Store Badges & Visibility
            </h3>

            <div className="space-y-3 text-xs font-semibold text-slate-700">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span>Published on Website</span>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-gold-500 rounded focus:ring-gold-400"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span>Featured Product (Home Page)</span>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-gold-500 rounded focus:ring-gold-400"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span>New Arrival Badge</span>
                <input
                  type="checkbox"
                  checked={formData.is_new_arrival}
                  onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                  className="w-4 h-4 text-gold-500 rounded focus:ring-gold-400"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span>Best Seller Badge</span>
                <input
                  type="checkbox"
                  checked={formData.is_best_seller}
                  onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                  className="w-4 h-4 text-gold-500 rounded focus:ring-gold-400"
                />
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Search Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="Gold, Jhumka, Kundan, Bridal"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
