import { NextRequest, NextResponse } from 'next/server';
import { StoreProfile } from '@/lib/types';
import { INITIAL_STORE_PROFILE } from '@/lib/mockData';
import { createServerClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

const TMP_FILE = path.join('/tmp', 'store_profile.json');
const DATA_FILE = path.join(process.cwd(), '.next', 'store_profile.json');

function loadProfile(): StoreProfile {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf8');
      return JSON.parse(data);
    }
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {}
  return INITIAL_STORE_PROFILE;
}

function saveProfile(profile: StoreProfile): boolean {
  try {
    const data = JSON.stringify(profile);
    try { fs.writeFileSync(TMP_FILE, data, 'utf8'); } catch (e) {}
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, data, 'utf8');
    } catch (e) {}
    return true;
  } catch (e) {
    return false;
  }
}

let inMemoryProfile: StoreProfile = loadProfile();

export async function GET() {
  if (!inMemoryProfile || !inMemoryProfile.phone) {
    inMemoryProfile = loadProfile();
  }
  return NextResponse.json({ profile: inMemoryProfile });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body && typeof body === 'object') {
      const updatedProfile: StoreProfile = {
        ...inMemoryProfile,
        ...body,
        updated_at: new Date().toISOString(),
      };
      inMemoryProfile = updatedProfile;
      saveProfile(inMemoryProfile);

      // Sync to Supabase database using admin service role key to bypass RLS policies
      try {
        const supabaseAdmin = createServerClient();
        const cleanProfile = {
          id: updatedProfile.id || '00000000-0000-0000-0000-000000000001',
          store_name: String(updatedProfile.store_name || 'SR Jewellery Collections'),
          logo_url: String(updatedProfile.logo_url || '/logo.jpg'),
          tagline: String(updatedProfile.tagline || ''),
          description: String(updatedProfile.description || ''),
          email: String(updatedProfile.email || 'contact@srjewellerycollections.com'),
          phone: String(updatedProfile.phone || '+91 8790522579'),
          whatsapp: String(updatedProfile.whatsapp || '+918790522579'),
          address: String(updatedProfile.address || ''),
          city: String(updatedProfile.city || ''),
          state: String(updatedProfile.state || ''),
          pincode: String(updatedProfile.pincode || ''),
          map_url: String(updatedProfile.map_url || ''),
          instagram_url: String(updatedProfile.instagram_url || ''),
          facebook_url: String(updatedProfile.facebook_url || ''),
          youtube_url: String(updatedProfile.youtube_url || ''),
          business_hours: String(updatedProfile.business_hours || ''),
          upi_id: String(updatedProfile.upi_id || '992438853@fam'),
          updated_at: updatedProfile.updated_at,
        };
        await supabaseAdmin.from('store_profile').upsert([cleanProfile]);
      } catch (e) {
        console.warn('Server Supabase store_profile upsert note:', e);
      }

      return NextResponse.json({ success: true, profile: inMemoryProfile });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}

