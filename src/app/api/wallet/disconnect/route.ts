import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import db from '@/lib/db';
import { ObjectId } from 'mongodb';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { userId } = decoded as { userId: string };
    const { userId: requestUserId } = await request.json();

    // Verify that the user is disconnecting their own wallet
    if (userId !== requestUserId) {
      return NextResponse.json({ error: 'Unauthorized to disconnect this wallet' }, { status: 403 });
    }

    const client = await db;
    const users = client.db().collection('users');

    // Remove the wallet address from the user document
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $unset: { 
          walletAddress: "",
          walletBalance: ""
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Wallet disconnected successfully'
    });
  } catch (error) {
    console.error('Disconnect wallet error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 