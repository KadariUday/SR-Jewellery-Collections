import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qllnjwmcprxdgdhqvbyb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbG5qd21jcHJ4ZGdkaHF2YnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTY1MzAsImV4cCI6MjEwMjYzMjUzMH0.mrPiPE6BJRhrno60x7uYsiusjNMMMH_8IaF0fNq4o94';

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();
