// app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  console.log('🔵 GET /api/orders/[orderId] - Get order');
  
  try {
    const { orderId } = await params;

    const orders = await sql`
      SELECT 
        o.*,
        p.name as product_name,
        p.price as product_price,
        p.image_url as product_image
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ${orderId}
      LIMIT 1
    `;

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order: orders[0]
    });

  } catch (error) {
    console.error('❌ Error getting order:', error);
    return NextResponse.json(
      { error: 'Failed to get order' },
      { status: 500 }
    );
  }
}

// UPDATE an order
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  console.log('🔵 PATCH /api/orders/[orderId] - Update order');
  
  try {
    const { orderId } = await params;
    const body = await request.json();
    console.log('Update data:', body);

    const {
      status,
      payment_status,
      tracking_number
    } = body;

    // Build update query
    const updates = [];
    const values = [];
    
    if (status !== undefined) {
      updates.push(`status = $${values.length + 1}`);
      values.push(status);
    }
    if (payment_status !== undefined) {
      updates.push(`payment_status = $${values.length + 1}`);
      values.push(payment_status);
    }
    if (tracking_number !== undefined) {
      updates.push(`tracking_number = $${values.length + 1}`);
      values.push(tracking_number);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add orderId to values
    values.push(orderId);

    const query = `
      UPDATE orders 
      SET ${updates.join(', ')} 
      WHERE id = $${values.length}
      RETURNING *
    `;

    const updated = await sql.query(query, values);

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('✅ Order updated:', updated[0]);

    return NextResponse.json({
      success: true,
      order: updated[0]
    });

  } catch (error) {
    console.error('❌ Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE an order (optional - usually you don't delete orders, just cancel them)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  console.log('🔵 DELETE /api/orders/[orderId] - Delete order');
  
  try {
    const { orderId } = await params;

    // Instead of deleting, just mark as cancelled
    const updated = await sql`
      UPDATE orders 
      SET status = 'cancelled' 
      WHERE id = ${orderId}
      RETURNING id
    `;

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log('✅ Order cancelled:', orderId);

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}