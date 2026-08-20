import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabaseAdmin = createServerClient();
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch orders error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format orders so items property matches frontend expectations
    const formattedOrders = (orders || []).map((o: any) => ({
      ...o,
      items: o.order_items || o.items || [],
    }));

    return NextResponse.json({ success: true, orders: formattedOrders });
  } catch (error: any) {
    console.error('Error fetching orders in /api/orders:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderStatus, paymentStatus, note, courierName, trackingNumber } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createServerClient();
    const now = new Date().toISOString();

    const updatePayload: any = { updated_at: now };
    if (orderStatus) updatePayload.order_status = orderStatus;
    if (paymentStatus) updatePayload.payment_status = paymentStatus;

    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .or(`id.eq.${orderId},order_number.eq.${orderId}`)
      .select('*');

    if (error) {
      console.warn('Error updating order status:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Insert status history
    if (orderStatus) {
      try {
        await supabaseAdmin.from('order_status_history').insert([
          {
            order_id: orderId,
            new_status: orderStatus,
            note: note || `Status updated to ${orderStatus}`,
            created_at: now,
          },
        ]);
      } catch (e) {}
    }

    // Insert delivery details if courier tracking info provided
    if (courierName || trackingNumber) {
      try {
        await supabaseAdmin.from('order_delivery_details').upsert([
          {
            order_id: orderId,
            courier_name: courierName || 'Standard Express',
            tracking_number: trackingNumber || '',
            shipping_provider: courierName || 'Standard Express',
            updated_at: now,
          },
        ]);
      } catch (e) {}
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Error updating order in /api/orders:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
