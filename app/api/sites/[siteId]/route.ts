// app/api/sites/[siteId]/route.ts - Simpler version
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET a specific site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    const sites = await sql`
      SELECT * FROM ecommerce_sites WHERE id = ${siteId} LIMIT 1
    `;

    if (!sites || sites.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ site: sites[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get site' }, { status: 500 });
  }
}

// UPDATE a site
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const body = await request.json();

    // Simple update with all fields (you can make this dynamic later)
    const updated = await sql`
      UPDATE ecommerce_sites 
      SET 
        name = COALESCE(${body.name}, name),
        description = COALESCE(${body.description}, description),
        phone = COALESCE(${body.phone}, phone),
        email = COALESCE(${body.email}, email),
        address = COALESCE(${body.address}, address),
        currency = COALESCE(${body.currency}, currency),
        instagram = COALESCE(${body.instagram}, instagram),
        facebook = COALESCE(${body.facebook}, facebook),
        twitter = COALESCE(${body.twitter}, twitter),
        website = COALESCE(${body.website}, website),
        founded_at = COALESCE(${body.founded_at}, founded_at),
        logo_url = COALESCE(${body.logo_url}, logo_url)
      WHERE id = ${siteId}
      RETURNING id, name, slug, logo_url, description, phone, email, address, currency, created_at
    `;

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, site: updated[0] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update site' }, { status: 500 });
  }
}

// DELETE a site
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;

    // Delete in correct order due to foreign keys
    await sql`DELETE FROM orders WHERE site_id = ${siteId}`;
    await sql`DELETE FROM products WHERE site_id = ${siteId}`;
    await sql`DELETE FROM customers WHERE site_id = ${siteId}`;
    
    const deleted = await sql`
      DELETE FROM ecommerce_sites WHERE id = ${siteId}
      RETURNING id
    `;

    if (!deleted || deleted.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Site deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 });
  }
}