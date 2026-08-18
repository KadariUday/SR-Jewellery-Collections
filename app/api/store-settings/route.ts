import { NextRequest, NextResponse } from 'next/server';
import { StoreSettings } from '@/lib/types';
import { INITIAL_STORE_SETTINGS } from '@/lib/mockData';
import { createServerClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

const TMP_FILE = path.join('/tmp', 'store_settings.json');
const DATA_FILE = path.join(process.cwd(), '.next', 'store_settings.json');

function loadSettings(): StoreSettings {
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
  return INITIAL_STORE_SETTINGS;
}

function saveSettings(settings: StoreSettings): boolean {
  try {
    const data = JSON.stringify(settings);
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

let inMemorySettings: StoreSettings = loadSettings();

export async function GET() {
  if (!inMemorySettings) {
    inMemorySettings = loadSettings();
  }
  return NextResponse.json({ settings: inMemorySettings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body && typeof body === 'object') {
      const updatedSettings: StoreSettings = {
        ...inMemorySettings,
        ...body,
        updated_at: new Date().toISOString(),
      };
      inMemorySettings = updatedSettings;
      saveSettings(inMemorySettings);

      // Sync to Supabase database using admin service role key to bypass RLS policies
      try {
        const supabaseAdmin = createServerClient();
        const cleanSettings = {
          id: updatedSettings.id || '00000000-0000-0000-0000-000000000001',
          shipping_fee: Number(updatedSettings.shipping_fee || 99),
          free_shipping_threshold: Number(updatedSettings.free_shipping_threshold || 1999),
          tax_percentage: Number(updatedSettings.tax_percentage || 3),
          cod_enabled: Boolean(updatedSettings.cod_enabled),
          min_cod_value: Number(updatedSettings.min_cod_value || 299),
          max_cod_value: Number(updatedSettings.max_cod_value || 25000),
          upi_enabled: Boolean(updatedSettings.upi_enabled),
          razorpay_test_mode: Boolean(updatedSettings.razorpay_test_mode),
          updated_at: updatedSettings.updated_at,
        };
        await supabaseAdmin.from('store_settings').upsert([cleanSettings]);
      } catch (e) {
        console.warn('Server Supabase store_settings upsert note:', e);
      }

      return NextResponse.json({ success: true, settings: inMemorySettings });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}

