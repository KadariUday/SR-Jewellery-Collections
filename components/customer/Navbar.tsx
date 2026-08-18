'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Gem,
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Phone,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { storeProfile, storeSettings, categories, currentUser } = useStore();
  const { cart, wishlist } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-cream-300/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08)]">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-900 text-gold-300 text-[11px] py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-4">
        <span>✨ Free Express Insured Delivery on orders over {formatCurrency(storeSettings.free_shipping_threshold)}</span>
        <span className="hidden md:inline">|</span>
        <span className="hidden md:inline flex items-center gap-1">
          <Phone className="w-3 h-3 text-gold-400 inline" /> {storeProfile.phone}
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img
            src="/logo.jpg"
            alt={storeProfile.store_name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gold-500 shadow-md p-0.5 bg-slate-950"
          />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg md:text-xl text-slate-900 tracking-wide">
              {storeProfile.store_name}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-gold-600 font-semibold">
              Royal Heritage Jewellery
            </span>
          </div>
        </Link>

        {/* Navigation Links with 3D Active Indicators */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <Link
            href="/"
            className={`transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/')
                ? 'text-slate-950 font-bold bg-gold-100/90 border-b-2 border-gold-500 shadow-[0_4px_12px_rgba(212,175,55,0.3)] rounded-t-xl px-3 py-2 scale-105'
                : 'hover:text-gold-600 px-2 py-1'
            }`}
          >
            {isActive('/') && <span className="w-1.5 h-1.5 rounded-full bg-gold-600 animate-pulse shrink-0" />}
            <span>Home</span>
          </Link>

          <div className="relative group py-6">
            <Link
              href="/shop"
              className={`transition-all duration-200 flex items-center gap-1.5 ${
                isActive('/shop')
                  ? 'text-slate-950 font-bold bg-gold-100/90 border-b-2 border-gold-500 shadow-[0_4px_12px_rgba(212,175,55,0.3)] rounded-t-xl px-3 py-2 scale-105'
                  : 'hover:text-gold-600 px-2 py-1'
              }`}
            >
              {isActive('/shop') && <span className="w-1.5 h-1.5 rounded-full bg-gold-600 animate-pulse shrink-0" />}
              <span>Shop Collections</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-600" />
            </Link>

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 space-y-1">
              <Link href="/shop" className="block px-3 py-2 hover:bg-gold-50 text-slate-800 rounded-lg normal-case font-medium">
                All Jewellery
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.id}`}
                  className="block px-3 py-2 hover:bg-gold-50 text-slate-800 rounded-lg normal-case font-medium"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/categories"
            className={`transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/categories')
                ? 'text-slate-950 font-bold bg-gold-100/90 border-b-2 border-gold-500 shadow-[0_4px_12px_rgba(212,175,55,0.3)] rounded-t-xl px-3 py-2 scale-105'
                : 'hover:text-gold-600 px-2 py-1'
            }`}
          >
            {isActive('/categories') && <span className="w-1.5 h-1.5 rounded-full bg-gold-600 animate-pulse shrink-0" />}
            <span>Categories</span>
          </Link>

          <Link
            href="/about"
            className={`transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/about')
                ? 'text-slate-950 font-bold bg-gold-100/90 border-b-2 border-gold-500 shadow-[0_4px_12px_rgba(212,175,55,0.3)] rounded-t-xl px-3 py-2 scale-105'
                : 'hover:text-gold-600 px-2 py-1'
            }`}
          >
            {isActive('/about') && <span className="w-1.5 h-1.5 rounded-full bg-gold-600 animate-pulse shrink-0" />}
            <span>About Us</span>
          </Link>

          <Link
            href="/contact"
            className={`transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/contact')
                ? 'text-slate-950 font-bold bg-gold-100/90 border-b-2 border-gold-500 shadow-[0_4px_12px_rgba(212,175,55,0.3)] rounded-t-xl px-3 py-2 scale-105'
                : 'hover:text-gold-600 px-2 py-1'
            }`}
          >
            {isActive('/contact') && <span className="w-1.5 h-1.5 rounded-full bg-gold-600 animate-pulse shrink-0" />}
            <span>Contact</span>
          </Link>

          <Link
            href="/track-order"
            className={`transition-all duration-200 flex items-center gap-1.5 ${
              isActive('/track-order')
                ? 'text-emerald-950 font-bold bg-emerald-100/90 border-b-2 border-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.3)] rounded-t-xl px-3 py-2 scale-105'
                : 'hover:text-gold-600 text-emerald-800 font-bold px-2 py-1'
            }`}
          >
            {isActive('/track-order') && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />}
            <span>Track Order</span>
          </Link>
        </nav>

        {/* Search Bar & Action Buttons */}
        <div className="flex items-center gap-4">
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex relative w-44 md:w-56">
            <input
              type="text"
              placeholder="Search Kundan, Jhumkas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-8 py-1.5 bg-cream-100 border border-cream-300 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-gold-400 text-slate-800"
            />
            <button type="submit" className="absolute right-2 top-2 text-slate-400 hover:text-gold-600">
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Wishlist */}
          <Link href="/wishlist" className="relative p-2 text-slate-700 hover:text-gold-600 transition" title="Wishlist">
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-[0_4px_10px_rgba(225,29,72,0.4)]">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Shopping Cart Counter */}
          <Link href="/cart" className="relative p-2 text-slate-700 hover:text-gold-600 transition" title="Shopping Cart">
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-gold-gradient text-slate-950 rounded-full text-[9px] font-bold flex items-center justify-center shadow-[0_4px_10px_rgba(212,175,55,0.5)]">
                {totalCartCount}
              </span>
            )}
          </Link>

          {/* Customer Account */}
          <Link
            href={currentUser ? '/account' : '/login'}
            className="p-2 text-slate-700 hover:text-gold-600 transition relative"
            title={currentUser ? `Account: ${currentUser.full_name}` : 'Login / Sign Up'}
          >
            <User className="w-5 h-5" />
            {currentUser && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 lg:hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 font-semibold text-xs text-slate-800">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2">
            Home
          </Link>
          <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-2">
            Shop Collections
          </Link>
          <Link href="/categories" onClick={() => setMobileMenuOpen(false)} className="block py-2">
            Categories
          </Link>
          <Link href="/track-order" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-emerald-700 font-bold">
            Track Order
          </Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2">
            About Us
          </Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2">
            Contact Us
          </Link>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-slate-500">
            <Link href="/admin/login" className="text-gold-600 font-bold">
              Admin Login →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
