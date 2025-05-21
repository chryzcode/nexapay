import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await dbPromise;
    const db = client.db();
    
    // Convert userId to ObjectId if it's a valid MongoDB ID
    let query = { _id: new ObjectId(userId) };
    const user = await db.collection('users').findOne(query);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.walletAddress) {
      return NextResponse.json({ error: 'User has not connected their wallet' }, { status: 400 });
    }

    return NextResponse.json({ 
      walletAddress: user.walletAddress,
      username: user.username,
      userCode: user.userCode
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, walletAddress } = await request.json();

    if (!userId || !walletAddress) {
      return NextResponse.json({ error: 'User ID and wallet address are required' }, { status: 400 });
    }

    const client = await dbPromise;
    const db = client.db();

    console.log('Updating wallet for user:', userId, 'with address:', walletAddress);

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { walletAddress } }
    );

    console.log('Update result:', result);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving wallet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const client = await dbPromise;
    const db = client.db();

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $unset: { walletAddress: "" } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 