import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { storeSettingsSchema } from '@/lib/validation';
import { INITIAL_STORE_SETTINGS } from '@/lib/mockData';

const SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
  try {
    const supabaseAdmin = createServerClient();
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .eq('id', SINGLETON_ID)
      .maybeSingle();

    if (error) {
      console.warn('Supabase store_settings query error:', error.message);
      return NextResponse.json({ settings: INITIAL_STORE_SETTINGS });
    }

    return NextResponse.json({ settings: data || INITIAL_STORE_SETTINGS });
  } catch (e: any) {
    return NextResponse.json({ settings: INITIAL_STORE_SETTINGS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = storeSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues[0]?.message || 'Invalid settings payload';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const validData = validationResult.data;
    const supabaseAdmin = createServerClient();

    const cleanSettings = {
      id: SINGLETON_ID,
      shipping_fee: validData.shipping_fee,
      free_shipping_threshold: validData.free_shipping_threshold,
      tax_percentage: validData.tax_percentage,
      cod_enabled: validData.cod_enabled,
      min_cod_value: validData.min_cod_value,
      max_cod_value: validData.max_cod_value,
      upi_enabled: validData.upi_enabled,
      razorpay_test_mode: validData.razorpay_test_mode,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .upsert([cleanSettings])
      .select()
      .single();

    if (error) {
      console.error('Supabase store_settings upsert error:', error.message);
      return NextResponse.json({ error: `Unable to save settings: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data || cleanSettings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
