'use client';

import React, { useState } from 'react';
import { Boxes, Plus, Minus, RotateCcw, AlertTriangle, CheckCircle2, History, Package } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatDate } from '@/lib/utils';

export default function AdminInventoryPage() {
  const { products, inventoryHistory, adjustStock } = useStore();
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(5);
  const [reason, setReason] = useState('Stock shipment received');
  const [activeTab, setActiveTab] = useState<'STOCK' | 'HISTORY'>('STOCK');

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleAdjust = (mode: 'ADD' | 'SUBTRACT' | 'SET') => {
    if (!selectedProduct) return;

    let newStock = selectedProduct.stock_quantity;
    if (mode === 'ADD') newStock += adjustmentAmount;
    if (mode === 'SUBTRACT') newStock = Math.max(0, newStock - adjustmentAmount);
    if (mode === 'SET') newStock = adjustmentAmount;

    adjustStock(selectedProduct.id, newStock, reason);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Inventory & Stock Control</h1>
          <p className="text-xs text-slate-500">
            Real-time stock monitoring, inventory adjustments, and audit history.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-200 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('STOCK')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'STOCK' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inventory Table
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'HISTORY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock Audit History ({inventoryHistory.length})
          </button>
        </div>
      </div>

      {/* Stock Adjustment Action Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Boxes className="w-5 h-5 text-gold-500" /> Stock Adjustment Manager
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku} | Stock: {p.stock_quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Quantity Amount
            </label>
            <input
              type="number"
              min="1"
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reason / Note
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Shipment received, damaged, recount"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleAdjust('ADD')}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>

            <button
              onClick={() => handleAdjust('SUBTRACT')}
              className="flex-1 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition flex items-center justify-center gap-1"
            >
              <Minus className="w-4 h-4" /> Deduct
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'STOCK' ? (
        /* Inventory Status Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Product & SKU</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Current Stock</th>
                  <th className="p-3.5">Threshold</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  let statusText = 'IN STOCK';
                  let statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  if (p.stock_quantity <= 0) {
                    statusText = 'OUT OF STOCK';
                    statusBg = 'bg-rose-50 text-rose-800 border-rose-200';
                  } else if (p.stock_quantity <= p.low_stock_threshold) {
                    statusText = 'LOW STOCK';
                    statusBg = 'bg-amber-50 text-amber-800 border-amber-200';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                      </td>

                      <td className="p-3.5 text-slate-600 font-medium">{p.category_name || 'Jewellery'}</td>

                      <td className="p-3.5 font-bold text-slate-900 text-sm">{p.stock_quantity} units</td>

                      <td className="p-3.5 text-slate-500">{p.low_stock_threshold} units</td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusBg}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory History Audit Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Previous</th>
                  <th className="p-3.5">New</th>
                  <th className="p-3.5">Difference</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 text-slate-500">{formatDate(log.created_at)}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{log.product_name}</td>
                    <td className="p-3.5 text-slate-600">{log.previous_stock}</td>
                    <td className="p-3.5 font-bold text-slate-900">{log.new_stock}</td>
                    <td className="p-3.5">
                      <span className={`font-bold ${log.change_amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{log.reason}</td>
                    <td className="p-3.5 text-slate-400 text-[11px]">{log.admin_name || 'Admin'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
