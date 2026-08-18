# 🔍 SR Jewellery Collections — Synchronization & Architecture Audit

## 📋 Executive Summary
This document provides a thorough line-by-line audit of the **SR Jewellery Collections** codebase to map out current data sources, state synchronization mechanisms, `localStorage` dependencies, security flaws, and Supabase integration points before migrating to a **Supabase Single Source of Truth**.

---

## 1. 📊 Audit of Current Data Sources

| Domain | Current Primary Source | Secondary / Fallback Source | Status & Issues |
| :--- | :--- | :--- | :--- |
| **Product Catalogue** | `localStorage` (`srj_products`) | `INITIAL_PRODUCTS` (`lib/mockData.ts`) & Supabase (`products`) | ⚠️ **Hybrid/Inconsistent**. Fetches from Supabase on mount, but writes and updates rely on local state & `localStorage`. |
| **Product Prices** | `localStorage` (`srj_products`) | `INITIAL_PRODUCTS` (`lib/mockData.ts`) | ❌ **Insecure**. Prices in cart are stored on client side; checkout uses client-side prices. |
| **Product Stock** | `localStorage` (`srj_products`) | `INITIAL_PRODUCTS` | ⚠️ Stock decreases in local state; no server-side transaction guard on checkout. |
| **Customer Profiles** | `localStorage` (`srj_active_user`, `srj_admin_profile`) | `INITIAL_CUSTOMERS` (`lib/mockData.ts`) | ❌ **Fake Auth**. No real Supabase Auth session. Login simulates profile by saving object to `localStorage` and setting mock cookie. |
| **Customer Addresses**| `localStorage` (`srj_addresses`) | `INITIAL_CUSTOMER_ADDRESSES` | ❌ **Local Only**. Addresses saved in browser `localStorage`. Does not sync across devices or write to `customer_addresses` table. |
| **Orders** | `localStorage` (`srj_orders`) | `INITIAL_ORDERS` & Supabase (`orders`) | ⚠️ **Hybrid**. Fetches orders from Supabase on mount, but local order creation puts JSON in `localStorage` with async fire-and-forget to Supabase. |
| **Store Profile** | `localStorage` (`srj_store_profile`) | `/api/store-profile` & Supabase (`store_profile`) | ⚠️ Reads from local storage first, merges from API route and Supabase realtime. |
| **Store Settings** | `localStorage` (`srj_store_settings`) | `/api/store-settings` & Supabase (`store_settings`) | ⚠️ Reads from local storage first, merges from API route and Supabase. |
| **Coupons** | `localStorage` (`srj_coupons`) | Hardcoded array in `CartContext.tsx` & `INITIAL_COUPONS` | ❌ **Local Only**. Coupon code validation occurs on client against `localStorage` array. |
| **Reviews** | `localStorage` (`srj_reviews`) | `INITIAL_REVIEWS` | ❌ **Local Only**. Customer reviews are kept in browser memory. |
| **Contact Messages** | `localStorage` (`srj_messages`) | `INITIAL_CONTACT_MESSAGES` | ❌ **Local Only**. Inbound contact messages write to local storage array. |
| **Authentication** | Custom cookie (`srj_role`, `srj_admin_token`) | `localStorage` (`srj_active_user`) | ❌ **Insecure Hardcoded Token**. `middleware.ts` checks `adminToken === 'token_admin_verified_srj'`. No Supabase Auth JWT verification. |
| **Admin Authorization** | Middleware Cookie Check | `localStorage` | ❌ Client can fake cookie `srj_admin_token=token_admin_verified_srj` and gain access without password or database check. |

---

## 2. 🚨 Critical Broken Synchronization Paths

### 1. Product Price Update (Admin → Customer)
- **Current Flow**: Admin edits product price in `/admin/products` -> calls `updateProduct()` in `StoreContext.tsx` -> updates React state & `localStorage.setItem('srj_products', ...)` -> fires fire-and-forget Supabase query.
- **Breakdown**: Customer on another device or browser session relies on their own `localStorage` or initial fetch. If customer added item to cart prior to price change, `CartContext` updates item product, but checkout payload trusts client calculations.

### 2. Admin Authentication & Role Protection
- **Current Flow**: Admin logs in via `/admin/login` -> compares email with `sushmitha.admin@srjewellery.com` and password `admin123` -> sets `srj_admin_token=token_admin_verified_srj` cookie -> `middleware.ts` checks string match.
- **Breakdown**: Hardcoded credentials and token. Anyone who inspects `middleware.ts` or sets the cookie directly in Developer Tools bypasses admin security completely.

