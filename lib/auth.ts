import { UserProfile } from './types';
import { INITIAL_CUSTOMERS } from './mockData';

export async function getCurrentUser() {
  // In production with connected Supabase, fetch auth session
  // Default to mock admin or customer session if running locally
  return {
    id: 'cust-3',
    email: 'sushmitha.admin@srjewellery.com',
  };
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  // Default returning admin profile for local demo
  const adminProfile = INITIAL_CUSTOMERS.find((c) => c.role === 'ADMIN');
  return adminProfile || null;
}

export async function requireAdmin(): Promise<UserProfile> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED_ADMIN_ONLY');
  }
  return profile;
}

export async function requireCustomer(): Promise<UserProfile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error('UNAUTHORIZED_PLEASE_LOGIN');
  }
  return profile;
}
