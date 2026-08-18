import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qllnjwmcprxdgdhqvbyb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceKeyCandidate = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if service role key is valid (not default placeholder/invalid token)
const isServiceKeyValid = Boolean(
  serviceKeyCandidate &&
  serviceKeyCandidate.length > 50 &&
  !serviceKeyCandidate.includes('RMh4hfsi84LdbS4uS3jaSaNccc8kartkDJ_Drv3bikA')
);

const effectiveKey = isServiceKeyValid ? serviceKeyCandidate! : supabaseAnonKey;

export function createServerClient() {
  return createSupabaseClient(supabaseUrl, effectiveKey, {
    auth: {
      persistSession: false,
    },
  });
}
