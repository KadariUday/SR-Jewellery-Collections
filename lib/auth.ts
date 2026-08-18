import { createServerClient } from './supabase/server';
import { UserProfile } from './types';

export async function getCurrentUser() {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return {
      id: session.user.id,
      email: session.user.email || '',
    };
  } catch (e) {
    return null;
  }
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !data) {
      return {
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || 'Customer',
        phone: session.user.user_metadata?.phone || '',
        role: (session.user.user_metadata?.role as any) || 'CUSTOMER',
        created_at: session.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return data as UserProfile;
  } catch (e) {
    return null;
  }
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
