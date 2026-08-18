-- SR JEWELLERY COLLECTIONS - ADVANCED DATABASE SCHEMA & SEED
-- Database Engine: PostgreSQL / Supabase RLS

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Stores user role CUSTOMER or ADMIN)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    original_price NUMERIC(10,2) NOT NULL,
    selling_price NUMERIC(10,2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    material TEXT DEFAULT 'Gold Plated',
    stone_type TEXT DEFAULT 'Kundan',
    colour TEXT DEFAULT 'Gold',
    weight TEXT DEFAULT '45g',
    size TEXT DEFAULT 'Free Size',
    dimensions TEXT DEFAULT '5cm x 3cm',
    care_instructions TEXT DEFAULT 'Keep away from moisture and perfumes. Store in a soft pouch.',
    shipping_info TEXT DEFAULT 'Dispatched within 24-48 hours. Free delivery on orders above ₹1,999.',
    return_info TEXT DEFAULT '7-day easy return policy for unworn items with original tags.',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT FALSE,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    colour TEXT,
    size TEXT,
    price_adjustment NUMERIC(10,2) DEFAULT 0,
    stock_quantity INT DEFAULT 0,
    sku TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INVENTORY HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    change_amount INT NOT NULL,
    reason TEXT NOT NULL,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CUSTOMER ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT DEFAULT 'Home',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) NOT NULL,
    discount_amount NUMERIC(10,2) DEFAULT 0,
    shipping_fee NUMERIC(10,2) DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'UPI', 'CARD', 'NET_BANKING')),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED')),
    order_status TEXT NOT NULL DEFAULT 'ORDER PLACED' CHECK (order_status IN ('ORDER PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURN REQUESTED', 'RETURNED', 'REFUNDED')),
    delivery_address JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    purchased_price NUMERIC(10,2) NOT NULL,
    quantity INT NOT NULL,
    item_total NUMERIC(10,2) NOT NULL,
    product_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ORDER STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ORDER DELIVERY DETAILS TABLE
CREATE TABLE IF NOT EXISTS public.order_delivery_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
    courier_name TEXT,
    tracking_number TEXT,
    shipping_provider TEXT,
    dispatch_date TIMESTAMPTZ,
    expected_delivery_date TIMESTAMPTZ,
    delivery_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL,
    provider TEXT DEFAULT 'RAZORPAY',
    provider_payment_id TEXT,
    provider_order_id TEXT,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. STORE PROFILE TABLE (Single row for store configuration)
CREATE TABLE IF NOT EXISTS public.store_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT NOT NULL DEFAULT 'SR Jewellery Collections',
    logo_url TEXT DEFAULT '/images/logo.png',
    tagline TEXT DEFAULT 'Timeless Elegance & Royal Heritage Jewellery',
    description TEXT DEFAULT 'Discover hand-crafted Kundan, Polki, Gold & Diamond Jewellery designed for modern royalty. Every piece reflects craftsmanship and luxury.',
    email TEXT DEFAULT 'contact@srjewellerycollections.com',
    phone TEXT DEFAULT '+91 98765 43210',
    whatsapp TEXT DEFAULT '+919876543210',
    address TEXT DEFAULT '108 Royal Heritage Galleria, MG Road',
    city TEXT DEFAULT 'Hyderabad',
    state TEXT DEFAULT 'Telangana',
    pincode TEXT DEFAULT '500001',
    map_url TEXT DEFAULT 'https://maps.google.com',
    instagram_url TEXT DEFAULT 'https://instagram.com/srjewellery',
    facebook_url TEXT DEFAULT 'https://facebook.com/srjewellery',
    youtube_url TEXT DEFAULT 'https://youtube.com/srjewellery',
    business_hours TEXT DEFAULT 'Mon - Sat: 10:30 AM - 8:30 PM | Sun: Closed',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency TEXT DEFAULT 'INR',
    currency_symbol TEXT DEFAULT '₹',
    shipping_fee NUMERIC(10,2) DEFAULT 99.00,
    free_shipping_threshold NUMERIC(10,2) DEFAULT 1999.00,
    cod_enabled BOOLEAN DEFAULT TRUE,
    min_cod_value NUMERIC(10,2) DEFAULT 299.00,
    max_cod_value NUMERIC(10,2) DEFAULT 25000.00,
    upi_enabled BOOLEAN DEFAULT TRUE,
    tax_percentage NUMERIC(5,2) DEFAULT 3.00,
    auto_confirm_orders BOOLEAN DEFAULT FALSE,
    low_stock_threshold_global INT DEFAULT 5,
    allow_cancellation BOOLEAN DEFAULT TRUE,
    allow_returns BOOLEAN DEFAULT TRUE,
    razorpay_test_mode BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. CONTACT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'READ', 'REPLIED', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. ADMIN ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CUSTOMER NOTES TABLE (Internal admin notes)
CREATE TABLE IF NOT EXISTS public.customer_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value NUMERIC(10,2) NOT NULL,
    min_order_value NUMERIC(10,2) DEFAULT 0,
    max_discount NUMERIC(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('APPROVED', 'PENDING', 'REJECTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_delivery_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read on categories, products, images, store_profile, store_settings, approved reviews
CREATE POLICY "Public categories read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public products read" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admin products read all" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public images read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Public store profile read" ON public.store_profile FOR SELECT USING (true);
CREATE POLICY "Public store settings read" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Public approved reviews read" ON public.reviews FOR SELECT USING (status = 'APPROVED');

-- Insert contact messages by anyone
CREATE POLICY "Public insert contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- INITIAL SEED DATA
INSERT INTO public.store_profile (id, store_name, tagline, description, email, phone, whatsapp, address, city, state, pincode, business_hours)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SR Jewellery Collections',
    'Timeless Elegance & Royal Heritage Jewellery',
    'Discover hand-crafted Kundan, Polki, Gold & Diamond Jewellery designed for modern royalty. Every piece reflects craftsmanship and luxury.',
    'contact@srjewellerycollections.com',
    '+91 98765 43210',
    '+919876543210',
    '108 Royal Heritage Galleria, MG Road',
    'Hyderabad',
    'Telangana',
    '500001',
    'Mon - Sat: 10:30 AM - 8:30 PM | Sun: Closed'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.store_settings (id, currency, shipping_fee, free_shipping_threshold, cod_enabled, min_cod_value, max_cod_value, upi_enabled, tax_percentage)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'INR',
    99.00,
    1999.00,
    TRUE,
    299.00,
    25000.00,
    TRUE,
    3.00
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, max_discount, is_active)
VALUES 
('UDAY99', 'PERCENTAGE', 99.00, 0.00, 0.00, true),
('WELCOME10', 'PERCENTAGE', 10.00, 999.00, 500.00, true),
('ROYAL500', 'FIXED', 500.00, 4999.00, 500.00, true)
ON CONFLICT (code) DO NOTHING;
