'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CheckCircle2, Truck } from 'lucide-react';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  const { orders } = useStore();
  const order = orders.find((o) => o.order_number === orderNumber) || orders[0];

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 md:px-6 py-16 w-full space-y-8 text-center">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-slate-900">Thank You for Your Order!</h1>
        <p className="text-sm text-slate-600">
          Your jewellery order <strong className="font-mono text-gold-600">#{order?.order_number || 'SRJ-SUCCESS'}</strong> has been placed and received by store managers.
        </p>
      </div>

      {order && (
        <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm text-left space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-cream-200 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Order Number</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{order.order_number}</span>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs">
              {order.order_status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Address</span>
              <p className="font-bold text-slate-800">{order.delivery_address?.full_name}</p>
              <p>{order.delivery_address?.address_line1}</p>
              <p>{order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pincode}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Details</span>
              <p className="font-bold text-slate-800">{order.payment_method} ({order.payment_status})</p>
              {(order.upi_utr || order.notes?.includes('UTR')) && (
                <p className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit mt-1">
                  UTR: {order.upi_utr || order.notes?.replace('UPI UTR Ref: ', '')}
                </p>
              )}
              <p className="text-base font-bold text-gold-600 mt-1">Total: {formatCurrency(order.total_amount)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href={`/track-order?orderNumber=${order?.order_number || ''}`}
          className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Status</span>
        </Link>

        <Link
          href="/shop"
          className="w-full sm:w-auto px-8 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl text-xs hover:opacity-95 transition"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-xs">Loading Order Details...</div>}>
        <OrderConfirmationContent />
      </Suspense>
      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