### 3. Customer Address Isolation
- **Current Flow**: Saved in `localStorage.setItem('srj_addresses', ...)` under key `'srj_addresses'`.
- **Breakdown**: Addresses do not persist across devices or browsers for a logged-in user, nor are they linked via foreign keys to `auth.uid()` in `customer_addresses` table.

### 4. Order Creation & Stock Reservation
- **Current Flow**: Checkout submits order via client-side `addOrder()` in `StoreContext.tsx` -> calculates total on client -> appends order to `localStorage` -> decrements stock in React state.
- **Breakdown**: No server-side pricing recalculation, no stock validation transaction in Supabase PostgreSQL, and no snapshot of delivery address in database.

---

## 3. 🛡️ Security & Vulnerability Analysis

1. **Hardcoded Admin Token**:
   - `middleware.ts` line 12: `const isValidAdminToken = adminToken === 'token_admin_verified_srj';`
   - **Risk**: Critical bypass vulnerability.

2. **Hardcoded Credentials**:
   - `README.md` lines 103-104: `sushmitha.admin@srjewellery.com` / `admin123`.
   - `lib/auth.ts` lines 8-10: returns hardcoded mock admin user `{ id: 'cust-3', email: 'sushmitha.admin@srjewellery.com' }`.
   - **Risk**: Exposed production access vectors.

3. **Supabase Database & RLS Deficiencies**:
   - `supabase/schema.sql` enables RLS on 19 tables, but ONLY provides public `SELECT` policies for categories, products, store_profile, store_settings, and approved reviews.
   - NO RLS policies exist for authenticated users to insert/update their own `orders`, `customer_addresses`, or `profiles`.
   - Data types mismatch in `schema.sql`: `products.id` is `TEXT` (e.g. `'prod-1'`), whereas `product_images.product_id` and `product_variants.product_id` are defined as `UUID REFERENCES public.products(id)`. This causes foreign key constraint failures in PostgreSQL.

4. **Financial Data Manipulation**:
   - Client sends total price, discount, and shipping fee directly during checkout.
   - **Risk**: A malicious user can intercept the network request or mutate local state to purchase any item for ₹1.

---

## 4. 🗄️ Database Tables & Schema Refinement Required

| Table Name | Issues Identified | Required Action |
| :--- | :--- | :--- |
| `profiles` | Missing insert trigger on `auth.users` signup | Create Supabase trigger `on_auth_user_created` to sync auth user to `public.profiles`. |
| `products` | Primary key `id` is `TEXT` while foreign keys in `product_images` & `inventory_history` expect `UUID` | Standardize `products.id` as `TEXT` across all foreign keys OR use `UUID` everywhere. Maintain compatibility with existing product IDs. |
| `customer_addresses` | No RLS policies for customer ownership (`customer_id = auth.uid()`) | Add RLS policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE` where `customer_id = auth.uid()`. |
| `orders` | Lacks server-side price validation function; delivery address stored as loose JSON | Add server endpoint/action to validate cart items, compute total server-side, snapshot `delivery_address`, and insert order transactionally. |
| `store_settings` | Property name `min_cod_value` / `max_cod_value` in SQL vs frontend `min_cod_amount` / `max_cod_amount` | Fixed! Standardized on `min_cod_value` and `max_cod_value`. |
| `coupons` | Schema column `is_active` vs code using `status = 'ACTIVE'` | Standardize coupon schema to support both or map `is_active` to `status`. |

---

## 5. 🎯 Realtime & Revalidation Architecture

```
                       [ ADMIN DASHBOARD ]
                                │
                      (Supabase DB Writes)
                                │
                                ▼
                       ┌────────────────┐
                       │  SUPABASE DB   │
                       └────────────────┘
                                │
           ┌────────────────────┴────────────────────┐
           ▼                                         ▼
   [ Supabase Realtime ]                  [ Server Revalidation ]
 (Products, Stock, Profile,              (Server Actions / Next.js
   Settings, Order Status)                   API Route fetch)
           │                                         │
           └────────────────────┬────────────────────┘
                                ▼
                      [ CUSTOMER WEBSITE ]
               (Single Source of Truth UI State)
```

- **Customer Storefront**: Subscribes to Supabase Realtime channels for `products`, `store_profile`, `store_settings`, and own `orders`.
- **LocalStorage**: Stripped of authoritative business data. Retained solely for transient guest cart, guest wishlist, and UI themes.
