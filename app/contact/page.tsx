'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/customer/Navbar';
import { Footer } from '@/components/customer/Footer';
import { WhatsAppFloat } from '@/components/customer/WhatsAppFloat';
import { useStore } from '@/context/StoreContext';
import { sanitizeInput, formatPhoneNumber } from '@/lib/utils';
import { MapPin, Phone, Mail, Clock, MessageSquare, CheckCircle2, Send } from 'lucide-react';

export default function ContactUsPage() {
  const { storeProfile, addContactMessage } = useStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    addContactMessage({
      name: sanitizeInput(form.name),
      email: sanitizeInput(form.email),
      phone: sanitizeInput(form.phone),
      subject: sanitizeInput(form.subject) || 'General Inquiry',
      message: sanitizeInput(form.message),
    });
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-12 w-full space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-gold-600">Get in Touch</span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Contact {storeProfile.store_name}</h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Our jewellery consultants are available to assist you with custom bridal orders, sizing, and inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Details (Live Database Synchronization) */}
          <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-xl text-slate-900 border-b border-cream-200 pb-4">
              Galleria Information
            </h3>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Store Address</span>
                  <p>{storeProfile.address}</p>
                  <p>{storeProfile.city}, {storeProfile.state} - {storeProfile.pincode}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Phone Assistance</span>
                  <span className="font-mono text-slate-800 text-sm font-semibold">{formatPhoneNumber(storeProfile.phone)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Email Inquiries</span>
                  <span className="font-mono text-slate-800">{storeProfile.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Business Hours</span>
                  <span>{storeProfile.business_hours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-xl text-slate-900 border-b border-cream-200 pb-4">
              Send Us a Message
            </h3>

            {submitted && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you! Your message has been sent directly to store administrators.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Custom Bridal Set"
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can our jewellery team assist you today?"
                  className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-gold-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Message to Store</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      <WhatsAppFloat />
      <Footer />
    </div>
  );
}
