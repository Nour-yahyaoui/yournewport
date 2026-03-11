// app/api/sites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  console.log('🔵 POST /api/sites - Create site');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const {
      name,
      slug,
      description,
      phone,
      email,
      address,
      currency,
      instagram,
      facebook,
      twitter,
      website,
      founded_at,
      logo_url,
      userId
    } = body;

    // Validate required fields
    if (!name || !slug || !userId) {
      return NextResponse.json(
        { error: 'Name, slug, and userId are required' },
        { status: 400 }
      );
    }

    // Check if userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format. Must be a valid UUID.' },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existing = await sql`
      SELECT id FROM ecommerce_sites WHERE slug = ${slug} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'This store URL is already taken' },
        { status: 400 }
      );
    }

    // Check if user already has a site (one site per user)
    const userSite = await sql`
      SELECT id FROM ecommerce_sites WHERE user_id = ${userId}::uuid LIMIT 1
    `;

    if (userSite && userSite.length > 0) {
      return NextResponse.json(
        { error: 'You already have a store. Each user can only have one store.' },
        { status: 400 }
      );
    }

    // Create the site
    const newSite = await sql`
      INSERT INTO ecommerce_sites (
        user_id, name, slug, description, phone, email, 
        address, currency, instagram, facebook, twitter, 
        website, founded_at, logo_url
      ) VALUES (
        ${userId}::uuid, ${name}, ${slug}, ${description || null}, ${phone || null}, 
        ${email || null}, ${address || null}, ${currency || 'USD'}, 
        ${instagram || null}, ${facebook || null}, ${twitter || null}, 
        ${website || null}, ${founded_at || null}, ${logo_url || null}
      )
      RETURNING id, name, slug, logo_url, description, phone, email, address, currency, created_at
    `;

    console.log('✅ Site created:', newSite[0]);

    return NextResponse.json({
      success: true,
      site: newSite[0]
    });

  } catch (error) {
    console.error('❌ Error creating site:', error);
    return NextResponse.json(
      { error: 'Failed to create site', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}