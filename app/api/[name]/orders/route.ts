// app/api/[name]/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { taggedQuery, parameterizedQuery } from '@/lib/db';
import { Order, Product } from '@/types';

interface CreateOrderRequest {
  productId: string;
  quantity: number;
  fullName: string;
  phoneNumber: string;
  deliveryLocation: string;
  paymentMethod: string;
}

interface OrderWithProduct extends Order {
  product_name: string;
  product_image: string | null;
  product_price: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const body: CreateOrderRequest = await request.json();
    
    // Validate required fields
    if (!body.productId || !body.quantity || body.quantity < 1) {
      return NextResponse.json(
        { error: 'Product ID and valid quantity are required' },
        { status: 400 }
      );
    }

    if (!body.fullName || !body.phoneNumber || !body.deliveryLocation) {
      return NextResponse.json(
        { error: 'Full name, phone number, and delivery location are required' },
        { status: 400 }
      );
    }

    // Get site ID from slug
    const sites = await taggedQuery<{ id: string }>`
      SELECT id FROM ecommerce_sites WHERE slug = ${name} LIMIT 1
    `;

    if (!sites?.length) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    const siteId = sites[0].id;

    // Get product details and verify it belongs to this site
    const products = await parameterizedQuery<Product>(
      'SELECT * FROM products WHERE id = $1 AND site_id = $2',
      [body.productId, siteId]
    );

    if (!products?.length) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[0];

    // Check stock
    if (product.stock < body.quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Calculate total - ensure price is treated as number
    const unitPrice = typeof product.price === 'string' 
      ? parseFloat(product.price) 
      : product.price;
    const totalAmount = unitPrice * body.quantity;

    // Create order with COD
    const order = await parameterizedQuery<Order>(
      `INSERT INTO orders (
        site_id, product_id, quantity, unit_price, total_amount,
        customer_name, customer_phone, shipping_address,
        payment_method, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        siteId,
        body.productId,
        body.quantity,
        unitPrice,
        totalAmount,
        body.fullName,
        body.phoneNumber,
        body.deliveryLocation,
        'cash_on_delivery',
        'pending',
        'pending'
      ]
    );

    // Update product stock
    await parameterizedQuery(
      'UPDATE products SET stock = stock - $1 WHERE id = $2',
      [body.quantity, body.productId]
    );

    return NextResponse.json({
      success: true,
      order: order[0],
      message: 'Order placed successfully! Payment will be collected upon delivery.'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET orders for a site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Get site ID
    const sites = await taggedQuery<{ id: string }>`
      SELECT id FROM ecommerce_sites WHERE slug = ${name} LIMIT 1
    `;

    if (!sites?.length) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    const siteId = sites[0].id;

    // Build query
    let query = `
      SELECT 
        o.*, 
        p.name as product_name, 
        p.image_url as product_image,
        p.price as product_price
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.site_id = $1
    `;
    const queryParams: any[] = [siteId];

    if (status) {
      query += ` AND o.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    // Type the result properly
    const orders = await parameterizedQuery<any>(query, queryParams);

    // Transform the data to ensure proper typing
    const typedOrders: OrderWithProduct[] = orders.map((order: any) => ({
      id: order.id,
      site_id: order.site_id,
      customer_id: order.customer_id,
      customer_email: order.customer_email,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      product_id: order.product_id,
      quantity: order.quantity,
      unit_price: order.unit_price,
      total_amount: order.total_amount,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      shipping_address: order.shipping_address,
      shipping_city: order.shipping_city,
      shipping_country: order.shipping_country,
      shipping_zip: order.shipping_zip,
      shipping_method: order.shipping_method,
      tracking_number: order.tracking_number,
      notes: order.notes,
      created_at: order.created_at,
      updated_at: order.updated_at,
      product_name: order.product_name,
      product_image: order.product_image,
      product_price: order.product_price
    }));

    // Get total count
    const countResult = await parameterizedQuery<{ count: number }>(
      'SELECT COUNT(*) as count FROM orders WHERE site_id = $1',
      [siteId]
    );

    return NextResponse.json({
      orders: typedOrders,
      total: countResult[0]?.count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}