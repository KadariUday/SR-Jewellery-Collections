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
import { normalizePhoneNumber, generateOrderNumber } from '@/lib/utils';
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
    trackingNumber?: string,
    overridePaymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  ) => void;

  // Profile & settings actions
  updateStoreProfile: (updates: Partial<StoreProfile>) => Promise<{ success: boolean; error?: string }>;
  updateStoreSettings: (updates: Partial<StoreSettings>) => Promise<{ success: boolean; error?: string }>;

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
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
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

      // Initialize with INITIAL_PRODUCTS
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

      const savedCategories = localStorage.getItem('srj_categories');
      if (savedCategories) {
        try {
          const parsed = JSON.parse(savedCategories);
          if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
        } catch (e) {}
      }

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

      // Fetch live store profile directly from Supabase (Single Source of Truth)
      try {
        supabase
          .from('store_profile')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              const profileData = data as StoreProfile;
              if (profileData.upi_vpa && !profileData.upi_id) {
                profileData.upi_id = profileData.upi_vpa;
              } else if (profileData.upi_id && !profileData.upi_vpa) {
                profileData.upi_vpa = profileData.upi_id;
              }
              setStoreProfile(profileData);
            }
          });
      } catch (e) {}

      // Fetch live store settings directly from Supabase (Single Source of Truth)
      try {
        supabase
          .from('store_settings')
          .select('*')
          .eq('id', '00000000-0000-0000-0000-000000000001')
          .single()
          .then(({ data, error }) => {
            if (!error && data) {
              setStoreSettings(data as StoreSettings);
            }
          });
      } catch (e) {}

      // 1. Fetch live products from Supabase and merge all default INITIAL_PRODUCTS
      try {
        supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
          let loaded = (!error && data && data.length > 0) ? (data as Product[]) : [...INITIAL_PRODUCTS];

          // Merge any default INITIAL_PRODUCTS missing from response
          const loadedIds = new Set(loaded.map((p) => p.id));
          INITIAL_PRODUCTS.forEach((initP) => {
            if (!loadedIds.has(initP.id)) {
              loaded.push(initP);
            }
          });

          setProducts(loaded);
          safeSetLocalStorage('srj_products', loaded);
        });
      } catch (e) {}

      // 4. Fetch live categories from Supabase
      try {
        supabase.from('categories').select('*').then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setCategories(data as Category[]);
            safeSetLocalStorage('srj_categories', data);
          }
        });
      } catch (e) {}

      // 5. Fetch live orders via server API route (Service Role Key guarantees all store orders are fetched)
      try {
        fetch('/api/orders')
          .then((res) => res.json())
          .then((apiData) => {
            if (apiData.success && Array.isArray(apiData.orders) && apiData.orders.length > 0) {
              setOrders(apiData.orders);
              safeSetLocalStorage('srj_orders', apiData.orders);
            } else {
              supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
                if (!error && data && data.length > 0) {
                  setOrders(data as Order[]);
                  safeSetLocalStorage('srj_orders', data);
                }
              });
            }
          })
          .catch(() => {});
      } catch (e) {}

      // 6. Fetch live coupons from Supabase
      try {
        supabase.from('coupons').select('*').then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const mapped: Coupon[] = data.map((c: any) => ({
              id: c.id,
              code: c.code,
              discount_type: c.discount_type,
              discount_value: Number(c.discount_value),
              min_order_amount: Number(c.min_order_value || 0),
              max_discount_amount: Number(c.max_discount || 0),
              status: c.is_active ? 'ACTIVE' : 'EXPIRED',
              usage_count: c.usage_count || 0,
              created_at: c.created_at,
            }));
            setCoupons(mapped);
            safeSetLocalStorage('srj_coupons', mapped);
          }
        });
      } catch (e) {}

      // 7. Fetch live reviews from Supabase
      try {
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setReviews(data as ProductReview[]);
            safeSetLocalStorage('srj_reviews', data);
          }
        });
      } catch (e) {}

      // 8. Fetch live contact messages from Supabase
      try {
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setMessages(data as ContactMessage[]);
            safeSetLocalStorage('srj_messages', data);
          }
        });
      } catch (e) {}
    } catch (e) {
      console.error("Error loading persisted store context", e);
    }
  }, []);

  // Supabase Realtime Global Subscriptions for ALL admin tables
  useEffect(() => {
    try {
      const channel = supabase
        .channel('public:schema_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as Product;
              setProducts((prev) => {
                const map = new Map(prev.map((p) => [p.id, p]));
                const existing = map.get(updatedItem.id) || {};
                map.set(updatedItem.id, { ...existing, ...updatedItem } as Product);
                const updatedList = Array.from(map.values());
                safeSetLocalStorage('srj_products', updatedList);
                return updatedList;
              });
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const deletedId = (payload.old as any).id;
              setProducts((prev) => {
                const updatedList = prev.filter((p) => p.id !== deletedId);
                safeSetLocalStorage('srj_products', updatedList);
                return updatedList;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'store_profile' },
          (payload) => {
            if (payload.new) {
              const updatedProf = payload.new as StoreProfile;
              setStoreProfile((prev) => {
                const prevTime = prev?.updated_at ? new Date(prev.updated_at).getTime() : 0;
                const newTime = updatedProf.updated_at ? new Date(updatedProf.updated_at).getTime() : 0;
                if (newTime >= prevTime) {
                  safeSetLocalStorage('srj_store_profile', updatedProf);
                  return updatedProf;
                }
                return prev;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'store_settings' },
          (payload) => {
            if (payload.new) {
              const updatedSettings = payload.new as StoreSettings;
              setStoreSettings((prev) => {
                const prevTime = prev?.updated_at ? new Date(prev.updated_at).getTime() : 0;
                const newTime = updatedSettings.updated_at ? new Date(updatedSettings.updated_at).getTime() : 0;
                if (newTime >= prevTime) {
                  safeSetLocalStorage('srj_store_settings', updatedSettings);
                  return updatedSettings;
                }
                return prev;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.new) {
              const updatedOrder = payload.new as Order;
              setOrders((prev) => {
                const map = new Map(prev.map((o) => [o.id, o]));
                map.set(updatedOrder.id, updatedOrder);
                const updatedList = Array.from(map.values());
                safeSetLocalStorage('srj_orders', updatedList);
                return updatedList;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'coupons' },
          (payload) => {
            if (payload.new) {
              const c: any = payload.new;
              const couponObj: Coupon = {
                id: c.id,
                code: c.code,
                discount_type: c.discount_type,
                discount_value: Number(c.discount_value),
                min_order_amount: Number(c.min_order_value || 0),
                max_discount_amount: Number(c.max_discount || 0),
                status: c.is_active ? 'ACTIVE' : 'EXPIRED',
                usage_count: c.usage_count || 0,
                created_at: c.created_at,
              };
              setCoupons((prev) => {
                const map = new Map(prev.map((cp) => [cp.id, cp]));
                map.set(couponObj.id, couponObj);
                const updatedList = Array.from(map.values());
                safeSetLocalStorage('srj_coupons', updatedList);
                return updatedList;
              });
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reviews' },
          (payload) => {
            if (payload.new) {
              const r = payload.new as ProductReview;
              setReviews((prev) => {
                const map = new Map(prev.map((rev) => [rev.id, rev]));
                map.set(r.id, r);
                const updatedList = Array.from(map.values());
                safeSetLocalStorage('srj_reviews', updatedList);
                return updatedList;
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Supabase realtime subscription note:', e);
    }
  }, []);

  // Real-time cross-tab and same-window synchronization for products, profile, settings, coupons, reviews, messages, orders
  useEffect(() => {
    const syncProducts = () => {
      try {
        const saved = localStorage.getItem('srj_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) setProducts(parsed);
        }
      } catch (e) {}
    };

    const syncProfileAndSettings = () => {
      try {
        const savedProf = localStorage.getItem('srj_store_profile');
        if (savedProf) {
          const parsed = JSON.parse(savedProf);
          if (parsed && parsed.store_name) setStoreProfile(parsed);
        }
        const savedSet = localStorage.getItem('srj_store_settings');
        if (savedSet) {
          const parsed = JSON.parse(savedSet);
          if (parsed) setStoreSettings(parsed);
        }
      } catch (e) {}
    };

    const syncCoupons = () => {
      try {
        const saved = localStorage.getItem('srj_coupons');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setCoupons(parsed);
        }
      } catch (e) {}
    };

    const syncReviews = () => {
      try {
        const saved = localStorage.getItem('srj_reviews');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setReviews(parsed);
        }
      } catch (e) {}
    };

    const syncOrders = () => {
      try {
        const saved = localStorage.getItem('srj_orders');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setOrders(parsed);
        }
      } catch (e) {}
    };

    const syncMessages = () => {
      try {
        const saved = localStorage.getItem('srj_messages');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setMessages(parsed);
        }
      } catch (e) {}
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'srj_products') syncProducts();
      if (e.key === 'srj_store_profile' || e.key === 'srj_store_settings') syncProfileAndSettings();
      if (e.key === 'srj_coupons') syncCoupons();
      if (e.key === 'srj_reviews') syncReviews();
      if (e.key === 'srj_orders') syncOrders();
      if (e.key === 'srj_messages') syncMessages();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('srj_products_updated', syncProducts);
    window.addEventListener('srj_profile_updated', syncProfileAndSettings);
    window.addEventListener('srj_settings_updated', syncProfileAndSettings);
    window.addEventListener('srj_coupons_updated', syncCoupons);
    window.addEventListener('srj_reviews_updated', syncReviews);
    window.addEventListener('srj_orders_updated', syncOrders);
    window.addEventListener('srj_messages_updated', syncMessages);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('srj_products_updated', syncProducts);
      window.removeEventListener('srj_profile_updated', syncProfileAndSettings);
      window.removeEventListener('srj_settings_updated', syncProfileAndSettings);
      window.removeEventListener('srj_coupons_updated', syncCoupons);
      window.removeEventListener('srj_reviews_updated', syncReviews);
      window.removeEventListener('srj_orders_updated', syncOrders);
      window.removeEventListener('srj_messages_updated', syncMessages);
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

const prepareProductForSupabase = (p: Product) => {
  return {
    id: String(p.id),
    name: String(p.name || ''),
    sku: String(p.sku || ''),
    slug: String(p.slug || ''),
    category_id: String(p.category_id || ''),
    description: String(p.description || ''),
    original_price: Number(p.original_price || 0),
    selling_price: Number(p.selling_price || 0),
    discount_percentage: Number(p.discount_percentage || 0),
    stock_quantity: Number(p.stock_quantity || 0),
    low_stock_threshold: Number(p.low_stock_threshold || 5),
    material: String(p.material || ''),
    stone_type: String(p.stone_type || ''),
    colour: String(p.colour || ''),
    weight: String(p.weight || ''),
    size: String(p.size || ''),
    dimensions: String(p.dimensions || ''),
    care_instructions: String(p.care_instructions || ''),
    shipping_info: String(p.shipping_info || ''),
    return_info: String(p.return_info || ''),
    tags: Array.isArray(p.tags) ? p.tags : [],
    images: Array.isArray(p.images) ? p.images : [],
    is_featured: Boolean(p.is_featured),
    is_new_arrival: Boolean(p.is_new_arrival),
    is_best_seller: Boolean(p.is_best_seller),
    is_active: Boolean(p.is_active),
    updated_at: p.updated_at || new Date().toISOString(),
  };
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
    const cleanItem = prepareProductForSupabase(newProduct);
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
        const selling = updates.selling_price !== undefined ? Number(updates.selling_price) : p.selling_price;
        const orig = updates.original_price !== undefined ? Number(updates.original_price) : (p.original_price || selling);
        const discount_percentage = orig > selling ? Math.round(((orig - selling) / orig) * 100) : 0;
        updatedItem = {
          ...p,
          ...updates,
          selling_price: selling,
          original_price: orig,
          discount_percentage: updates.discount_percentage !== undefined ? updates.discount_percentage : discount_percentage,
          updated_at: now,
        };
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
      const cleanItem = prepareProductForSupabase(updatedItem);
      try {
        supabase.from('products').upsert([cleanItem]).then(({ error }) => {
          if (error) {
            console.error('Supabase product update note:', error.message, error.details);
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

  const addOrder = (orderData: Partial<Order> & { items: any[] }): Order => {
    const id = orderData.id || `ord-${Date.now()}`;
    const orderNumber = orderData.order_number || generateOrderNumber();
    const now = orderData.created_at || new Date().toISOString();

    // Sanitize item images to prevent bloating storage
    const sanitizedItems = (orderData.items || []).map((item) => ({
      ...item,
      product_image: item.product_image && item.product_image.length > 500
        ? 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400'
        : item.product_image,
    }));

    const newOrder: Order = {
      id,
      order_number: orderNumber,
      customer_id: orderData.customer_id || '',
      customer_name: orderData.customer_name || 'Valued Customer',
      customer_email: orderData.customer_email || 'customer@srjewellerycollections.com',
      customer_phone: orderData.customer_phone || '+91 98765 00000',
      total_amount: orderData.total_amount || 0,
      subtotal: orderData.subtotal || 0,
      discount_amount: orderData.discount_amount || 0,
      shipping_fee: orderData.shipping_fee || 0,
      payment_method: orderData.payment_method || 'COD',
      payment_status: orderData.payment_status || 'PENDING',
      order_status: orderData.order_status || 'ORDER PLACED',
      delivery_address: orderData.delivery_address || {
        id: `addr-${Date.now()}`,
        customer_id: '',
        label: 'Home',
        full_name: 'Valued Customer',
        phone: '+91 98765 00000',
        address_line1: 'Store Delivery',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        is_default: true,
      },
      notes: orderData.notes,
      items: sanitizedItems,
      created_at: now,
      updated_at: now,
    };

    setOrders((prev) => {
      const map = new Map(prev.map((o) => [o.id, o]));
      map.set(newOrder.id, newOrder);
      const updatedList = Array.from(map.values());
      safeSetLocalStorage('srj_orders', updatedList);
      return updatedList;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('srj_orders_updated'));
    }

    // Deduct stock locally
    sanitizedItems.forEach((item) => {
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

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    courierName?: string,
    trackingNumber?: string,
    overridePaymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  ) => {
    const targetOrd = orders.find((o) => o.id === orderId || o.order_number === orderId);
    const targetId = targetOrd?.id || orderId;
    const targetOrderNumber = targetOrd?.order_number || orderId;

    let computedPaymentStatus = overridePaymentStatus || targetOrd?.payment_status || 'PENDING';
    if (overridePaymentStatus) {
      computedPaymentStatus = overridePaymentStatus;
    } else if (newStatus === 'DELIVERED' || newStatus === 'CONFIRMED' || newStatus === 'SHIPPED') {
      computedPaymentStatus = 'SUCCESS';
    }

    // 1. Optimistic React State & LocalStorage update
    const updatedOrders = orders.map((ord) => {
      if (ord.id === targetId || ord.order_number === targetOrderNumber) {
        const oldStatus = ord.order_status;
        const newHistory = [
          ...(ord.status_history || []),
          {
            id: `hist-${Date.now()}`,
            order_id: ord.id,
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
            order_id: ord.id,
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
          payment_status: computedPaymentStatus,
          status_history: newHistory,
          delivery_details: deliveryDetails,
          updated_at: new Date().toISOString(),
        };
      }
      return ord;
    });

    setOrders(updatedOrders);
    safeSetLocalStorage('srj_orders', updatedOrders);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('srj_orders_updated'));
    }

    // 2. Server API Route Update via Service Role Client
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: targetId,
          orderStatus: newStatus,
          paymentStatus: computedPaymentStatus,
          note,
          courierName,
          trackingNumber,
        }),
      });
    } catch (e) {
      console.warn('API order update note:', e);
    }

    // 3. Direct Supabase Client update fallback
    try {
      await supabase
        .from('orders')
        .update({
          order_status: newStatus,
          payment_status: computedPaymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetId);
    } catch (e) {}

    // 4. Re-fetch fresh live orders from server API to guarantee 100% database sync
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders(data.orders);
        safeSetLocalStorage('srj_orders', data.orders);
      }
    } catch (e) {}

    logActivity('UPDATE_ORDER_STATUS', 'ORDER', targetId, `Updated Order #${targetOrderNumber} status to ${newStatus}`);
  };

const prepareStoreProfileForSupabase = (p: StoreProfile) => {
  const upiVal = p.upi_vpa || p.upi_id || '992438853@fam';
  return {
    id: '00000000-0000-0000-0000-000000000001',
    store_name: String(p.store_name || 'SR Jewellery Collections'),
    logo_url: String(p.logo_url || '/logo.jpg'),
    tagline: String(p.tagline || ''),
    description: String(p.description || ''),
    email: String(p.email || 'contact@srjewellerycollections.com'),
    phone: normalizePhoneNumber(p.phone || '918790522579'),
    whatsapp: normalizePhoneNumber(p.whatsapp || '918790522579'),
    address: String(p.address || ''),
    city: String(p.city || ''),
    state: String(p.state || ''),
    pincode: String(p.pincode || ''),
    map_url: String(p.map_url || ''),
    instagram_url: String(p.instagram_url || ''),
    facebook_url: String(p.facebook_url || ''),
    youtube_url: String(p.youtube_url || ''),
    business_hours: String(p.business_hours || ''),
    upi_vpa: upiVal,
    upi_id: upiVal,
    updated_at: p.updated_at || new Date().toISOString(),
  };
};

const prepareStoreSettingsForSupabase = (s: StoreSettings) => {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    shipping_fee: Number(s.shipping_fee ?? 99),
    free_shipping_threshold: Number(s.free_shipping_threshold ?? 1999),
    tax_percentage: Number(s.tax_percentage ?? 3),
    cod_enabled: Boolean(s.cod_enabled),
    min_cod_value: Number(s.min_cod_value ?? 299),
    max_cod_value: Number(s.max_cod_value ?? 25000),
    upi_enabled: Boolean(s.upi_enabled),
    razorpay_test_mode: Boolean(s.razorpay_test_mode),
    updated_at: s.updated_at || new Date().toISOString(),
  };
};

  const updateStoreProfile = async (updates: Partial<StoreProfile>): Promise<{ success: boolean; error?: string }> => {
    const updated = { ...storeProfile, ...updates, updated_at: new Date().toISOString() };
    const cleanProfile = prepareStoreProfileForSupabase(updated);

    try {
      // 1. Attempt direct Supabase client update
      const { data, error } = await supabase.from('store_profile').upsert([cleanProfile]).select().single();
      if (!error && data) {
        const finalProfile = data as StoreProfile;
        setStoreProfile(finalProfile);
        logActivity('UPDATE_STORE_PROFILE', 'SETTINGS', 'store_profile', 'Updated Store Business Profile');
        return { success: true };
      }

      // 2. If RLS or client permission blocks direct upsert, use Admin Service Role API Route
      const apiRes = await fetch('/api/store-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanProfile),
      });

      const apiData = await apiRes.json();
      if (!apiRes.ok || apiData.error) {
        return { success: false, error: apiData.error || 'Failed to save store profile.' };
      }

      const finalProfile = (apiData.profile || cleanProfile) as StoreProfile;
      setStoreProfile(finalProfile);
      logActivity('UPDATE_STORE_PROFILE', 'SETTINGS', 'store_profile', 'Updated Store Business Profile');
      return { success: true };
    } catch (e: any) {
      console.error('Error updating store profile:', e);
      return { success: false, error: e?.message || 'Failed to save store profile.' };
    }
  };

  const updateStoreSettings = async (updates: Partial<StoreSettings>): Promise<{ success: boolean; error?: string }> => {
    const updated = { ...storeSettings, ...updates, updated_at: new Date().toISOString() };
    const cleanSettings = prepareStoreSettingsForSupabase(updated);

    try {
      // 1. Attempt direct Supabase client update
      const { data, error } = await supabase.from('store_settings').upsert([cleanSettings]).select().single();
      if (!error && data) {
        const finalSettings = data as StoreSettings;
        setStoreSettings(finalSettings);
        logActivity('UPDATE_STORE_SETTINGS', 'SETTINGS', 'store_settings', 'Updated Business & Payment Settings');
        return { success: true };
      }

      // 2. If RLS or client permission blocks direct upsert, use Admin Service Role API Route
      const apiRes = await fetch('/api/store-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanSettings),
      });

      const apiData = await apiRes.json();
      if (!apiRes.ok || apiData.error) {
        return { success: false, error: apiData.error || 'Failed to save store settings.' };
      }

      const finalSettings = (apiData.settings || cleanSettings) as StoreSettings;
      setStoreSettings(finalSettings);
      logActivity('UPDATE_STORE_SETTINGS', 'SETTINGS', 'store_settings', 'Updated Business & Payment Settings');
      return { success: true };
    } catch (e: any) {
      console.error('Error updating store settings:', e);
      return { success: false, error: e?.message || 'Failed to save store settings.' };
    }
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
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('srj_messages_updated'));
      return updated;
    });

    try {
      supabase.from('contact_messages').insert([{
        name: newMsg.name,
        email: newMsg.email,
        phone: newMsg.phone || null,
        subject: newMsg.subject || null,
        message: newMsg.message,
        status: 'NEW',
      }]).then(({ error }) => {
        if (error) console.warn('Supabase contact_message insert note:', error.message);
      });
    } catch (e) {}

    logActivity('ADD_CONTACT_MESSAGE', 'MESSAGE', newMsg.id, `New contact message received from ${newMsg.name} (${newMsg.email})`);
  };

  const updateMessageStatus = (id: string, status: ContactMessage['status']) => {
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, status } : m));
      safeSetLocalStorage('srj_messages', updated);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('srj_messages_updated'));
      return updated;
    });
    try {
      supabase.from('contact_messages').update({ status }).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase message status update note:', error.message);
      });
    } catch (e) {}
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
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('srj_coupons_updated'));
      return updated;
    });

    try {
      supabase.from('coupons').upsert([{
        code: newCoupon.code,
        discount_type: newCoupon.discount_type,
        discount_value: newCoupon.discount_value,
        min_order_value: newCoupon.min_order_amount,
        max_discount: newCoupon.max_discount_amount,
        is_active: newCoupon.status === 'ACTIVE',
      }]).then(({ error }) => {
        if (error) console.warn('Supabase coupon insert note:', error.message);
      });
    } catch (e) {}

    logActivity('CREATE_COUPON', 'COUPON', newCoupon.id, `Created new promo coupon code "${newCoupon.code}"`);
    return newCoupon;
  };

  const updateCouponStatus = (id: string, status: Coupon['status']) => {
    setCoupons((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, status } : c));
      safeSetLocalStorage('srj_coupons', updated);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('srj_coupons_updated'));
      return updated;
    });

    try {
      supabase.from('coupons').update({ is_active: status === 'ACTIVE' }).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase coupon status update note:', error.message);
      });
    } catch (e) {}

    logActivity('UPDATE_COUPON_STATUS', 'COUPON', id, `Updated coupon ID ${id} status to ${status}`);
  };

  const deleteCoupon = (id: string) => {
    setCoupons((prev) => {
      const coupon = prev.find((c) => c.id === id);
      const updated = prev.filter((c) => c.id !== id);
      safeSetLocalStorage('srj_coupons', updated);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('srj_coupons_updated'));
      logActivity('DELETE_COUPON', 'COUPON', id, `Deleted coupon code "${coupon?.code || id}"`);
      return updated;
    });

    try {
      supabase.from('coupons').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase coupon delete note:', error.message);
      });
    } catch (e) {}
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
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('srj_reviews_updated'));

    try {
      supabase.from('reviews').insert([{
        product_id: newRev.product_id,
        customer_name: newRev.customer_name,
        rating: newRev.rating,
        comment: newRev.comment,
        status: 'APPROVED',
      }]).then(({ error }) => {
        if (error) console.warn('Supabase review insert note:', error.message);
      });
    } catch (e) {}

    return newRev;
  };

  const updateReviewStatus = (id: string, status: ProductReview['status']) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, status } : r));
    setReviews(updated);
    safeSetLocalStorage('srj_reviews', updated);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('srj_reviews_updated'));

    try {
      supabase.from('reviews').update({ status }).eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase review status update note:', error.message);
      });
    } catch (e) {}
  };

  const deleteReview = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    safeSetLocalStorage('srj_reviews', updated);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('srj_reviews_updated'));

    try {
      supabase.from('reviews').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Supabase review delete note:', error.message);
      });
    } catch (e) {}
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
