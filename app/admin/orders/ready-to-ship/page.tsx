'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, PackageCheck, Phone, MapPin, Check, ArrowLeft, MessageCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, generateWhatsAppUrl } from '@/lib/utils';

export default function ReadyToShipPage() {
  const { orders, updateOrderStatus, storeProfile } = useStore();

  const readyOrders = orders.filter(
    (o) => o.order_status === 'CONFIRMED' || o.order_status === 'PACKED' || o.order_status === 'ORDER PLACED'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Fast Delivery View ("Ready to Ship")</h1>
            <p className="text-xs text-slate-500">
              Streamlined order dispatch desk for immediate packing and courier handover.
            </p>
          </div>
        </div>
      </div>

      {readyOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <PackageCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-serif font-bold text-slate-800">All Pending Orders Shipped!</h3>
          <p className="text-xs text-slate-500">There are no orders awaiting dispatch at this moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {readyOrders.map((order) => {
            const whatsappMsg = `Hello ${order.customer_name}, this is ${storeProfile.store_name} regarding your order #${order.order_number}.`;
            const whatsappUrl = generateWhatsAppUrl(order.customer_phone, whatsappMsg);

            return (
              <div
                key={order.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono font-bold text-slate-900 text-sm">{order.order_number}</span>
                    <span className="text-[10px] text-slate-400 block">{order.payment_method} • {order.payment_status}</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    order.order_status === 'PACKED' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {order.order_status}
                  </span>
                </div>

                {/* Customer & Address Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{order.customer_name}</span>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold hover:bg-emerald-100 transition flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>

                  <p className="text-slate-600 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {order.delivery_address?.address_line1}, {order.delivery_address?.city}, {order.delivery_address?.state} - <strong className="text-slate-900">{order.delivery_address?.pincode}</strong>
                    </span>
                  </p>

                  <p className="text-slate-500 font-mono flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {order.customer_phone}
                  </p>
                </div>

                {/* Items Summary */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Items to Pack ({order.items?.length})</div>
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs font-medium text-slate-800">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="font-bold">{formatCurrency(item.item_total)}</span>
                    </div>
                  ))}
                </div>

                {/* Fast Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  {order.order_status !== 'PACKED' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'PACKED', 'Marked packed from Ready to Ship workspace')}
                      className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Mark as Packed
                    </button>
                  )}

                  <button
                    onClick={() => updateOrderStatus(order.id, 'SHIPPED', 'Dispatched via BlueDart Express', 'BlueDart', 'BD-8839102')}
                    className="flex-1 py-2 bg-gold-gradient text-slate-950 rounded-xl font-bold text-xs hover:opacity-95 transition flex items-center justify-center gap-1"
                  >
                    <Truck className="w-4 h-4" /> Mark as Shipped
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
