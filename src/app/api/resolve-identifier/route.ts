import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/lib/db';

export async function POST(request: NextRequest) {
  const { type, value } = await request.json();
  let address: string | null = null;

  const client = await dbPromise;
  const db = client.db(); // optionally: client.db('your_db_name')

  if (type === 'address') {
    address = value;
  } else if (type === 'username') {
    const user = await db.collection('users').findOne({ username: value });
    address = user?.walletAddress || null;
  } else if (type === 'userId') {
    const user = await db.collection('users').findOne({ userId: value });
    address = user?.walletAddress || null;
  } else {
    return NextResponse.json({ error: 'Invalid identifier type' }, { status: 400 });
  }

  if (!address) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ address });
}
