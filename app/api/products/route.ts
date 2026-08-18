import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/lib/types';
import { INITIAL_PRODUCTS } from '@/lib/mockData';
import fs from 'fs';
import path from 'path';

// Server-side persistent storage path (using /tmp on Vercel serverless)
const DATA_FILE = path.join(process.cwd(), '.next', 'products_store.json');
const TMP_FILE = path.join('/tmp', 'products_store.json');

function getProductsFile(): string {
  try {
    if (fs.existsSync(TMP_FILE)) return TMP_FILE;
    if (fs.existsSync(DATA_FILE)) return DATA_FILE;
  } catch (e) {}
  return TMP_FILE;
}

function loadProductsFromServer(): Product[] {
  try {
    const filePath = getProductsFile();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading server products file:', e);
  }
  return INITIAL_PRODUCTS;
}

function saveProductsToServer(products: Product[]): boolean {
  try {
    const data = JSON.stringify(products);
    try {
      fs.writeFileSync(TMP_FILE, data, 'utf8');
    } catch (e) {}
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(DATA_FILE, data, 'utf8');
    } catch (e) {}
    return true;
  } catch (e) {
    console.warn('Error writing server products file:', e);
    return false;
  }
}

// In-memory server cache
let inMemoryProducts: Product[] = loadProductsFromServer();

export async function GET() {
  if (inMemoryProducts.length === 0) {
    inMemoryProducts = loadProductsFromServer();
  }
  return NextResponse.json({ products: inMemoryProducts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, product, products, id } = body;

    if (action === 'UPDATE' && product) {
      const now = new Date().toISOString();
      const updatedProduct = { ...product, updated_at: now };
      let found = false;

      inMemoryProducts = inMemoryProducts.map((p) => {
        if (p.id === product.id) {
          found = true;
          return updatedProduct;
        }
        return p;
      });

      if (!found) {
        inMemoryProducts.unshift(updatedProduct);
      }

      saveProductsToServer(inMemoryProducts);
      return NextResponse.json({ success: true, products: inMemoryProducts });
    }

    if (action === 'ADD' && product) {
      const now = new Date().toISOString();
      const newProduct = { ...product, created_at: now, updated_at: now };
      inMemoryProducts = [newProduct, ...inMemoryProducts];
      saveProductsToServer(inMemoryProducts);
      return NextResponse.json({ success: true, products: inMemoryProducts });
    }

    if (action === 'DELETE' && id) {
      inMemoryProducts = inMemoryProducts.filter((p) => p.id !== id);
      saveProductsToServer(inMemoryProducts);
      return NextResponse.json({ success: true, products: inMemoryProducts });
    }

    if (action === 'SET_ALL' && Array.isArray(products)) {
      inMemoryProducts = products;
      saveProductsToServer(inMemoryProducts);
      return NextResponse.json({ success: true, products: inMemoryProducts });
    }

    return NextResponse.json({ error: 'Invalid action payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/products:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
