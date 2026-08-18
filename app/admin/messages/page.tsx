'use client';

import React from 'react';
import { MessageSquare, Phone, Mail, MessageCircle, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatDate, generateWhatsAppUrl } from '@/lib/utils';
import { ContactMessage } from '@/lib/types';

export default function AdminMessagesPage() {
  const { messages, updateMessageStatus, storeProfile } = useStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Contact Messages & Customer Inquiries</h1>
          <p className="text-xs text-slate-500">
            Messages sent by customers from the storefront Contact Us page. Respond instantly via WhatsApp or Call.
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
          No customer inquiries received yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((msg) => {
            const whatsappMsg = `Hello ${msg.name}, thank you for contacting ${storeProfile.store_name} regarding "${msg.subject || 'your inquiry'}".`;
            const whatsappUrl = generateWhatsAppUrl(msg.phone || '', whatsappMsg);

            return (
              <div
                key={msg.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{msg.name}</h3>
                    <span className="text-[10px] text-slate-400 block">{formatDate(msg.created_at)}</span>
                  </div>

                  <select
                    value={msg.status}
                    onChange={(e) => updateMessageStatus(msg.id, e.target.value as any)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      msg.status === 'NEW'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : msg.status === 'READ'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    <option value="NEW">NEW</option>
                    <option value="READ">READ</option>
                    <option value="REPLIED">REPLIED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className="space-y-2 text-xs">
                  {msg.subject && (
                    <div className="font-semibold text-slate-800">
                      Subject: <span className="text-gold-600 font-serif">{msg.subject}</span>
                    </div>
                  )}

                  <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-700 leading-relaxed italic">
                    "{msg.message}"
                  </p>

                  <div className="space-y-0.5 text-[11px] text-slate-500">
                    <p>Email: <span className="font-mono text-slate-800">{msg.email}</span></p>
                    {msg.phone && <p>Phone: <span className="font-mono text-slate-800">{msg.phone}</span></p>}
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs font-bold">
                  {msg.phone ? (
                    <>
                      <a
                        href={`tel:${msg.phone}`}
                        className="py-2 bg-slate-900 text-white rounded-xl text-center flex items-center justify-center gap-1 hover:bg-slate-800 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-gold-400" /> CALL
                      </a>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 bg-emerald-600 text-white rounded-xl text-center flex items-center justify-center gap-1 hover:bg-emerald-700 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WHATSAPP
                      </a>
                    </>
                  ) : (
                    <div className="col-span-2 text-slate-400 text-[10px] self-center">No phone provided</div>
                  )}

                  <a
                    href={`mailto:${msg.email}`}
                    className="py-2 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-center flex items-center justify-center gap-1 hover:bg-slate-200 transition"
                  >
                    <Mail className="w-3.5 h-3.5" /> EMAIL
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
