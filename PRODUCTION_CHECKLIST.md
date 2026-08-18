# 🚀 SR Jewellery Collections — Production Deployment Checklist

## 📋 Pre-Deployment Acceptance Criteria

- [x] **Supabase Single Source of Truth**: Product prices, catalogue, stock, store settings, store profile, and orders query from Supabase.
- [x] **Admin → Supabase → Customer Realtime Sync**: Subscribed to Supabase Realtime for instant updates on products, stock, store profile, and settings.
- [x] **Server-Side Financial Recalculation**: `/api/orders/create` recalculates subtotal, shipping, discounts, and total server-side.
- [x] **Security Hardening**: Removed `adminToken === 'token_admin_verified_srj'` and hardcoded passwords.
- [x] **RLS Enabled**: Granular Row Level Security policies applied on all 19 PostgreSQL tables.
- [x] **Automated Auth Trigger**: `handle_new_user()` syncs Supabase Auth signups directly into `public.profiles`.
- [x] **Historical Order Preservation**: `order_items.purchased_price` and `orders.delivery_address` snapshotted at placement time.

---

## 🛠️ Step-by-Step Production Deployment Guide

### 1. Configure Supabase Environment Variables
Ensure your production hosting environment (e.g. Vercel) has the following variables configured:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Execute SQL Schema in Supabase Console
1. Open Supabase Dashboard -> **SQL Editor**.
2. Copy the contents of [`supabase/schema.sql`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/supabase/schema.sql).
3. Click **Run** to execute table creation, auth triggers, and RLS policies.

### 3. Deploy Application to Vercel
```bash
npx vercel --prod
```

### 4. Post-Deployment Smoke Test
1. Log in as Admin at `/admin/login`.
2. Update selling price of a product.
3. Open Customer Storefront in another browser and verify instant price update.
4. Place a test Cash on Delivery order and verify server-side order insertion in Admin Orders dashboard.
