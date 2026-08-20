'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  Phone,
  MessageCircle,
  Printer,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate, generateWhatsAppUrl, getOrderStatusBadgeClass } from '@/lib/utils';
import { exportToCSV, printOrderInvoice } from '@/lib/exportUtils';
import { OrderStatus } from '@/lib/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orders, updateOrderStatus, storeProfile } = useStore();

  const orderId = params?.id as string;
  const order = orders.find((o) => o.id === orderId || o.order_number === orderId);

  const [newStatus, setNewStatus] = useState<OrderStatus>(order?.order_status || 'ORDER PLACED');
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED'>(order?.payment_status || 'PENDING');
  const [note, setNote] = useState('');
  const [courierName, setCourierName] = useState(order?.delivery_details?.courier_name || 'BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState(order?.delivery_details?.tracking_number || 'BD-884920192');

  // Sync state when order data finishes loading asynchronously
  React.useEffect(() => {
    if (order) {
      setNewStatus(order.order_status);
      setPaymentStatus(order.payment_status);
      if (order.delivery_details?.courier_name) setCourierName(order.delivery_details.courier_name);
      if (order.delivery_details?.tracking_number) setTrackingNumber(order.delivery_details.tracking_number);
    }
  }, [order?.id, order?.order_status, order?.payment_status]);

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Record Not Found.</h2>
        <Link href="/admin/orders" className="text-gold-600 font-semibold underline mt-2 block">
          Return to Orders Workspace
        </Link>
      </div>
    );
  }

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderStatus(order.id, newStatus, note, courierName, trackingNumber, paymentStatus);
    alert(`Order #${order.order_number} status updated to ${newStatus} (${paymentStatus})`);
  };

  const handleExportSingleCSV = () => {
    exportToCSV(
      [
        {
          OrderID: order.id,
          OrderNumber: order.order_number,
          CustomerName: order.customer_name,
          CustomerPhone: order.customer_phone,
          CustomerEmail: order.customer_email,
          TotalAmount: order.total_amount,
          PaymentMethod: order.payment_method,
          PaymentStatus: order.payment_status,
          OrderStatus: order.order_status,
          City: order.delivery_address?.city,
          Pincode: order.delivery_address?.pincode,
          Date: order.created_at,
        },
      ],
      `Order_${order.order_number}`
    );
  };

  const whatsappMsg = `Hello ${order.customer_name}, this is ${storeProfile.store_name} regarding your order #${order.order_number}.`;
  const whatsappUrl = generateWhatsAppUrl(order.customer_phone, whatsappMsg);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold text-slate-900">Order #{order.order_number}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getOrderStatusBadgeClass(order.order_status)}`}>
                {order.order_status}
              </span>
            </div>
            <p className="text-xs text-slate-500">Placed on {formatDate(order.created_at)}</p>
          </div>
        </div>

        {/* Quick Actions & Invoice Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => printOrderInvoice(order, storeProfile)}
            className="px-3.5 py-2 bg-gold-gradient text-slate-950 rounded-xl text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Tax Invoice
          </button>

          <button
            onClick={handleExportSingleCSV}
            className="px-3.5 py-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> CSV Export
          </button>

          <a
            href={`tel:${order.customer_phone}`}
            className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-gold-400" /> Call
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Order Details & Status Update Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Update Control */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gold-500" /> Update Order & Shipping Status
            </h3>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Order Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-gold-400"
                  >
                    <option value="ORDER PLACED">ORDER PLACED</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PACKED">PACKED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="SUCCESS">SUCCESS (Payment Verified & Completed)</option>
                    <option value="PENDING">PENDING (Awaiting Payment / Verification)</option>
                    <option value="FAILED">FAILED</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Courier / Partner Name
                  </label>
                  <input
                    type="text"
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. BlueDart / DTDC / Delhivery"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BD-993810293"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status Update Note
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Packed in velvet box, dispatched"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition"
              >
                Save Status & Notify Customer
              </button>
            </form>
          </div>

          {/* Purchased Items List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gold-500" /> Purchased Items ({order.items?.length || 0})
            </h3>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product_image || 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=200'}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">{item.product_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-900 text-xs">{formatCurrency(item.purchased_price)} x {item.quantity}</span>
                    <span className="block text-xs font-bold text-gold-600">{formatCurrency(item.item_total)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount Applied</span>
                  <span>-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>{order.shipping_fee === 0 ? 'FREE' : formatCurrency(order.shipping_fee)}</span>
              </div>

              <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-200 pt-2 mt-2">
                <span>Total Order Amount</span>
                <span className="text-gold-600">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline History */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gold-500" /> Status History Timeline
              </h3>

              <div className="space-y-4">
                {order.status_history.map((hist, idx) => (
                  <div key={hist.id || idx} className="flex gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 shrink-0 ring-4 ring-gold-100" />
                    <div>
                      <div className="font-bold text-slate-800">
                        {hist.new_status} <span className="text-slate-400 font-normal">by {hist.admin_name || 'Admin'}</span>
                      </div>
                      {hist.note && <p className="text-slate-500 text-[11px] mt-0.5">{hist.note}</p>}
                      <span className="text-[10px] text-slate-400 block mt-0.5">{formatDate(hist.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer & Delivery Address Card */}
        <div className="space-y-6">
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-gold-500" /> Customer Information
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Full Name</span>
                <span className="font-bold text-slate-900 text-sm">{order.customer_name}</span>
              </div>

              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Phone Number</span>
                <span className="font-semibold text-slate-800">{order.customer_phone}</span>
              </div>

              <div>
                <span className="text-slate-400 block uppercase font-bold text-[10px]">Email Address</span>
                <span className="text-slate-700">{order.customer_email}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold-500" /> Delivery Address & Location
              </h3>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">
                {order.delivery_address?.label || 'Shipping Destination'}
              </span>
            </div>

            <div className="text-xs text-slate-700 space-y-1 bg-cream-50/70 p-3.5 rounded-xl border border-cream-200">
              <p className="font-bold text-slate-900 text-sm">{order.delivery_address?.full_name || order.customer_name}</p>
              <p className="font-medium text-slate-800">{order.delivery_address?.address_line1}</p>
              {order.delivery_address?.address_line2 && <p className="text-slate-600">{order.delivery_address.address_line2}</p>}
              <p className="font-bold text-slate-900">
                {order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pincode}
              </p>
              <p className="text-slate-600 pt-1 font-mono">Phone: {order.delivery_address?.phone || order.customer_phone}</p>
            </div>

            {/* Admin Location Tools */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const addrStr = `${order.delivery_address?.full_name || order.customer_name}, ${order.delivery_address?.address_line1}, ${order.delivery_address?.address_line2 ? order.delivery_address.address_line2 + ', ' : ''}${order.delivery_address?.city}, ${order.delivery_address?.state} - ${order.delivery_address?.pincode}, Phone: ${order.delivery_address?.phone || order.customer_phone}`;
                  navigator.clipboard.writeText(addrStr);
                  alert('Full shipping address copied to clipboard!');
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1.5"
              >
                📋 Copy Full Address
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${order.delivery_address?.address_line1}, ${order.delivery_address?.city}, ${order.delivery_address?.state} ${order.delivery_address?.pincode}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 bg-gold-50 hover:bg-gold-100 text-gold-900 text-[11px] font-bold rounded-xl border border-gold-300 transition flex items-center justify-center gap-1.5"
              >
                📍 Open Google Maps
              </a>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold-500" /> Payment Breakdown
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Method</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{order.payment_method}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Status</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  order.payment_status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.payment_status}
                </span>
              </div>

              {order.payment_method === 'COD' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold mt-2">
                  COD Order: Collect {formatCurrency(order.total_amount)} on delivery.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
