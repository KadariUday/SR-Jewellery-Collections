export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  colour?: string;
  size?: string;
  price_adjustment: number;
  stock_quantity: number;
  sku?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  category_id: string;
  category_name?: string;
  description: string;
  original_price: number;
  selling_price: number;
  discount_percentage: number;
  stock_quantity: number;
  low_stock_threshold: number;
  material: string;
  stone_type: string;
  colour: string;
  weight: string;
  size: string;
  dimensions: string;
  care_instructions: string;
  shipping_info: string;
  return_info: string;
  tags: string[];
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  images?: string[];
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface InventoryHistory {
  id: string;
  product_id: string;
  product_name?: string;
  sku?: string;
  previous_stock: number;
  new_stock: number;
  change_amount: number;
  reason: string;
  admin_id?: string;
  admin_name?: string;
  created_at: string;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at?: string;
}

export type OrderStatus =
  | 'ORDER PLACED'
  | 'CONFIRMED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentMethod = 'COD' | 'UPI' | 'CARD' | 'NET_BANKING';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  purchased_price: number;
  quantity: number;
  item_total: number;
  product_image?: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  old_status?: string;
  new_status: OrderStatus;
  admin_id?: string;
  admin_name?: string;
  note?: string;
  created_at: string;
}

export interface OrderDeliveryDetails {
  id: string;
  order_id: string;
  courier_name: string;
  tracking_number: string;
  shipping_provider: string;
  dispatch_date?: string;
  expected_delivery_date?: string;
  delivery_notes?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  delivery_address: CustomerAddress;
  items: OrderItem[];
  delivery_details?: OrderDeliveryDetails;
  status_history?: OrderStatusHistory[];
  notes?: string;
  upi_utr?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  order_number?: string;
  customer_id: string;
  customer_name?: string;
  payment_method: PaymentMethod;
  provider: string;
  provider_payment_id?: string;
  provider_order_id?: string;
  amount: number;
  status: PaymentStatus;
  verified: boolean;
  created_at: string;
}

export interface StoreProfile {
  id: string;
  store_name: string;
  logo_url: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  map_url: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  business_hours: string;
  upi_vpa: string;
  upi_id?: string;
  updated_at: string;
}

export interface StoreSettings {
  id: string;
  currency: string;
  currency_symbol: string;
  shipping_fee: number;
  free_shipping_threshold: number;
  cod_enabled: boolean;
  min_cod_value: number;
  max_cod_value: number;
  upi_enabled: boolean;
  tax_percentage: number;
  auto_confirm_orders: boolean;
  low_stock_threshold_global: number;
  allow_cancellation: boolean;
  allow_returns: boolean;
  razorpay_test_mode: boolean;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'CLOSED';
  created_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  admin_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  created_at: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  admin_id: string;
  admin_name?: string;
  note: string;
  created_at: string;
  updated_at?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FLAT';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  usage_count?: number;
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  product_name: string;
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  created_at: string;
}
