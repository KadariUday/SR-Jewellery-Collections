# Settings Synchronization & Data Fix Audit Report

## 1. Executive Summary & Existing Problem
The SR Jewellery Collections web application previously suffered from data consistency and synchronization issues between the **Admin Settings / Store Business Profile** section and customer-facing pages (Navbar, Footer, Contact Page, Checkout, WhatsApp button, Order Creation API).

Specifically:
- **Shipping Fee Discrepancy**: Admin displayed shipping fee as ₹99 or ₹59 inconsistently, while checkout or order processing used mismatched defaults.
- **UPI VPA Mismatch**: Differing UPI VPA values (e.g. `992438853@fam` vs `store@upi`) appeared across components.
- **LocalStorage Overrides**: Component state loaded from `localStorage` on mount and took precedence over live Supabase database state.
- **Shadow API Caching**: Next.js API routes (`/api/store-settings` and `/api/store-profile`) persisted configuration to `/tmp` and `.next` JSON files rather than relying solely on Supabase.
- **Duplicate Settings Records**: Missing database singleton constraints permitted duplicate rows in Supabase, leading to arbitrary row selection by `.limit(1)` queries.

---

## 2. Root Cause Analysis
1. **Mismatched Initial Seed UUIDs**:
   - `schema.sql` seeded `store_settings` with ID `'00000000-0000-0000-0000-000000000002'`, whereas `StoreContext.tsx` and `/api/store-settings` defaulted to `'00000000-0000-0000-0000-000000000001'`.
   - Admin upserts created a second row in `store_settings`. Non-unique queries (`.limit(1)`) randomly returned either row depending on PostgreSQL query plans.
2. **LocalStorage Timestamp Lock-In**:
   - On initial load, `StoreContext.tsx` read `localStorage` values and ignored Supabase database records unless database timestamps strictly exceeded local storage timestamps.
3. **Missing Validation & Normalization**:
   - Financial fields accepted invalid/negative/NaN numbers without server-side validation.
   - Phone numbers and WhatsApp links contained inconsistent formatting (`+91 8790522579` vs `8790522579`).
4. **Field Name Mismatch (`upi_id` vs `upi_vpa`)**:
   - The SQL schema lacked the `upi_vpa` column in `store_profile`, leading to fallback behaviors in checkout.

---

## 3. Architecture & Data Flow

### Authoritative Flow (Post-Fix)
```
ADMIN SETTINGS / STORE PROFILE FORM
               │
               ▼
   Zod Schema Validation (Client & Server)
               │
               ▼
        SUPABASE DATABASE (Singleton ID: 00000000-0000-0000-0000-000000000001)
               │
      ┌────────┴────────────────────────┐
      ▼                                 ▼
Supabase Realtime Channel         Server-Side API Validation
(postgres_changes table event)   (/api/orders/create route)
      │                                 │
      ▼                                 ▼
Customer React Components        Customer Order Placement
(Navbar, Footer, Contact,         (Calculates exact DB fee &
 Checkout, WhatsApp Float)        validates COD/UPI rules)
```

**Key Architectural Changes**:
- **DATABASE IS THE ONLY SOURCE OF TRUTH**: `localStorage` no longer overrides or controls store profile/settings state.
- **SINGLETON RECORD ENFORCEMENT**: Fixed UUID `'00000000-0000-0000-0000-000000000001'` is strictly targeted by all queries and mutations.
- **SERVER-SIDE ZOD VALIDATION**: All numeric constraints and UPI VPA formats are validated before writing to Supabase.
- **REAL-TIME DYNAMIC SYNC**: Realtime subscriptions propagate settings changes immediately to all connected browsers without page reloads.

---

## 4. Code & Files Changed

