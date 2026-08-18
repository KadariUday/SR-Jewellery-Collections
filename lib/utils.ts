import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, symbol: string = "₹"): string {
  return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, '0');
  
  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export function generateOrderNumber(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SRJ-${Date.now().toString().slice(-6)}-${random}`;
}

export function getOrderStatusBadgeClass(status: string): string {
  switch (status) {
    case 'ORDER PLACED':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'CONFIRMED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'PACKED':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'SHIPPED':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'DELIVERED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'CANCELLED':
    case 'REFUNDED':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'RETURN REQUESTED':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

export function getPaymentStatusBadgeClass(status: string): string {
  switch (status) {
    case 'SUCCESS':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'FAILED':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'REFUNDED':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

/**
 * Security: Sanitize user input against XSS script injection and HTML tags
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Security: Sanitize Direct UPI UTR Reference Number (Numeric & Alpha 12-digit string)
 */
export function sanitizeUtr(utr: string): string {
  if (!utr) return '';
  return utr.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
}

