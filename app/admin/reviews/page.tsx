'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, XCircle, Trash2, Search, Filter, MessageSquare, ThumbsUp, Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatDate } from '@/lib/utils';

export default function AdminReviewsPage() {
  const { reviews, updateReviewStatus, deleteReview } = useStore();
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const totalCount = reviews.length;
  const approvedCount = reviews.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = reviews.filter((r) => r.status === 'PENDING').length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
    : '5.0';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Product Reviews & Feedback Hub</h1>
          <p className="text-xs text-slate-500">
            Moderate, approve, reject, or manage customer product ratings submitted from Product Pages & Customer Orders.
          </p>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Average Store Rating</span>
            <span className="text-2xl font-serif font-bold text-slate-900">{avgRating} / 5.0</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Approved Reviews</span>
            <span className="text-2xl font-bold text-emerald-700">{approvedCount} Published</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Feedback Collected</span>
            <span className="text-2xl font-bold text-slate-900">{totalCount} Reviews</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                filterStatus === st
                  ? 'bg-slate-900 text-gold-400 shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? `All (${totalCount})` : st === 'APPROVED' ? `Approved (${approvedCount})` : st === 'PENDING' ? `Pending (${pendingCount})` : 'Rejected'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search customer or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-gold-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Reviews List Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No product reviews found matching your search criteria.
          </div>
        ) : (
          filteredReviews.map((r) => (
            <div key={r.id} className="p-6 space-y-3 text-xs hover:bg-slate-50/50 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{r.customer_name}</span>
                    <span className="text-slate-400">({r.customer_email})</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block font-semibold mt-0.5">
                    Product: <strong className="text-gold-700">{r.product_name}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                    ))}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      r.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              </div>

              {/* Review Content */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                {r.title && <h5 className="font-serif font-bold text-slate-900 text-sm">{r.title}</h5>}
                <p className="text-slate-700 leading-relaxed italic">"{r.comment}"</p>
                <span className="text-[10px] text-slate-400 font-mono block pt-1" suppressHydrationWarning>
                  Submitted on {formatDate(r.created_at)}
                </span>
              </div>

              {/* Admin Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                {r.status !== 'APPROVED' && (
                  <button
                    onClick={() => updateReviewStatus(r.id, 'APPROVED')}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] hover:bg-emerald-100 transition flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Review</span>
                  </button>
                )}

                {r.status !== 'REJECTED' && (
                  <button
                    onClick={() => updateReviewStatus(r.id, 'REJECTED')}
                    className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold text-[11px] hover:bg-amber-100 transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  onClick={() => deleteReview(r.id)}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] hover:bg-rose-100 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
