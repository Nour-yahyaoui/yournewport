// app/api/products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// UPDATE a product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  
  try {
    const { productId } = await params;
    const body = await request.json();

    const {
      name,
      description,
      price,
      category,
      stock,
      image_url
    } = body;

    // Build update query
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push(`name = $${values.length + 1}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${values.length + 1}`);
      values.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = $${values.length + 1}`);
      values.push(price);
    }
    if (category !== undefined) {
      updates.push(`category = $${values.length + 1}`);
      values.push(category);
    }
    if (stock !== undefined) {
      updates.push(`stock = $${values.length + 1}`);
      values.push(stock);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${values.length + 1}`);
      values.push(image_url);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add productId to values
    values.push(productId);

    const query = `
      UPDATE products 
      SET ${updates.join(', ')} 
      WHERE id = $${values.length}
      RETURNING *
    `;

    const updated = await sql.query(query, values);

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }


    return NextResponse.json({
      success: true,
      product: updated[0]
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  
  try {
    const { productId } = await params;

    // Check if product has any orders
    const orders = await sql`
      SELECT id FROM orders WHERE product_id = ${productId} LIMIT 1
    `;

    if (orders && orders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders' },
        { status: 400 }
      );
    }

    // Delete the product
    const deleted = await sql`
      DELETE FROM products WHERE id = ${productId}
      RETURNING id
    `;

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }


    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}