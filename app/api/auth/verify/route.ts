// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  console.log('🔵 POST /api/auth/verify');
  
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // Verify user still exists in database
    const users = await sql`
      SELECT id, email, created_at 
      FROM users 
      WHERE id = ${userId}::uuid 
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      return NextResponse.json({ valid: false });
    }

    const user = users[0];

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });

  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}