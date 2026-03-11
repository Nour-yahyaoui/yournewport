// app/api/user/site/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from the request headers
    // In a real app, this would come from your auth session
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's site
    const sites = await sql`
      SELECT * FROM ecommerce_sites WHERE user_id = ${userId}::uuid LIMIT 1
    `;

    if (!sites || sites.length === 0) {
      return NextResponse.json({ 
        site: null,
        products: [],
        orders: [] 
      });
    }

    const site = sites[0];

    // Get products for this site
    const products = await sql`
      SELECT * FROM products WHERE site_id = ${site.id} ORDER BY created_at DESC
    `;

    // Get orders for this site
    const orders = await sql`
      SELECT 
        o.*,
        p.name as product_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.site_id = ${site.id}
      ORDER BY o.created_at DESC
      LIMIT 20
    `;

    return NextResponse.json({
      site,
      products: products || [],
      orders: orders || []
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch site' },
      { status: 500 }
    );
  }
}