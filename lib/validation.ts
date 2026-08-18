import { z } from 'zod';

/**
 * UPI VPA ID Regex & Validator
 * Format: username@provider (e.g., storename@upi, 9876543210@fam, sushmitha@okaxis)
 */
export const UPI_VPA_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9]{2,64}$/;

export function isValidUpiVpa(upi: string): boolean {
  if (!upi || typeof upi !== 'string') return false;
  return UPI_VPA_REGEX.test(upi.trim());
}

/**
 * Phone Number Normalization Utility
 * Extracts digits only and standardizes Indian country code format (91XXXXXXXXXX)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    clean = '91' + clean;
  }
  return clean;
}

/**
 * Phone Number Format Utility for UI Display
 * Formats 918790522579 to +91 87905 22579
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Store Settings Schema Validator (Zod)
 */
export const storeSettingsSchema = z.object({
  shipping_fee: z
    .number()
    .min(0, 'Shipping fee must be greater than or equal to 0')
    .max(10000, 'Shipping fee exceeds maximum allowable amount'),
  free_shipping_threshold: z
    .number()
    .min(0, 'Free shipping threshold must be greater than or equal to 0'),
  tax_percentage: z
    .number()
    .min(0, 'Tax percentage cannot be negative')
    .max(100, 'Tax percentage cannot exceed 100%'),
  cod_enabled: z.boolean(),
  min_cod_value: z
    .number()
    .min(0, 'Minimum COD order value must be greater than or equal to 0'),
  max_cod_value: z
    .number()
    .min(0, 'Maximum COD order value must be greater than or equal to 0'),
  upi_enabled: z.boolean(),
  razorpay_test_mode: z.boolean(),
}).refine((data) => data.max_cod_value >= data.min_cod_value, {
  message: 'Maximum COD Order Value must be greater than or equal to Minimum COD Order Value',
  path: ['max_cod_value'],
});

export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;

/**
 * Store Profile Schema Validator (Zod)
 */
export const storeProfileSchema = z.object({
  store_name: z.string().min(1, 'Store name is required'),
  logo_url: z.string().min(1, 'Logo URL is required'),
  tagline: z.string().optional().default(''),
  description: z.string().optional().default(''),
  email: z.string().email('Enter a valid store email address'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  whatsapp: z.string().min(10, 'Enter a valid WhatsApp number'),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  state: z.string().optional().default(''),
  pincode: z.string().optional().default(''),
  map_url: z.string().optional().default(''),
  business_hours: z.string().optional().default(''),
  instagram_url: z.string().optional().default(''),
  facebook_url: z.string().optional().default(''),
  youtube_url: z.string().optional().default(''),
  upi_vpa: z.string().refine(isValidUpiVpa, {
    message: 'Enter a valid UPI ID, e.g. example@upi',
  }),
});

export type StoreProfileInput = z.infer<typeof storeProfileSchema>;
