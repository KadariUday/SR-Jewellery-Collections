'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Product,
  Category,
  Order,
  CustomerAddress,
  UserProfile,
  StoreProfile,
  StoreSettings,
  ContactMessage,
  InventoryHistory,
  PaymentTransaction,
  AdminActivityLog,
  CustomerNote,
  OrderStatus,
  Coupon,
  ProductReview,
} from '@/lib/types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_CUSTOMER_ADDRESSES,
  INITIAL_STORE_PROFILE,
  INITIAL_STORE_SETTINGS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_INVENTORY_HISTORY,
  INITIAL_PAYMENTS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_CUSTOMER_NOTES,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
} from '@/lib/mockData';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: UserProfile[];
  addresses: CustomerAddress[];
  storeProfile: StoreProfile;
  storeSettings: StoreSettings;
  messages: ContactMessage[];
  inventoryHistory: InventoryHistory[];
  payments: PaymentTransaction[];
  activityLogs: AdminActivityLog[];
  customerNotes: CustomerNote[];
  currentUser: UserProfile | null;
  coupons: Coupon[];
  reviews: ProductReview[];

  // User Session Actions
  loginCustomer: (user: Partial<UserProfile>) => UserProfile;
  logoutCustomer: () => void;
  addCustomerAddress: (address: CustomerAddress) => void;

  // Coupon actions
  addCoupon: (coupon: Omit<Coupon, 'id' | 'created_at' | 'usage_count'>) => Coupon;
  updateCouponStatus: (id: string, status: Coupon['status']) => void;
  deleteCoupon: (id: string) => void;

  // Review actions
  addReview: (review: Omit<ProductReview, 'id' | 'created_at' | 'status'>) => ProductReview;
  updateReviewStatus: (id: string, status: ProductReview['status']) => void;
  deleteReview: (id: string) => void;

  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, newStock: number, reason: string) => void;

  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Order;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    courierName?: string,
    trackingNumber?: string
  ) => void;

  // Profile & settings actions
  updateStoreProfile: (updates: Partial<StoreProfile>) => void;
  updateStoreSettings: (updates: Partial<StoreSettings>) => void;

  // Customer & notes actions
  addCustomerNote: (customerId: string, noteText: string) => void;
  addContactMessage: (msg: Omit<ContactMessage, 'id' | 'created_at' | 'status'>) => void;
  updateMessageStatus: (id: string, status: ContactMessage['status']) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const safeSetLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`localStorage storage limit reached for key "${key}". Order state remains safely in React memory.`, e);
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [customers, setCustomers] = useState<UserProfile[]>(INITIAL_CUSTOMERS);
  const [addresses, setAddresses] = useState<CustomerAddress[]>(INITIAL_CUSTOMER_ADDRESSES);
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(INITIAL_STORE_PROFILE);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_STORE_SETTINGS);
  const [messages, setMessages] = useState<ContactMessage[]>(INITIAL_CONTACT_MESSAGES);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistory[]>(INITIAL_INVENTORY_HISTORY);
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>(INITIAL_CUSTOMER_NOTES);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [reviews, setReviews] = useState<ProductReview[]>(INITIAL_REVIEWS);

  // Load persisted store data from localStorage if available
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('srj_store_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        if (parsed.logo_url && parsed.logo_url.includes('unsplash.com')) {
          parsed.logo_url = '/logo.jpg';
          safeSetLocalStorage('srj_store_profile', parsed);
        }
        setStoreProfile(parsed);
      }

      // Load products from local storage first
      const savedProducts = localStorage.getItem('srj_products');
      let initialProductsList: Product[] = [];

      if (savedProducts) {
        try {
          const parsed = JSON.parse(savedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialProductsList = parsed;
          }
        } catch (e) {
          console.warn('Error parsing saved products', e);
        }
      }

      // If local storage didn't have products, initialize with INITIAL_PRODUCTS
      if (initialProductsList.length === 0) {
        initialProductsList = [...INITIAL_PRODUCTS];
      } else {
        // Merge any newly added default INITIAL_PRODUCTS missing from local storage
        const existingIds = new Set(initialProductsList.map((p) => p.id));
        INITIAL_PRODUCTS.forEach((initP) => {
          if (!existingIds.has(initP.id)) {
            initialProductsList.push(initP);
          }
        });
      }

      setProducts(initialProductsList);
      safeSetLocalStorage('srj_products', initialProductsList);

      const savedOrders = localStorage.getItem('srj_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) setOrders(parsed);
      }

      const savedSettings = localStorage.getItem('srj_store_settings');
      if (savedSettings) setStoreSettings(JSON.parse(savedSettings));

      const savedAddresses = localStorage.getItem('srj_addresses');
      if (savedAddresses) setAddresses(JSON.parse(savedAddresses));

      const savedMessages = localStorage.getItem('srj_messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }

      const savedCoupons = localStorage.getItem('srj_coupons');
      if (savedCoupons) {
        const parsed = JSON.parse(savedCoupons);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed];
          const udayIndex = merged.findIndex((c) => c.code.toUpperCase() === 'UDAY99');
          if (udayIndex > -1) {
            merged[udayIndex] = {
              ...merged[udayIndex],
              code: 'UDAY99',
              discount_type: 'PERCENTAGE',
              discount_value: 99,
              min_order_amount: 0,
              status: 'ACTIVE',
            };
          } else {
            merged.unshift({
              id: 'coup-uday99',
              code: 'UDAY99',
              discount_type: 'PERCENTAGE',
              discount_value: 99,
              min_order_amount: 0,
              max_discount_amount: 0,
              status: 'ACTIVE',
              usage_count: 99,
              created_at: new Date().toISOString(),
            });
          }
          setCoupons(merged);
          safeSetLocalStorage('srj_coupons', merged);
        }
      }

      const savedReviews = localStorage.getItem('srj_reviews');
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews);
        if (Array.isArray(parsed) && parsed.length > 0) setReviews(parsed);
      }

      const savedUser = localStorage.getItem('srj_active_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) setCurrentUser(parsed);
      }

      // Fetch live products from Next.js server API (/api/products) for cross-device sync
      try {
        fetch('/api/products')
          .then((res) => res.json())
          .then((apiData) => {
            if (apiData && Array.isArray(apiData.products) && apiData.products.length > 0) {
              const apiProducts = apiData.products as Product[];
              setProducts((prevLocalProducts) => {
                const mergedMap = new Map<string, Product>();
                // Load local products first
                prevLocalProducts.forEach((lp) => mergedMap.set(lp.id, lp));

                // Merge API products prioritizing server updated prices
                apiProducts.forEach((ap) => {
                  const existing = mergedMap.get(ap.id);
                  if (!existing) {
                    mergedMap.set(ap.id, ap);
                  } else {
                    const localTime = new Date(existing.updated_at || 0).getTime();
                    const apiTime = new Date(ap.updated_at || 0).getTime();
                    if (apiTime >= localTime) {
                      mergedMap.set(ap.id, ap);
                    }
                  }
                });

                const mergedList = Array.from(mergedMap.values());
                safeSetLocalStorage('srj_products', mergedList);
                return mergedList;
              });
            }
          })
          .catch((err) => console.warn('Note: API products fetch:', err));
      } catch (e) {}

      // Fetch live products from Supabase if available
      try {
        supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const supaProducts = data as Product[];
            const mergedMap = new Map<string, Product>();

            // Supabase live database products take highest priority
            supaProducts.forEach((sp) => mergedMap.set(sp.id, sp));

            setProducts((prevLocalProducts) => {
              // Preserve any locally created unsynced products
              prevLocalProducts.forEach((lp) => {
                if (!mergedMap.has(lp.id)) {
                  mergedMap.set(lp.id, lp);
                }
              });

              const mergedList = Array.from(mergedMap.values());
              safeSetLocalStorage('srj_products', mergedList);
              return mergedList;
            });
          }
        });

        // Fetch live store profile from Supabase
        supabase.from('store_profile').select('*').single().then(({ data, error }) => {
          if (!error && data) {
            setStoreProfile(data as StoreProfile);
            safeSetLocalStorage('srj_store_profile', data);
          }
        });

        // Fetch live store settings from Supabase
        supabase.from('store_settings').select('*').single().then(({ data, error }) => {
          if (!error && data) {
            setStoreSettings(data as StoreSettings);
            safeSetLocalStorage('srj_store_settings', data);
          }
        });
      } catch (e) { }
    } catch (e) {
      console.error("Error loading persisted store context", e);
    }
  }, []);

  // Real-time cross-tab and same-window synchronization for products
  useEffect(() => {
    const syncProducts = () => {
      try {
        const saved = localStorage.getItem('srj_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        }
      } catch (e) {}
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'srj_products') {
        syncProducts();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('srj_products_updated', syncProducts);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('srj_products_updated', syncProducts);
    };
  }, []);

  const loginCustomer = (userData: Partial<UserProfile>): UserProfile => {
    const existing = customers.find(
      (c) =>
        (userData.email && c.email.toLowerCase() === userData.email.toLowerCase()) ||
        (userData.phone && c.phone === userData.phone)
    );

    let userObj: UserProfile;
    if (existing) {
      userObj = { ...existing, ...userData };
    } else {
      userObj = {
        id: `cust-${Date.now()}`,
        email: userData.email || `${userData.full_name?.toLowerCase().replace(/\s+/g, '') || 'user'}@example.com`,
        full_name: userData.full_name || 'Valued Customer',
        phone: userData.phone || '+91 98765 00000',
        role: 'CUSTOMER',
        created_at: new Date().toISOString(),
      };
      setCustomers((prev) => [userObj, ...prev]);
    }

    setCurrentUser(userObj);
    safeSetLocalStorage('srj_active_user', userObj);
    return userObj;
  };

  const logoutCustomer = () => {
    localStorage.removeItem('srj_active_user');
    setCurrentUser(null);
  };

  const addCustomerAddress = (newAddress: CustomerAddress) => {
    const updated = [newAddress, ...addresses];
    setAddresses(updated);
    safeSetLocalStorage('srj_addresses', updated);
  };

  const addProduct = (newProdData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    const id = `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...newProdData,
      id,
      created_at: now,
      updated_at: now,
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    safeSetLocalStorage('srj_products', updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('srj_products_updated'));
    }

    // Sync to server-side API route for cross-device sync
    try {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ADD', product: newProduct }),
      }).catch((e) => console.warn('API add product note:', e));
    } catch (e) {}

    // Sync to Supabase via upsert
    const { category_name, ...cleanItem } = newProduct;
    try {
      supabase.from('products').upsert([cleanItem]).then(({ error }) => {
        if (error) console.error('Supabase product insert note:', error.message);
      });
    } catch (e) {}

    // Audit Log
    logActivity('CREATE_PRODUCT', 'PRODUCT', id, `Added new product "${newProduct.name}" (SKU: ${newProduct.sku})`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    let updatedItem: Product | undefined;
    const updated = products.map((p) => {
      if (p.id === id) {
        updatedItem = { ...p, ...updates, updated_at: now };
        return updatedItem;
      }
      return p;
    });
    setProducts(updated);
    safeSetLocalStorage('srj_products', updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('srj_products_updated'));
    }

    // Sync to server-side API route for cross-device sync
    if (updatedItem) {
      try {
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'UPDATE', product: updatedItem }),
        }).catch((e) => console.warn('API update product note:', e));
      } catch (e) {}
    }

    // Sync to Supabase via upsert
    if (updatedItem) {
      const { category_name, ...cleanItem } = updatedItem;
      try {
        supabase.from('products').upsert([cleanItem]).then(({ error }) => {
          if (error) {
            console.error('Supabase product update note:', error.message);
          } else {
            console.log('Product price successfully synced to Supabase for ID:', id);
          }
        });
      } catch (e) {}
    }

    logActivity('UPDATE_PRODUCT', 'PRODUCT', id, `Updated product details for ID ${id}`);
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    safeSetLocalStorage('srj_products', updated);

    // Sync to server-side API route
    try {
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', id }),
      }).catch((e) => console.warn('API delete product note:', e));
    } catch (e) {}

    // Sync to Supabase
    try {
      supabase.from('products').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase product delete note:', error.message);
      });
    } catch (e) {}

    logActivity('DELETE_PRODUCT', 'PRODUCT', id, `Deleted product "${prod?.name || id}"`);
  };

  const adjustStock = (productId: string, newStock: number, reason: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const previousStock = prod.stock_quantity;
    const diff = newStock - previousStock;

    updateProduct(productId, { stock_quantity: newStock });

    const newLog: InventoryHistory = {
      id: `inv-${Date.now()}`,
      product_id: productId,
      product_name: prod.name,
      sku: prod.sku,
      previous_stock: previousStock,
      new_stock: newStock,
      change_amount: diff,
      reason,
      admin_name: 'Sushmitha Admin',
      created_at: new Date().toISOString(),
    };

    setInventoryHistory((prev) => [newLog, ...prev]);
    logActivity('ADJUST_INVENTORY', 'PRODUCT', productId, `Changed stock for "${prod.name}" from ${previousStock} to ${newStock} (${reason})`);
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Order => {
    const id = `ord-${Date.now()}`;
    const now = new Date().toISOString();

    // Sanitize item images to prevent bloating storage
    const sanitizedItems = orderData.items.map((item) => ({
      ...item,
      product_image: item.product_image && item.product_image.length > 500
        ? 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400'
        : item.product_image,
    }));

    const newOrder: Order = {
      ...orderData,
      items: sanitizedItems,
      id,
      created_at: now,
      updated_at: now,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    safeSetLocalStorage('srj_orders', updatedOrders);

    // Deduct stock
    newOrder.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        const nextStock = Math.max(0, prod.stock_quantity - item.quantity);
        adjustStock(item.product_id, nextStock, `Customer order #${newOrder.order_number}`);
      }
    });

    // Create payment transaction record
    const newPay: PaymentTransaction = {
      id: `pay-${Date.now()}`,
      order_id: id,
      order_number: newOrder.order_number,
      customer_id: newOrder.customer_id,
      customer_name: newOrder.customer_name,
      payment_method: newOrder.payment_method,
      provider: newOrder.payment_method === 'COD' ? 'COD_RECEIPT' : 'RAZORPAY_TEST',
      amount: newOrder.total_amount,
      status: newOrder.payment_status,
      verified: newOrder.payment_status === 'SUCCESS',
      created_at: now,
    };
    setPayments((prev) => [newPay, ...prev]);

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    courierName?: string,
    trackingNumber?: string
  ) => {
    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        const oldStatus = ord.order_status;
        let paymentStatus = ord.payment_status;

        // Auto update payment status for COD on delivery
        if (newStatus === 'DELIVERED' && ord.payment_method === 'COD') {
          paymentStatus = 'SUCCESS';
        }

        const newHistory = [
          ...(ord.status_history || []),
          {
            id: `hist-${Date.now()}`,
            order_id: orderId,
            old_status: oldStatus,
            new_status: newStatus,
            admin_name: 'Sushmitha Admin',
            note: note || `Status changed to ${newStatus}`,
            created_at: new Date().toISOString(),
          },
        ];

        const deliveryDetails = {
          ...(ord.delivery_details || {
            id: `del-${Date.now()}`,
            order_id: orderId,
            courier_name: '',
            tracking_number: '',
            shipping_provider: '',
          }),
          ...(courierName ? { courier_name: courierName, shipping_provider: courierName } : {}),
          ...(trackingNumber ? { tracking_number: trackingNumber } : {}),
        };

        return {
          ...ord,
          order_status: newStatus,
          payment_status: paymentStatus,
          status_history: newHistory,
          delivery_details: deliveryDetails,
          updated_at: new Date().toISOString(),
        };
      }
      return ord;
    });

    setOrders(updatedOrders);
    safeSetLocalStorage('srj_orders', updatedOrders);

    logActivity('UPDATE_ORDER_STATUS', 'ORDER', orderId, `Updated Order #${orderId} status to ${newStatus}`);
  };

  const updateStoreProfile = (updates: Partial<StoreProfile>) => {
    const updated = { ...storeProfile, ...updates, updated_at: new Date().toISOString() };
    setStoreProfile(updated);
    safeSetLocalStorage('srj_store_profile', updated);

    // Sync to Supabase
    try {
      supabase.from('store_profile').upsert([updated]).then(({ error }) => {
        if (error) console.warn('Supabase store_profile update note:', error.message);
      });
    } catch (e) { }

    logActivity('UPDATE_STORE_PROFILE', 'SETTINGS', 'store_profile', 'Updated Store Business Profile (Phone, WhatsApp, Address, Socials)');
  };

  const updateStoreSettings = (updates: Partial<StoreSettings>) => {
    const updated = { ...storeSettings, ...updates, updated_at: new Date().toISOString() };
    setStoreSettings(updated);
    safeSetLocalStorage('srj_store_settings', updated);

    // Sync to Supabase
    try {
      supabase.from('store_settings').upsert([updated]).then(({ error }) => {
        if (error) console.warn('Supabase store_settings update note:', error.message);
      });
    } catch (e) { }

    logActivity('UPDATE_STORE_SETTINGS', 'SETTINGS', 'store_settings', 'Updated Business & Payment Settings');
  };

  const addCustomerNote = (customerId: string, noteText: string) => {
    const newNote: CustomerNote = {
      id: `note-${Date.now()}`,
      customer_id: customerId,
      admin_id: 'cust-3',
      admin_name: 'Sushmitha Admin',
      note: noteText,
      created_at: new Date().toISOString(),
    };
    setCustomerNotes((prev) => [newNote, ...prev]);
    logActivity('ADD_CUSTOMER_NOTE', 'CUSTOMER', customerId, `Added internal note to customer ID ${customerId}`);
  };

  const addContactMessage = (msg: Omit<ContactMessage, 'id' | 'created_at' | 'status'>) => {
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: 'NEW',
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => {
      const updated = [newMsg, ...prev];
      safeSetLocalStorage('srj_messages', updated);
      return updated;
    });
    logActivity('ADD_CONTACT_MESSAGE', 'MESSAGE', newMsg.id, `New contact message received from ${newMsg.name} (${newMsg.email})`);
  };

  const updateMessageStatus = (id: string, status: ContactMessage['status']) => {
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, status } : m));
      safeSetLocalStorage('srj_messages', updated);
      return updated;
    });
    logActivity('UPDATE_MESSAGE_STATUS', 'MESSAGE', id, `Updated message ID ${id} status to ${status}`);
  };

  const addCoupon = (couponData: Omit<Coupon, 'id' | 'created_at' | 'usage_count'>): Coupon => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      code: couponData.code.toUpperCase().trim(),
      usage_count: 0,
      created_at: new Date().toISOString(),
    };
    setCoupons((prev) => {
      const updated = [newCoupon, ...prev];
      safeSetLocalStorage('srj_coupons', updated);
      return updated;
    });
    logActivity('CREATE_COUPON', 'COUPON', newCoupon.id, `Created new promo coupon code "${newCoupon.code}"`);
    return newCoupon;
  };

  const updateCouponStatus = (id: string, status: Coupon['status']) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, status } : c));
      safeSetLocalStorage('srj_coupons', updated);
      return updated;
    });
    logActivity('UPDATE_COUPON_STATUS', 'COUPON', id, `Updated coupon ID ${id} status to ${status}`);
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => {
      const coupon = prev.find((c) => c.id === id);
      const updated = prev.filter((c) => c.id !== id);
      safeSetLocalStorage('srj_coupons', updated);
      logActivity('DELETE_COUPON', 'COUPON', id, `Deleted coupon code "${coupon?.code || id}"`);
      return updated;
    });
  };

  const logActivity = (action: string, entity_type: string, entity_id: string, description: string) => {
    const log: AdminActivityLog = {
      id: `log-${Date.now()}`,
      admin_id: 'cust-3',
      admin_name: 'Sushmitha Admin',
      action,
      entity_type,
      entity_id,
      description,
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => [log, ...prev]);
  };

  const addReview = (reviewData: Omit<ProductReview, 'id' | 'created_at' | 'status'>): ProductReview => {
    const newRev: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      status: 'APPROVED',
      created_at: new Date().toISOString(),
    };
    const updated = [newRev, ...reviews];
    setReviews(updated);
    safeSetLocalStorage('srj_reviews', updated);
    return newRev;
  };

  const updateReviewStatus = (id: string, status: ProductReview['status']) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    setReviews(updated);
    safeSetLocalStorage('srj_reviews', updated);
  };

  const deleteReview = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    safeSetLocalStorage('srj_reviews', updated);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        customers,
        addresses,
        storeProfile,
        storeSettings,
        messages,
        inventoryHistory,
        payments,
        activityLogs,
        customerNotes,
        currentUser,
        coupons,
        reviews,
        loginCustomer,
        logoutCustomer,
        addCustomerAddress,
        addCoupon,
        updateCouponStatus,
        deleteCoupon,
        addReview,
        updateReviewStatus,
        deleteReview,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addOrder,
        updateOrderStatus,
        updateStoreProfile,
        updateStoreSettings,
        addCustomerNote,
        addContactMessage,
        updateMessageStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
