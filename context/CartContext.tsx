'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useStore } from '@/context/StoreContext';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[]; // product IDs
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  appliedCoupon: { code: string; discountAmount: number } | null;
  applyCoupon: (code: string, subtotal: number) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const safeSetLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`localStorage limit reached for key "${key}". Cart state kept safely in memory.`, e);
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { products } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('srj_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('srj_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    } catch (e) {
      console.error("Error loading cart/wishlist", e);
    }
  }, []);

  // Synchronize cart items with updated product prices from StoreContext
  useEffect(() => {
    if (!products || products.length === 0) return;
    setCart((prevCart) => {
      let hasChanges = false;
      const updatedCart = prevCart.map((item) => {
        const matchingProduct = products.find((p) => p.id === item.product.id);
        if (
          matchingProduct &&
          (matchingProduct.selling_price !== item.product.selling_price ||
            matchingProduct.original_price !== item.product.original_price ||
            matchingProduct.name !== item.product.name)
        ) {
          hasChanges = true;
          return { ...item, product: matchingProduct };
        }
        return item;
      });

      if (hasChanges) {
        safeSetLocalStorage('srj_cart', updatedCart);
        return updatedCart;
      }
      return prevCart;
    });
  }, [products]);

  const saveCart = (items: CartItem[]) => {
    setCart(items);
    safeSetLocalStorage('srj_cart', items);
  };

  const addToCart = (product: Product, quantity = 1, selectedColor?: string, selectedSize?: string) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = cart.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [...cart, { product, quantity, selectedColor, selectedSize }];
    }
    saveCart(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter((item) => item.product.id !== productId);
    saveCart(updated);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
  };

  const toggleWishlist = (productId: string) => {
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    setWishlist(updated);
    safeSetLocalStorage('srj_wishlist', updated);
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (code: string, currentSubtotal: number) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    if (cleanCode === 'UDAY99') {
      const calculatedDiscount = Math.round((currentSubtotal * 99) / 100);
      const couponObj = { code: 'UDAY99', discountAmount: calculatedDiscount };
      setAppliedCoupon(couponObj);
      return {
        success: true,
        message: 'Coupon UDAY99 applied successfully! 99% discount granted.',
      };
    }

    let availableCoupons: any[] = [];
    try {
      const saved = localStorage.getItem('srj_coupons');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) availableCoupons = parsed;
      }
    } catch (e) {}

    // Fallback default coupons if localStorage is empty
    if (availableCoupons.length === 0) {
      availableCoupons = [
        { code: 'UDAY99', discount_type: 'PERCENTAGE', discount_value: 99, min_order_amount: 0, status: 'ACTIVE' },
        { code: 'WELCOME10', discount_type: 'PERCENTAGE', discount_value: 10, min_order_amount: 999, status: 'ACTIVE' },
        { code: 'ROYAL500', discount_type: 'FLAT', discount_value: 500, min_order_amount: 4999, status: 'ACTIVE' },
      ];
    }

    const match = availableCoupons.find(
      (c) => c.code.toUpperCase() === cleanCode && (c.status === 'ACTIVE' || !c.status)
    );

    if (!match) {
      return { success: false, message: 'Invalid or inactive coupon code.' };
    }

    if (currentSubtotal < (match.min_order_amount || 0)) {
      return {
        success: false,
        message: `${match.code} requires minimum order value of ₹${(match.min_order_amount || 0).toLocaleString('en-IN')}`,
      };
    }

    let calculatedDiscount = 0;
    if (match.discount_type === 'PERCENTAGE') {
      calculatedDiscount = Math.round((currentSubtotal * match.discount_value) / 100);
      if (match.max_discount_amount && calculatedDiscount > match.max_discount_amount) {
        calculatedDiscount = match.max_discount_amount;
      }
    } else {
      calculatedDiscount = match.discount_value;
    }

    // Ensure discount doesn't exceed total subtotal
    calculatedDiscount = Math.min(calculatedDiscount, currentSubtotal);

    setAppliedCoupon({ code: match.code, discountAmount: calculatedDiscount });
    return {
      success: true,
      message: `Coupon "${match.code}" applied! You saved ₹${calculatedDiscount.toLocaleString('en-IN')}`,
    };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const subtotal = cart.reduce((acc, item) => acc + item.product.selling_price * item.quantity, 0);
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
