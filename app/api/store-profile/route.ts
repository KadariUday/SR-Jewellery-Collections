import { NextRequest, NextResponse } from 'next/server';
import { StoreProfile } from '@/lib/types';
import { INITIAL_STORE_PROFILE } from '@/lib/mockData';
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
      inMemoryProfile = {
        ...inMemoryProfile,
        ...body,
        updated_at: new Date().toISOString(),
      };
      saveProfile(inMemoryProfile);
      return NextResponse.json({ success: true, profile: inMemoryProfile });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
