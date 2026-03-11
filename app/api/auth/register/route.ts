// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  console.log('🔵 POST /api/auth/register');
  
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - PostgreSQL will generate a proper UUID automatically
    // because the id column has DEFAULT gen_random_uuid()
    const newUser = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email}, ${hashedPassword})
      RETURNING id, email, created_at
    `;

    console.log('✅ User created with UUID:', newUser[0].id);

    // Assign free plan
    await sql`
      INSERT INTO user_plans (user_id, plan_id)
      VALUES (
        ${newUser[0].id}, 
        (SELECT id FROM plans WHERE name = 'free' LIMIT 1)
      )
    `;

    return NextResponse.json({
      success: true,
      user: {
        id: newUser[0].id,      // This is a proper UUID from PostgreSQL
        email: newUser[0].email,
        created_at: newUser[0].created_at
      }
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}