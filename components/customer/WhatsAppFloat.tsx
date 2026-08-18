'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { generateWhatsAppUrl } from '@/lib/utils';

export const WhatsAppFloat: React.FC = () => {
  const { storeProfile } = useStore();

  const msg = `Hello ${storeProfile.store_name}, I have an inquiry regarding your jewellery collections.`;
  const url = generateWhatsAppUrl(storeProfile.whatsapp || storeProfile.phone || '918790522579', msg);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-3.5 bg-emerald-600 text-white rounded-full shadow-2xl hover:bg-emerald-500 hover:scale-110 transition duration-300 flex items-center gap-2 group ring-4 ring-emerald-600/30"
      title="Chat with SR Jewellery Team on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-white stroke-emerald-600" />
      <span className="hidden group-hover:inline text-xs font-bold pr-1">Chat on WhatsApp</span>
    </a>
  );
};
