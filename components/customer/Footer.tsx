'use client';

import React from 'react';
import Link from 'next/link';
import { Gem, MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube, ShieldCheck, Code2, Sparkles, Rocket, Laptop, ExternalLink, CheckCircle2, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatPhoneNumber } from '@/lib/utils';

export const Footer: React.FC = () => {
  const { storeProfile } = useStore();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-10 pb-8 border-t border-slate-800">
      {/* VISION VERSE24 DEVELOPER PROMOTION ADVERTISEMENT BANNER (TOP OF FOOTER) */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl border border-indigo-500/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center relative z-10">
            {/* Left Info Column */}
            <div className="space-y-3 lg:col-span-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 text-[11px] font-extrabold uppercase tracking-widest border border-pink-500/40 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-pink-400" /> VISION VERSE24
                </span>
                <span className="text-[11px] text-slate-400 font-mono">IDEAS. CODE. IMPACT.</span>
              </div>

              <h3 className="text-xl md:text-2xl font-serif font-bold text-white tracking-wide">
                Want a Professional Website Like This For Your Business?
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed font-light">
                We build modern, high-converting responsive e-commerce stores, business websites, portfolio sites, and custom web applications that grow your online sales!
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-300">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Business Websites (Starting @ ₹1,500)</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> College & Portfolio Sites (@ ₹499 - ₹699)</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fast Delivery & 24/7 Support</span>
              </div>
            </div>

            {/* Right Call To Action Column */}
            <div className="flex flex-col items-stretch lg:items-end justify-center space-y-3">
              <a
                href="https://instagram.com/vision_verse24"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold rounded-2xl shadow-xl shadow-pink-600/30 hover:scale-105 transition text-xs flex items-center justify-center gap-2 text-center"
              >
                <Instagram className="w-4 h-4" />
                <span>DM ON INSTAGRAM @vision_verse24</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <span className="text-[10px] text-slate-400 text-center lg:text-right font-medium">
                ⚡ Free Website Consultation • No Obligation
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Store Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
        {/* Brand Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt={storeProfile.store_name}
              className="w-10 h-10 rounded-full object-cover border border-gold-500 shadow-md p-0.5 bg-slate-950"
            />
            <span className="font-serif font-bold text-xl text-gold-400">
              {storeProfile.store_name}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {storeProfile.description}
          </p>
          <div className="flex items-center gap-3 pt-2 text-gold-400">
            {storeProfile.instagram_url && (
              <a href={storeProfile.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 hover:bg-gold-500 hover:text-slate-950 transition">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {storeProfile.facebook_url && (
              <a href={storeProfile.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 hover:bg-gold-500 hover:text-slate-950 transition">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {storeProfile.youtube_url && (
              <a href={storeProfile.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-slate-900 hover:bg-gold-500 hover:text-slate-950 transition">
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3 text-xs">
          <h4 className="font-serif font-bold text-sm text-gold-400 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/shop" className="hover:text-gold-400 transition">Shop All Collections</Link></li>
            <li><Link href="/categories" className="hover:text-gold-400 transition">Browse Categories</Link></li>
            <li><Link href="/track-order" className="hover:text-gold-400 transition">Track Your Order</Link></li>
            <li><Link href="/about" className="hover:text-gold-400 transition">About SR Jewellery</Link></li>
            <li><Link href="/contact" className="hover:text-gold-400 transition">Contact Customer Support</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div className="space-y-3 text-xs">
          <h4 className="font-serif font-bold text-sm text-gold-400 uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link href="/jewellery-care" className="hover:text-gold-400 transition">Jewellery Care Guide</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-gold-400 transition">Shipping & Delivery Policy</Link></li>
            <li><Link href="/return-policy" className="hover:text-gold-400 transition">7-Day Easy Returns</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-gold-400 transition">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-gold-400 transition">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Live Contact & Location */}
        <div className="space-y-3 text-xs">
          <h4 className="font-serif font-bold text-sm text-gold-400 uppercase tracking-wider">Visit Our Galleria</h4>
          <div className="space-y-2.5 text-slate-400">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <span>{storeProfile.address}, {storeProfile.city}, {storeProfile.state} - {storeProfile.pincode}</span>
            </p>

            <p className="flex items-center gap-2 font-semibold text-slate-200">
              <Phone className="w-4 h-4 text-gold-400 shrink-0" />
              <span>{formatPhoneNumber(storeProfile.phone)}</span>
            </p>

            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold-400 shrink-0" />
              <span>{storeProfile.email}</span>
            </p>

            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400 shrink-0" />
              <span>{storeProfile.business_hours}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Admin Access */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs gap-4">
        <p>© 2026 {storeProfile.store_name}. Handcrafted in India • Designed & Developed by <a href="https://instagram.com/vision_verse24" target="_blank" rel="noopener noreferrer" className="text-pink-400 font-bold hover:underline">Vision Verse24 (@vision_verse24)</a></p>
        <Link href="/admin/login" className="text-slate-400 hover:text-gold-400 transition font-semibold">
          Admin Portal Access →
        </Link>
      </div>
    </footer>
  );
};
