'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ShoppingBag, Truck, Star, X, Send, CheckCircle2 } from 'lucide-react';
import { OrderItem } from '@/lib/types';

export default function CustomerOrdersPage() {
  const { orders, currentUser, addReview } = useStore();

  // Review Modal State
  const [activeReviewItem, setActiveReviewItem] = useState<{ item: OrderItem; orderNumber: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-50">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-16 w-full flex flex-col items-center justify-center text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-gold-500 mx-auto" />
          <h1 className="text-2xl font-serif font-bold text-slate-900">Please Log In</h1>
          <p className="text-xs text-slate-500">You must be logged in to view your order history.</p>
          <Link href="/login" className="px-6 py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs">
            Log In Now
          </Link>
        </main>
        <WhatsAppFloat />
        <Footer />
      </div>
    );
  }

  const currentCustomer = currentUser;

  const myOrders = orders.filter(
    (o) =>
      o.customer_id === currentCustomer.id ||
      (currentCustomer.email && o.customer_email.toLowerCase() === currentCustomer.email.toLowerCase()) ||
      (currentCustomer.phone && o.customer_phone === currentCustomer.phone)
  );

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewItem || !comment.trim()) return;

    addReview({
      product_id: activeReviewItem.item.product_id,
      product_name: activeReviewItem.item.product_name,
      customer_id: currentCustomer.id,
      customer_name: currentCustomer.full_name,
      customer_email: currentCustomer.email,
      rating,
      title: title.trim() || `Verified Review for ${activeReviewItem.item.product_name}`,
      comment: comment.trim(),
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setActiveReviewItem(null);
      setTitle('');
      setComment('');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-6 py-12 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900">My Orders & Purchases</h1>
          <p className="text-xs text-slate-500">
            Showing order history for <strong className="text-slate-800">{currentCustomer.full_name}</strong>.
          </p>
        </div>

        {myOrders.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-cream-300 space-y-2">
            <p className="text-slate-500 text-xs">No orders found for your account.</p>
            <Link href="/shop" className="text-gold-600 font-bold text-xs underline inline-block">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((ord) => (
              <div key={ord.id} className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-cream-200 pb-3">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-sm block">{ord.order_number}</span>
                    <span className="text-[10px] text-slate-400">Placed on {formatDate(ord.created_at)}</span>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold text-xs uppercase">
                    {ord.order_status}
                  </span>
                </div>

                <div className="divide-y divide-cream-100">
                  {ord.items?.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-4">
                      <div className="flex items-center gap-3">
                        {item.product_image && (
                          <img src={item.product_image} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                        )}
                        <div>
                          <span className="font-semibold text-slate-800 block">{item.quantity}x {item.product_name}</span>
                          <span className="text-[10px] font-mono text-slate-400">{formatCurrency(item.purchased_price)} each</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900">{formatCurrency(item.item_total)}</span>
                        <button
                          onClick={() => {
                            setActiveReviewItem({ item, orderNumber: ord.order_number });
                            setRating(5);
                            setTitle('');
                            setComment('');
                          }}
                          className="px-3 py-1.5 bg-gold-50 text-gold-700 border border-gold-300 font-bold rounded-lg text-[11px] hover:bg-gold-100 transition flex items-center gap-1"
                        >
                          <Star className="w-3 h-3 fill-gold-500 text-gold-500" />
                          <span>Write Review</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-cream-200 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Total Paid: {formatCurrency(ord.total_amount)} ({ord.payment_method})</span>
                    {(ord.upi_utr || ord.notes?.includes('UTR')) && (
                      <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        UTR: {ord.upi_utr || ord.notes?.replace('UPI UTR Ref: ', '')}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/track-order?orderNumber=${ord.order_number}`}
                    className="px-4 py-2 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-slate-800 transition w-fit"
                  >
                    <Truck className="w-3.5 h-3.5" /> Live Tracking
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WRITE PRODUCT REVIEW MODAL */}
        {activeReviewItem && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative border border-cream-300 animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setActiveReviewItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 text-center">
                <div className="w-12 h-12 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto shadow-inner">
                  <Star className="w-6 h-6 fill-gold-500" />
                </div>
                <h3 className="font-serif font-bold text-xl text-slate-900">Review Product</h3>
                <p className="text-xs text-slate-500 font-semibold">{activeReviewItem.item.product_name}</p>
              </div>

              {submittedSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                  <span>Review Published Successfully!</span>
                  <p className="text-[11px] font-normal text-emerald-600">Thank you for rating your purchase.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Star Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-110 transition"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Headline / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Gorgeous Kundan set, fits perfectly!"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Detailed Review *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your experience about the gold finish, packaging, and quality..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-slate-800"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveReviewItem(null)}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Review</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
