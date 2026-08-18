'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, Trash2, Tag, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, subtotal, discount, total, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { storeSettings, currentUser } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; text: string } | null>(null);

  const shippingFee = subtotal >= storeSettings.free_shipping_threshold ? 0 : storeSettings.shipping_fee;
  const grandTotal = total + shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput, subtotal);
    setCouponMsg({ success: res.success, text: res.message });
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-10 w-full space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Your Shopping Cart</h1>
          <p className="text-xs text-slate-500">Review selected jewellery items before checkout.</p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-cream-300 text-center space-y-4 max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-slate-800">Your Cart is Currently Empty</h3>
            <p className="text-xs text-slate-500">Discover our handcrafted Kundan, Jhumkas, and Royal Bridal sets.</p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl text-xs shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-300 p-6 shadow-sm space-y-4">
              <div className="divide-y divide-cream-200">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=200'}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-cream-300 shrink-0"
                      />
                      <div>
                        <Link href={`/products/${item.product.id}`} className="font-serif font-bold text-sm text-slate-900 hover:text-gold-600 block">
                          {item.product.name}
                        </Link>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {item.product.sku}</span>
                        <span className="text-xs font-bold text-slate-900 block mt-1">{formatCurrency(item.product.selling_price)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-cream-300 bg-cream-50 rounded-xl overflow-hidden text-xs">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2.5 py-1 font-bold text-slate-700 hover:bg-cream-200"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2.5 py-1 font-bold text-slate-700 hover:bg-cream-200"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 text-sm">{formatCurrency(item.product.selling_price * item.quantity)}</span>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & Coupon Input */}
            <div className="bg-white rounded-2xl border border-cream-300 p-6 shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-base text-slate-900 border-b border-cream-200 pb-3">Order Summary</h3>

              {/* Coupon Form */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Coupon Code</label>
                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-emerald-800">{appliedCoupon.code} (-{formatCurrency(appliedCoupon.discountAmount)})</span>
                    <button onClick={removeCoupon} className="text-rose-600 font-bold hover:underline">Remove</button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. UDAY99"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs uppercase font-mono"
                    />
                    <button type="submit" className="px-4 py-2 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs">
                      Apply
                    </button>
                  </form>
                )}

                {couponMsg && (
                  <p className={`text-[11px] font-semibold ${couponMsg.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {couponMsg.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-cream-200 pt-4 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-900">{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}</span>
                </div>

                <div className="flex justify-between font-bold text-base text-slate-900 border-t border-cream-200 pt-3 mt-2">
                  <span>Grand Total</span>
                  <span className="text-gold-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!currentUser) {
                    router.push('/login');
                  } else {
                    router.push('/checkout');
                  }
                }}
                className="w-full py-3.5 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-lg shadow-gold-500/20 hover:opacity-95 transition text-xs flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
