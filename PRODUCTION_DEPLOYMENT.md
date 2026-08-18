# Production Deployment Guide - SR Jewellery Collections

This guide provides step-by-step instructions for deploying **SR Jewellery Collections** to production environments (Vercel, Netlify, or Self-Hosted Docker / Node server).

---

## 1. Environment Variables Checklist

Ensure the following environment variables are set in your deployment environment (Vercel / Netlify Settings $\rightarrow$ Environment Variables):

| Environment Variable | Description | Example Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project REST URL | `https://qllnjwmcprxdgdhqvbyb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anonymous API Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret Admin Service Role Key | `eyJhbGciOi...` *(Optional: Falls back to anon key if omitted)* |

> [!IMPORTANT]
> Do NOT expose `SUPABASE_SERVICE_ROLE_KEY` on client-side code (`NEXT_PUBLIC_` prefix). Keep it strictly as a server-side environment variable.

---

## 2. Supabase Database Migration & RLS Setup

Before launching to production, run the migration script in your **Supabase Dashboard SQL Editor**:

```sql
-- 1. Enable RLS read & write access for store_settings and store_profile
DROP POLICY IF EXISTS "Public store profile read" ON public.store_profile;
CREATE POLICY "Public store profile read" ON public.store_profile FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write store_profile" ON public.store_profile;
CREATE POLICY "Enable write store_profile" ON public.store_profile FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public store settings read" ON public.store_settings;
CREATE POLICY "Public store settings read" ON public.store_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write store_settings" ON public.store_settings;
CREATE POLICY "Enable write store_settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- 2. Ensure upi_vpa column exists
ALTER TABLE public.store_profile 
ADD COLUMN IF NOT EXISTS upi_vpa TEXT DEFAULT '992438853@fam';

-- 3. Clean up duplicates & enforce single authoritative row (ID: 00000000-0000-0000-0000-000000000001)
DELETE FROM public.store_profile WHERE id != '00000000-0000-0000-0000-000000000001';
DELETE FROM public.store_settings WHERE id != '00000000-0000-0000-0000-000000000001';

-- 4. Seed/Update Authoritative Records
INSERT INTO public.store_profile (
    id, store_name, tagline, description, email, phone, whatsapp, 
    address, city, state, pincode, business_hours, upi_vpa
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SR Jewellery Collections',
    'Timeless Elegance & Royal Heritage Jewellery',
    'Discover hand-crafted Kundan, Polki, Gold & Diamond Jewellery designed for modern royalty.',
    'contact@srjewellerycollections.com',
    '918790522579',
    '918790522579',
    '108 Royal Heritage Galleria, MG Road',
    'Hyderabad',
    'Telangana',
    '500001',
    'Mon - Sat: 10:30 AM - 8:30 PM | Sun: Closed',
    '992438853@fam'
) 
ON CONFLICT (id) DO UPDATE SET upi_vpa = EXCLUDED.upi_vpa;

INSERT INTO public.store_settings (
    id, currency, shipping_fee, free_shipping_threshold, 
    cod_enabled, min_cod_value, max_cod_value, upi_enabled, tax_percentage
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'INR',
    99.00,
    1999.00,
    TRUE,
    299.00,
    25000.00,
    TRUE,
    3.00
) 
ON CONFLICT (id) DO NOTHING;
```

---

## 3. Deploying to Vercel (Recommended)

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Production deployment build: Next.js 16 proxy migration & Supabase Realtime sync"
   git push origin main
   ```
2. Import the repository in [Vercel Dashboard](https://vercel.com/new).
3. Framework Preset: **Next.js**.
4. Configure Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
5. Click **Deploy**. Vercel will build and deploy your application automatically.

---

## 4. Deploying to Netlify / Self-Hosted Node Server

### Self-Hosted Node Server Build Commands:
```bash
# Install production dependencies
npm install

# Verify TypeScript compilation
npx tsc --noEmit

# Build production bundle
npm run build

# Start production server (default port 3000)
npm run start
```

---

## 5. Post-Deployment Verification Checklist

- [x] Next.js 16 `proxy.ts` routing works for `/admin/*` protected paths.
- [x] Admin Login (`/admin/login`) authenticates correctly.
- [x] Admin Settings (`/admin/settings`) updates `shipping_fee`, `free_shipping_threshold`, `tax_percentage`, and COD/UPI flags to Supabase.
- [x] Admin Store Profile (`/admin/store-profile`) updates store name, logo, phone, WhatsApp, and `upi_vpa`.
- [x] Customer Storefront (`/`, `/shop`, `/contact`, `/checkout`) displays live Supabase data in real-time.
- [x] Checkout calculation computes free shipping threshold and COD/UPI limits correctly.
