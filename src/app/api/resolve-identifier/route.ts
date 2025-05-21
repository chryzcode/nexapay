import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/lib/db';

export async function POST(request: NextRequest) {
  const { type, value } = await request.json();
  let address: string | null = null;
  let userId: string | null = null;
  let fullname: string | null = null;
  let username: string | null = null;

  const client = await dbPromise;
  const db = client.db(); // optionally: client.db('your_db_name')

  if (type === 'address') {
    const user = await db.collection('users').findOne({ walletAddress: value });
    if (user) {
      address = user.walletAddress;
      userId = user._id.toString();
      fullname = user.fullname || null;
      username = user.username || null;
    }
  } else if (type === 'username') {
    const user = await db.collection('users').findOne({ username: value });
    if (user) {
      address = user.walletAddress;
      userId = user._id.toString();
      fullname = user.fullname || null;
      username = user.username || null;
    }
  } else if (type === 'userId') {
    const user = await db.collection('users').findOne({ _id: value });
    if (user) {
      address = user.walletAddress;
      userId = user._id.toString();
      fullname = user.fullname || null;
      username = user.username || null;
    }
  } else if (type === 'userCode') {
    const user = await db.collection('users').findOne({ userCode: value });
    if (user) {
      address = user.walletAddress;
      userId = user._id.toString();
      fullname = user.fullname || null;
      username = user.username || null;
    }
  } else {
    return NextResponse.json({ error: 'Invalid identifier type' }, { status: 400 });
  }

  if (!address) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ address, userId, fullname, username });
}
