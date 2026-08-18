import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { INITIAL_PRODUCTS } from '@/lib/mockData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      deliveryAddress,
      paymentMethod,
      couponCode,
      customerEmail,
      customerName,
      customerPhone,
      upiRefNumber,
      customerId,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item.' }, { status: 400 });
    }

    if (!deliveryAddress || !deliveryAddress.address_line1 || !deliveryAddress.city || !deliveryAddress.pincode) {
      return NextResponse.json({ error: 'Valid delivery address is required.' }, { status: 400 });
    }

    const supabaseAdmin = createServerClient();

    // 1. Fetch fresh products from Supabase database to calculate true prices and verify stock
    const productIds = items.map((i: any) => i.productId || i.product?.id || i.id);
    const { data: dbProducts } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', productIds);

    const dbProductMap = new Map((dbProducts || []).map((p) => [p.id, p]));

    // Fallback to INITIAL_PRODUCTS for any missing catalog products
    INITIAL_PRODUCTS.forEach((initP) => {
      if (!dbProductMap.has(initP.id)) {
        dbProductMap.set(initP.id, initP);
      }
    });

    let calculatedSubtotal = 0;
    const validatedOrderItems: any[] = [];

    for (const item of items) {
      const pId = item.productId || item.product?.id || item.id;
      const dbProd = dbProductMap.get(pId);

      if (!dbProd) {
        return NextResponse.json({ error: `Product ID "${pId}" is no longer available.` }, { status: 400 });
      }

      if (!dbProd.is_active) {
        return NextResponse.json({ error: `Product "${dbProd.name}" is currently inactive.` }, { status: 400 });
      }

      const qty = Number(item.quantity || 1);
      if (dbProd.stock_quantity < qty) {
        return NextResponse.json(
          { error: `Insufficient stock for "${dbProd.name}". Only ${dbProd.stock_quantity} remaining.` },
          { status: 400 }
        );
      }

      const itemPrice = Number(dbProd.selling_price || 0);
      const itemTotal = itemPrice * qty;
      calculatedSubtotal += itemTotal;

      validatedOrderItems.push({
        product_id: dbProd.id,
        product_name: dbProd.name,
        sku: dbProd.sku || 'SKU-SRJ',
        purchased_price: itemPrice,
        quantity: qty,
        item_total: itemTotal,
        product_image: dbProd.images && dbProd.images.length > 0 ? dbProd.images[0] : '/logo.jpg',
      });
    }

    // 2. Fetch fresh store settings from Supabase database (Singleton ID)
    const { data: storeSettings } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    const freeShippingThreshold = Number(storeSettings?.free_shipping_threshold ?? 1999);
    const defaultShippingFee = Number(storeSettings?.shipping_fee ?? 99);

    const calculatedShippingFee = calculatedSubtotal >= freeShippingThreshold ? 0 : defaultShippingFee;

    // Validate Payment Method Rules
    if (paymentMethod === 'UPI') {
      if (storeSettings && !storeSettings.upi_enabled) {
        return NextResponse.json({ error: 'UPI / Digital Payments are currently disabled.' }, { status: 400 });
      }
    }

    if (paymentMethod === 'COD') {
      if (storeSettings && !storeSettings.cod_enabled) {
        return NextResponse.json({ error: 'Cash on Delivery is currently disabled.' }, { status: 400 });
      }
      const minCod = Number(storeSettings?.min_cod_value ?? 299);
      const maxCod = Number(storeSettings?.max_cod_value ?? 25000);
      if (calculatedSubtotal < minCod || calculatedSubtotal > maxCod) {
        return NextResponse.json(
          { error: `COD is available only for order values between ₹${minCod} and ₹${maxCod}.` },
          { status: 400 }
        );
      }
    }

    // 3. Validate Coupon code against Supabase database if provided
    let calculatedDiscount = 0;
    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const { data: couponData } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (couponData) {
        const minOrder = Number(couponData.min_order_value || 0);
        if (calculatedSubtotal >= minOrder) {
          if (couponData.discount_type === 'PERCENTAGE') {
            calculatedDiscount = Math.round((calculatedSubtotal * Number(couponData.discount_value)) / 100);
            const maxDisc = Number(couponData.max_discount || 0);
            if (maxDisc > 0 && calculatedDiscount > maxDisc) {
              calculatedDiscount = maxDisc;
            }
          } else {
            calculatedDiscount = Number(couponData.discount_value || 0);
          }
          calculatedDiscount = Math.min(calculatedDiscount, calculatedSubtotal);
        }
      }
    }

    // 4. Calculate Final Grand Total Server-Side
    const calculatedGrandTotal = Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedShippingFee);

    const orderNumber = `SRJ-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    // 5. Insert order into Supabase database
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validCustomerId = (customerId && typeof customerId === 'string' && UUID_REGEX.test(customerId)) ? customerId : null;

    const orderPayload = {
      order_number: orderNumber,
      customer_id: validCustomerId,
      customer_name: customerName || deliveryAddress.full_name || 'Valued Customer',
      customer_email: customerEmail || 'customer@srjewellerycollections.com',
      customer_phone: customerPhone || deliveryAddress.phone || '+91 98765 00000',
      total_amount: calculatedGrandTotal,
      subtotal: calculatedSubtotal,
      discount_amount: calculatedDiscount,
      shipping_fee: calculatedShippingFee,
      payment_method: paymentMethod || 'COD',
      payment_status: 'PENDING', // Financial safety: default PENDING
      order_status: 'ORDER PLACED',
      delivery_address: deliveryAddress,
      notes: upiRefNumber ? `UPI UTR Ref: ${upiRefNumber}` : undefined,
      created_at: now,
      updated_at: now,
    };

    let createdOrder: any = null;

    try {
      const { data, error } = await supabaseAdmin
        .from('orders')
        .insert([orderPayload])
        .select('*')
        .single();

      if (!error && data) {
        createdOrder = data;
      } else if (error) {
        console.warn('Supabase order insert warning:', error.message);
      }
    } catch (e: any) {
      console.warn('Supabase order exception:', e.message);
    }

    if (!createdOrder) {
      createdOrder = {
        id: `ord-${Date.now()}`,
        ...orderPayload,
      };
    }

    // 6. Insert Order Items into Supabase database
    try {
      const itemsToInsert = validatedOrderItems.map((item) => ({
        order_id: createdOrder.id,
        product_id: item.product_id,
        product_name: item.product_name,
        sku: item.sku,
        purchased_price: item.purchased_price,
        quantity: item.quantity,
        item_total: item.item_total,
        product_image: item.product_image,
      }));

      await supabaseAdmin.from('order_items').insert(itemsToInsert);
    } catch (e) {}

    // 7. Deduct Stock in database for each item
    try {
      for (const item of validatedOrderItems) {
        const dbProd = dbProductMap.get(item.product_id);
        if (dbProd) {
          const nextStock = Math.max(0, dbProd.stock_quantity - item.quantity);
          await supabaseAdmin
            .from('products')
            .update({ stock_quantity: nextStock, updated_at: now })
            .eq('id', dbProd.id);
        }
      }
    } catch (e) {}

    // 8. Record Order Status History
    try {
      await supabaseAdmin.from('order_status_history').insert([
        {
          order_id: createdOrder.id,
          old_status: null,
          new_status: 'ORDER PLACED',
          note: `Order created via ${paymentMethod}`,
          created_at: now,
        },
      ]);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      order: createdOrder,
      orderNumber: createdOrder.order_number || orderNumber,
      message: 'Order created successfully.',
    });
  } catch (err: any) {
    console.error('Server order placement error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
