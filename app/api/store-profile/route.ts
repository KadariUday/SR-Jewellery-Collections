import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { storeProfileSchema, normalizePhoneNumber } from '@/lib/validation';
import { INITIAL_STORE_PROFILE } from '@/lib/mockData';

const SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
  try {
    const supabaseAdmin = createServerClient();
    const { data, error } = await supabaseAdmin
      .from('store_profile')
      .select('*')
      .eq('id', SINGLETON_ID)
      .maybeSingle();

    if (error) {
      console.warn('Supabase store_profile query error:', error.message);
      return NextResponse.json({ profile: INITIAL_STORE_PROFILE });
    }

    const profileData = data || INITIAL_STORE_PROFILE;
    if (profileData && profileData.upi_vpa && !profileData.upi_id) {
      profileData.upi_id = profileData.upi_vpa;
    } else if (profileData && profileData.upi_id && !profileData.upi_vpa) {
      profileData.upi_vpa = profileData.upi_id;
    }

    return NextResponse.json({ profile: profileData });
  } catch (e: any) {
    return NextResponse.json({ profile: INITIAL_STORE_PROFILE });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Normalize upi_vpa / upi_id if passed as upi_id
    if (body && body.upi_id && !body.upi_vpa) {
      body.upi_vpa = body.upi_id;
    }

    const validationResult = storeProfileSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMsg = validationResult.error.issues[0]?.message || 'Invalid profile payload';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const validData = validationResult.data;
    const supabaseAdmin = createServerClient();

    const cleanProfile = {
      id: SINGLETON_ID,
      store_name: validData.store_name,
      logo_url: validData.logo_url,
      tagline: validData.tagline || '',
      description: validData.description || '',
      email: validData.email,
      phone: normalizePhoneNumber(validData.phone),
      whatsapp: normalizePhoneNumber(validData.whatsapp),
      address: validData.address || '',
      city: validData.city || '',
      state: validData.state || '',
      pincode: validData.pincode || '',
      map_url: validData.map_url || '',
      business_hours: validData.business_hours || '',
      instagram_url: validData.instagram_url || '',
      facebook_url: validData.facebook_url || '',
      youtube_url: validData.youtube_url || '',
      upi_vpa: validData.upi_vpa,
      upi_id: validData.upi_vpa,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('store_profile')
      .upsert([cleanProfile])
      .select()
      .single();

    if (error) {
      console.error('Supabase store_profile upsert error:', error.message);
      return NextResponse.json({ error: `Unable to save profile: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: data || cleanProfile });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
