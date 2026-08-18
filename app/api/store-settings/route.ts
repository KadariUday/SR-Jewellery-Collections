import { NextRequest, NextResponse } from 'next/server';
import { StoreSettings } from '@/lib/types';
import { INITIAL_STORE_SETTINGS } from '@/lib/mockData';
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
      inMemorySettings = {
        ...inMemorySettings,
        ...body,
        updated_at: new Date().toISOString(),
      };
      saveSettings(inMemorySettings);
      return NextResponse.json({ success: true, settings: inMemorySettings });
    }
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
