'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { exportToCSV } from '@/lib/exportUtils';

export default function AdminProductsPage() {
  const { products, categories, updateProduct, deleteProduct, addProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<number>(0);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((item) => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleBulkStatusToggle = (isActive: boolean) => {
    selectedProductIds.forEach((id) => {
      updateProduct(id, { is_active: isActive });
    });
    alert(`Updated ${selectedProductIds.length} products to ${isActive ? 'Published' : 'Draft'}`);
    setSelectedProductIds([]);
  };

  const handleDuplicate = (id: string) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const { id: _, created_at: __, updated_at: ___, ...copyData } = prod;
    addProduct({
      ...copyData,
      name: `${prod.name} (Copy)`,
      sku: `${prod.sku}-COPY-${Math.floor(Math.random() * 1000)}`,
      slug: `${prod.slug}-copy-${Date.now()}`,
    });
  };

  const handleStockSave = (id: string) => {
    updateProduct(id, { stock_quantity: tempStock });
    setEditingStockId(null);
  };

  const handleExportCSV = () => {
    const csvData = filteredProducts.map((p) => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category_name || 'Jewellery',
      OriginalPrice: p.original_price,
      SellingPrice: p.selling_price,
      Discount: `${p.discount_percentage}%`,
      StockQuantity: p.stock_quantity,
      Status: p.is_active ? 'Published' : 'Draft',
      Material: p.material,
      StoneType: p.stone_type,
    }));

    exportToCSV(csvData, 'Product_Catalogue');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Product Management</h1>
          <p className="text-xs text-slate-500">
            Single source of truth for catalogue prices, stock levels, and store visibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl hover:bg-slate-800 transition text-xs shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Catalogue (CSV)</span>
          </button>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-lg shadow-gold-500/20 hover:opacity-95 transition text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-4 h-4 text-gold-500" />
            <span>Category:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-gold-400"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedProductIds.length > 0 && (
        <div className="p-3 bg-gold-50 border border-gold-200 rounded-xl flex items-center justify-between text-xs text-gold-900 font-bold">
          <span>{selectedProductIds.length} item(s) selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatusToggle(true)}
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Publish Selected
            </button>
            <button
              onClick={() => handleBulkStatusToggle(false)}
              className="px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Unpublish Selected
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    className="w-4 h-4 text-gold-500 rounded"
                  />
                </th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Price</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const categoryName =
                    categories.find((c) => c.id === p.category_id)?.name || p.category_name || 'Uncategorized';
                  const isLowStock = p.stock_quantity <= p.low_stock_threshold;
                  const isSelected = selectedProductIds.includes(p.id);

                  return (
                    <tr key={p.id} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-gold-50/30' : ''}`}>
                      <td className="p-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(p.id)}
                          className="w-4 h-4 text-gold-500 rounded"
                        />
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=200'}
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{p.name}</span>
                            <span className="text-[10px] text-slate-400">
                              {p.material} • {p.stone_type}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-600 font-semibold">{p.sku}</td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{formatCurrency(p.selling_price)}</div>
                        {p.discount_percentage > 0 && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(p.original_price)} ({p.discount_percentage}% OFF)
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        {editingStockId === p.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={tempStock}
                              onChange={(e) => setTempStock(parseInt(e.target.value) || 0)}
                              className="w-16 p-1 border rounded text-xs font-bold text-slate-800"
                            />
                            <button
                              onClick={() => handleStockSave(p.id)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingStockId(p.id);
                              setTempStock(p.stock_quantity);
                            }}
                            className="cursor-pointer hover:bg-slate-100 p-1 rounded transition inline-flex items-center gap-1"
                            title="Click to edit stock quantity"
                          >
                            <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>
                              {p.stock_quantity} pcs
                            </span>
                            {isLowStock && <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium">
                          {categoryName}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => updateProduct(p.id, { is_active: !p.is_active })}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border transition ${
                            p.is_active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {p.is_active ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                          <span>{p.is_active ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>

                      <td className="p-3.5 text-right space-x-1">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="p-1.5 inline-block text-slate-500 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition"
                          title="Edit product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDuplicate(p.id)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Duplicate product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
