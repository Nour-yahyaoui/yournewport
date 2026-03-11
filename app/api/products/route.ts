// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  console.log('🔵 POST /api/products - Create product');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const {
      siteId,
      name,
      description,
      price,
      category,
      stock,
      image_url
    } = body;

    // Validate required fields
    if (!siteId || !name || !price) {
      return NextResponse.json(
        { error: 'Site ID, name, and price are required' },
        { status: 400 }
      );
    }

    // Create the product
    const newProduct = await sql`
      INSERT INTO products (
        site_id, name, description, price, category, stock, image_url
      ) VALUES (
        ${siteId}::uuid, ${name}, ${description || null}, ${price}, 
        ${category || null}, ${stock || 0}, ${image_url || null}
      )
      RETURNING *
    `;

    console.log('✅ Product created:', newProduct[0]);

    return NextResponse.json({
      success: true,
      product: newProduct[0]
    });

  } catch (error) {
    console.error('❌ Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}