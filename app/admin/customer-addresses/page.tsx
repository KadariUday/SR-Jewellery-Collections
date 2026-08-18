'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Download,
  Filter,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatDate, generateWhatsAppUrl, getOrderStatusBadgeClass } from '@/lib/utils';
import { exportToCSV } from '@/lib/exportUtils';

export default function CustomerAddressesDashboardPage() {
  const { orders, storeProfile } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const addressList = orders.map((o) => ({
    orderId: o.id,
    orderNumber: o.order_number,
    orderStatus: o.order_status,
    paymentMethod: o.payment_method,
    created_at: o.created_at,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    address: o.delivery_address,
  }));

  const filteredAddresses = addressList.filter((item) => {
    const searchMatch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerPhone.includes(searchTerm) ||
      item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.address?.pincode?.includes(searchTerm);

    const statusMatch = statusFilter === 'ALL' || item.orderStatus === statusFilter;
    return searchMatch && statusMatch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const csvData = filteredAddresses.map((item) => ({
      OrderNumber: item.orderNumber,
      CustomerName: item.customerName,
      CustomerPhone: item.customerPhone,
      AddressLine1: item.address?.address_line1 || '',
      AddressLine2: item.address?.address_line2 || '',
      City: item.address?.city || '',
      State: item.address?.state || '',
      Pincode: item.address?.pincode || '',
      OrderStatus: item.orderStatus,
      OrderDate: formatDate(item.created_at),
    }));

    exportToCSV(csvData, 'Customer_Delivery_Addresses');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Customer Delivery Address Workspace</h1>
          <p className="text-xs text-slate-500">
            Dedicated operational hub for fast dispatch, customer phone calls, WhatsApp updates, and courier label copying.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 text-gold-400 font-bold rounded-xl hover:bg-slate-800 transition text-xs shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Addresses (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Name, Phone, Order ID, City, PIN code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-4 h-4 text-gold-500" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="ALL">All Delivery Statuses</option>
            <option value="ORDER PLACED">ORDER PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Delivery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAddresses.map((item) => {
          const fullAddrString = `${item.address?.full_name || item.customerName}, ${item.address?.address_line1}${item.address?.address_line2 ? `, ${item.address.address_line2}` : ''}, ${item.address?.city}, ${item.address?.state} - ${item.address?.pincode}`;
          
          const whatsappMsg = `Hello ${item.customerName}, this is ${storeProfile.store_name} regarding your order #${item.orderNumber}.`;
          const whatsappUrl = generateWhatsAppUrl(item.customerPhone, whatsappMsg);

          return (
            <div
              key={item.orderId}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-gold-300 transition"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-xs block">{item.orderNumber}</span>
                  <span className="text-[10px] text-slate-400">{formatDate(item.created_at)}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getOrderStatusBadgeClass(item.orderStatus)}`}>
                  {item.orderStatus}
                </span>
              </div>

              {/* Customer Contact & Address Info */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer</span>
                  <span className="font-bold text-slate-900 text-sm">{item.customerName}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gold-500" /> Delivery Address
                  </span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {item.address?.address_line1}
                    {item.address?.address_line2 && `, ${item.address.address_line2}`}
                  </p>
                  <p className="font-bold text-slate-900">
                    {item.address?.city}, {item.address?.state} - <span className="text-gold-600 font-mono">{item.address?.pincode}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                  <span className="font-mono font-semibold text-slate-800">{item.customerPhone}</span>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${item.customerPhone}`}
                    className="py-2 px-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition text-center flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-gold-400" /> CALL
                  </a>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition text-center flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WHATSAPP
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                  <button
                    onClick={() => handleCopy(item.customerPhone, `phone-${item.orderId}`)}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    {copiedId === `phone-${item.orderId}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy Phone
                  </button>

                  <button
                    onClick={() => handleCopy(fullAddrString, `addr-${item.orderId}`)}
                    className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    {copiedId === `addr-${item.orderId}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy Address
                  </button>

                  <Link
                    href={`/admin/orders/${item.orderId}`}
                    className="py-1.5 bg-gold-100 hover:bg-gold-200 text-gold-900 rounded-lg flex items-center justify-center gap-1 transition text-center"
                  >
                    View Order
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
