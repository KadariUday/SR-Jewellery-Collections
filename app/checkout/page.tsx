'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, generateOrderNumber, sanitizeInput, sanitizeUtr } from '@/lib/utils';
import { ShieldCheck, CreditCard, Truck, CheckCircle2, Lock, Loader2, QrCode, Copy, Check, X, Smartphone } from 'lucide-react';
import { CustomerAddress, PaymentMethod } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, discount, clearCart } = useCart();
  const { addresses, addOrder, storeSettings, storeProfile, currentUser, addCustomerAddress } = useStore();

  const userAddresses = currentUser
    ? addresses.filter((a) => a.customer_id === currentUser.id || (currentUser.phone && a.phone === currentUser.phone))
    : [];

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    userAddresses[0]?.id || 'new'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [loading, setLoading] = useState(false);

  // Direct UPI Payment Modal State
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [copiedUpiId, setCopiedUpiId] = useState(false);

  const [addressForm, setAddressForm] = useState<CustomerAddress>({
    id: `addr-${Date.now()}`,
    customer_id: currentUser?.id || '',
    label: 'Home',
    full_name: currentUser?.full_name || '',
    phone: currentUser?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: true,
  });

  const subtotal = cart.reduce((acc, item) => acc + item.product.selling_price * item.quantity, 0);
  const shippingFee = subtotal >= storeSettings.free_shipping_threshold ? 0 : storeSettings.shipping_fee;
  const grandTotal = Math.max(0, subtotal - discount) + shippingFee;

  const storeUpiId = storeProfile.upi_id || '992438853@fam';
  const upiQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(
    `upi://pay?pa=${storeUpiId}&pn=${encodeURIComponent(storeProfile.store_name)}&am=${grandTotal}&cu=INR`
  )}&size=250`;

  // Requirement: Without login they cannot order the product
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-cream-50">
        <Navbar />
        <main className="flex-1 max-w-md mx-auto px-4 py-16 w-full flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gold-gradient flex items-center justify-center text-slate-950 font-bold shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-slate-900">Login Required to Checkout</h1>
            <p className="text-xs text-slate-500">
              Please log in or create an account to place an order. Logging in ensures your purchase history, live tracking, and saved delivery addresses are stored securely under your account.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Link
              href="/login"
              className="flex-1 py-3 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition shadow text-center"
            >
              Customer Login
            </Link>
            <Link
              href="/signup"
              className="flex-1 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl text-xs hover:opacity-95 transition shadow text-center"
            >
              Create Account
            </Link>
          </div>
        </main>
        <WhatsAppFloat />
        <Footer />
      </div>
    );
  }

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(storeUpiId);
    setCopiedUpiId(true);
    setTimeout(() => setCopiedUpiId(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (paymentMethod === 'UPI') {
      setShowUpiModal(true);
      return;
    }

    processOrderPlacement();
  };

  const processOrderPlacement = async () => {
    setLoading(true);

    const sanitizedUtr = sanitizeUtr(upiRefNumber);
    if (paymentMethod === 'UPI' && (!sanitizedUtr || sanitizedUtr.length < 10)) {
      alert('Mandatory UTR Required: Please enter your 12-digit UPI Transaction Ref / UTR number from GPay, PhonePe, or Paytm.');
      setLoading(false);
      return;
    }

    let activeAddress =
      selectedAddressId !== 'new'
        ? userAddresses.find((a) => a.id === selectedAddressId) || addressForm
        : {
            ...addressForm,
            full_name: sanitizeInput(addressForm.full_name),
            phone: sanitizeInput(addressForm.phone),
            address_line1: sanitizeInput(addressForm.address_line1),
            address_line2: sanitizeInput(addressForm.address_line2 || ''),
            city: sanitizeInput(addressForm.city),
            state: sanitizeInput(addressForm.state),
            pincode: sanitizeInput(addressForm.pincode),
          };

    if (selectedAddressId === 'new' && currentUser) {
      const newAddrObj: CustomerAddress = {
        ...activeAddress,
        id: `addr-${Date.now()}`,
        customer_id: currentUser.id,
      };
      addCustomerAddress(newAddrObj);
      activeAddress = newAddrObj;
    }

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((c) => ({
            productId: c.product.id,
            quantity: c.quantity,
            selectedColor: c.selectedColor,
            selectedSize: c.selectedSize,
          })),
          deliveryAddress: activeAddress,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          customerEmail: currentUser?.email || `${activeAddress.full_name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          customerName: activeAddress.full_name,
          customerPhone: activeAddress.phone,
          upiRefNumber: sanitizedUtr || undefined,
          customerId: currentUser?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to place order. Please try again.');
        setLoading(false);
        return;
      }

      setShowUpiModal(false);
      clearCart();
      router.push(`/order-confirmation?orderNumber=${data.order.order_number}`);
    } catch (e: any) {
      alert('Network error while processing order. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-10 w-full space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-serif font-bold text-slate-900">Secure Order Checkout</h1>
          <p className="text-xs text-slate-500">Fast insured delivery directly from SR Jewellery Galleria.</p>
        </div>

        {cart.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-cream-300">
            <p className="text-slate-500 text-sm">Your cart is empty. Please add items before checking out.</p>
            <Link href="/shop" className="text-gold-600 font-bold text-xs underline mt-2 block">
              Return to Shop
            </Link>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Columns: Address & Payment Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address Section */}
              <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b border-cream-200 pb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-gold-500" /> Shipping & Delivery Address
                </h3>

                {/* Saved Address Selector */}
                {userAddresses.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Saved Address
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer text-xs transition ${
                            selectedAddressId === addr.id
                              ? 'border-gold-500 bg-gold-50/50 ring-2 ring-gold-400'
                              : 'border-cream-300 bg-white hover:bg-cream-50'
                          }`}
                        >
                          <span className="font-bold text-slate-900 block">{addr.full_name} ({addr.label})</span>
                          <p className="text-slate-600 line-clamp-2 mt-1">{addr.address_line1}, {addr.city}</p>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">Phone: {addr.phone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Address Form */}
                <div className="space-y-4 pt-3 border-t border-cream-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.full_name}
                        onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                        className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Street Address & House / Flat No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.address_line1}
                      onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                      className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">PIN Code *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-slate-900 border-b border-cream-200 pb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold-500" /> Select Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                      paymentMethod === 'UPI'
                        ? 'border-gold-500 bg-gold-50/60 ring-2 ring-gold-400'
                        : 'border-cream-300 bg-white hover:bg-cream-50'
                    }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'UPI'} onChange={() => {}} />
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">Direct UPI Payment (GPay / PhonePe / Paytm)</span>
                      <span className="text-[10px] text-slate-500 block">Scan QR Code & transfer directly to store UPI ID</span>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition ${
                      paymentMethod === 'COD'
                        ? 'border-gold-500 bg-gold-50/60 ring-2 ring-gold-400'
                        : 'border-cream-300 bg-white hover:bg-cream-50'
                    }`}
                  >
                    <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => {}} />
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-slate-500 block">Pay cash on delivery</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Review & Total Calculation */}
            <div className="bg-white rounded-2xl border border-cream-300 p-6 shadow-sm space-y-6">
              <h3 className="font-serif font-bold text-base text-slate-900 border-b border-cream-200 pb-3">
                Order Review ({cart.length} items)
              </h3>

              <div className="divide-y divide-cream-100 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 block truncate max-w-[180px]">{item.product.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatCurrency(item.product.selling_price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs border-t border-cream-200 pt-4 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-slate-900">{shippingFee === 0 ? 'FREE' : formatCurrency(shippingFee)}</span>
                </div>

                <div className="flex justify-between font-bold text-base text-slate-900 border-t border-cream-200 pt-3 mt-2">
                  <span>Total Payable</span>
                  <span className="text-gold-600">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-lg shadow-gold-500/20 hover:opacity-95 transition text-xs flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>{paymentMethod === 'UPI' ? 'Proceed to Scan & Pay via UPI' : 'Confirm & Place COD Order'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* DIRECT UPI SCAN & PAY MODAL */}
        {showUpiModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative border border-cream-300 animate-in fade-in zoom-in duration-200 text-center">
              <button
                onClick={() => setShowUpiModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 pt-2">
                <div className="w-12 h-12 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center mx-auto shadow-inner">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-xl text-slate-900">Direct UPI Scan & Pay</h3>
                <p className="text-xs text-slate-500">Scan with Google Pay, PhonePe, Paytm, or BHIM</p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-slate-900 rounded-2xl inline-block border border-gold-500/30 shadow-lg">
                <img
                  src={upiQrUrl}
                  alt="Store UPI QR Code"
                  className="w-48 h-48 mx-auto rounded-xl bg-white p-2"
                />
                <span className="text-gold-400 font-mono font-bold text-sm block mt-2">
                  Payable Amount: {formatCurrency(grandTotal)}
                </span>
              </div>

              {/* UPI VPA Box */}
              <div className="p-3 bg-cream-100 rounded-xl border border-cream-300 text-xs flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Store UPI ID</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{storeUpiId}</span>
                </div>
                <button
                  onClick={handleCopyUpiId}
                  className="px-3 py-1.5 bg-slate-900 text-gold-400 font-bold rounded-lg hover:bg-slate-800 transition text-[11px] flex items-center gap-1"
                >
                  {copiedUpiId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpiId ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Transaction UTR Entry (MANDATORY) */}
              <div className="text-left space-y-1.5">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>12-Digit UPI UTR / Ref ID</span>
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">REQUIRED *</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiRefNumber}
                  onChange={(e) => setUpiRefNumber(e.target.value)}
                  placeholder="Enter 12-digit UTR (e.g. 423456789012)"
                  className={`w-full px-3.5 py-2.5 bg-cream-50 border ${
                    upiRefNumber && upiRefNumber.trim().length < 10 ? 'border-rose-400 focus:ring-rose-400' : 'border-cream-300 focus:ring-gold-400'
                  } rounded-xl text-xs font-mono font-bold text-slate-900 shadow-inner`}
                />
                <span className="text-[10px] text-slate-500 block font-medium">
                  {upiRefNumber.trim().length < 10 ? (
                    <span className="text-rose-600 font-bold">⚠️ Enter valid 12-digit UTR from your GPay / PhonePe / Paytm receipt to submit.</span>
                  ) : (
                    <span className="text-emerald-600 font-bold">✓ 12-Digit UTR Entered</span>
                  )}
                </span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUpiModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={processOrderPlacement}
                  disabled={loading || upiRefNumber.trim().length < 10}
                  className="flex-1 py-3 bg-gold-gradient text-slate-950 font-bold rounded-xl shadow-md hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition text-xs flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming...</span>
                    </>
                  ) : (
                    <span>Submit & Confirm Order</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