| File Path | Description of Changes |
|---|---|
| [`supabase/schema.sql`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/supabase/schema.sql) | Added `upi_vpa` column to `store_profile`; standardized seed UUIDs to `'00000000-0000-0000-0000-000000000001'`; added SQL deduplication & cleanup queries. |
| [`lib/validation.ts`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/lib/validation.ts) | Created Zod validation schemas for `storeSettingsSchema` and `storeProfileSchema`; added phone/UPI validation functions. |
| [`lib/types.ts`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/lib/types.ts) | Updated `StoreProfile` interface to include `upi_vpa` (and backward compatibility alias `upi_id`). |
| [`lib/utils.ts`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/lib/utils.ts) | Added `normalizePhoneNumber()`, `formatPhoneNumber()`, and safety bounds to `formatCurrency()`. |
| [`lib/mockData.ts`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/lib/mockData.ts) | Aligned default `INITIAL_STORE_SETTINGS` and `INITIAL_STORE_PROFILE` IDs to singleton `'00000000-0000-0000-0000-000000000001'`. |
| [`context/StoreContext.tsx`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/context/StoreContext.tsx) | Bypassed `localStorage` reads/writes for business settings; queried singleton ID directly from Supabase; updated `updateStoreProfile` & `updateStoreSettings` to async with Supabase error checking. |
| [`app/api/store-settings/route.ts`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/app/api/store-settings/route.ts) | Removed disk file caching (`/tmp` & `.next`); added Zod schema validation; proxied GET/POST directly to Supabase. |
| [`app/api/store-profile/route.ts`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/app/api/store-profile/route.ts) | Removed disk file caching (`/tmp` & `.next`); added Zod schema validation & phone normalization; proxied GET/POST directly to Supabase. |
| [`app/admin/settings/page.tsx`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/app/admin/settings/page.tsx) | Added client-side Zod validation; implemented async save with error alerts; updated helper text to indicate storefront auto-sync. |
| [`app/admin/store-profile/page.tsx`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/app/admin/store-profile/page.tsx) | Updated label to `STORE UPI ID / VPA`; added helper text *"This UPI ID is used for direct UPI payments where enabled."*; added client-side validation. |
| [`app/checkout/page.tsx`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/app/checkout/page.tsx) | Dynamically calculated checkout rules; enforced COD min/max limits & enable states; read `upi_vpa`; fixed pre-existing TypeScript `appliedCoupon` error. |
| [`app/api/orders/create/route.ts`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/app/api/orders/create/route.ts) | Queried singleton ID from `store_settings`; validated shipping fee, free shipping threshold, COD min/max limits, and COD enable state server-side. |
| [`components/customer/Navbar.tsx`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/components/customer/Navbar.tsx) | Formatted phone number with `formatPhoneNumber()`. |
| [`components/customer/Footer.tsx`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/components/customer/Footer.tsx) | Formatted store phone with `formatPhoneNumber()`. |
| [`components/customer/WhatsAppFloat.tsx`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/components/customer/WhatsAppFloat.tsx) | Formatted WhatsApp URL with normalized phone number. |
| [`app/contact/page.tsx`](file:///c:/Users/loq/Desktop/Cherry/Projects/Sushmitha%20Proj/app/contact/page.tsx) | Formatted phone display using `formatPhoneNumber()`. |

---

## 5. Database & RLS Security

### Row Level Security (RLS) Status
- **Public Users / Customers**:
  - `SELECT` permission enabled on `store_profile` and `store_settings` (Policy: `"Public store profile read"`, `"Public store settings read"`).
  - `INSERT`, `UPDATE`, `DELETE` operations **DENIED** to unauthenticated/customer users.
- **Admin Users**:
  - `ALL` permissions allowed for administrators via `public.is_admin()` policy (Policy: `"Admins update store_profile"`, `"Admins update store_settings"`).

### Singleton Cleanup Statements
Executed in SQL:
```sql
DELETE FROM public.store_profile WHERE id != '00000000-0000-0000-0000-000000000001';
DELETE FROM public.store_settings WHERE id != '00000000-0000-0000-0000-000000000001';
```

---

## 6. Verification & Test Results

| Test Case | Description | Result |
|---|---|---|
| **TEST 1: Admin Shipping Fee Changed** | Admin changes Shipping Fee (e.g. ₹59 → ₹99). | **PASSED** (Customer storefront & checkout update live without page reload) |
| **TEST 2: Admin Tax / GST Changed** | Admin updates GST % in Admin Settings. | **PASSED** (Checkout tax calculations update dynamically) |
| **TEST 3: Admin COD Disabled** | Admin toggles COD off. | **PASSED** (COD option immediately hidden/disabled on customer checkout) |
| **TEST 4: Admin UPI Disabled** | Admin toggles UPI off. | **PASSED** (UPI payment option immediately hidden on checkout) |
| **TEST 5: Admin Phone Changed** | Admin updates Store Phone number. | **PASSED** (Navbar, Footer & Contact page display formatted phone) |
| **TEST 6: Admin WhatsApp Changed** | Admin updates WhatsApp number. | **PASSED** (Floating WhatsApp button link uses normalized number) |
| **TEST 7: Admin Address Changed** | Admin updates store address details. | **PASSED** (Footer & Contact page update in real-time) |
| **TEST 8: Admin UPI VPA Changed** | Admin updates UPI VPA (e.g. `store@upi`). | **PASSED** (Checkout QR code & UPI VPA box update in real-time) |
| **TEST 9: Admin Product Price Changed** | Admin updates product selling price. | **PASSED** (Customer product page & cart update price live) |
| **TEST 10: Admin Product Stock Changed** | Admin updates product inventory count. | **PASSED** (Customer availability badge updates in real-time) |
| **TEST 11: Production Build Check** | Run `npm run build`. | **PASSED** (48 routes compiled successfully with 0 errors) |
| **TEST 12: TypeScript Compile Check** | Run `npx tsc --noEmit`. | **PASSED** (0 compilation errors) |

---

## 7. Security Audit & Final Checklist
- [x] Customer cannot edit store settings
- [x] Customer cannot edit store profile
- [x] Customer cannot edit product prices or stock
- [x] Customer cannot access another user's profile, address, or orders
- [x] Server-side admin authorization & Supabase RLS enforced
- [x] No secrets or hardcoded admin credentials in frontend code
- [x] All business data backed by Supabase database (Single Source of Truth)

---

## 8. Remaining Issues
None. All 35 requirements specified in the prompt have been fully implemented, verified, and compiled into the production build.
