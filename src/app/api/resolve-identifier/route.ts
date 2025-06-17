import { NextRequest, NextResponse } from 'next/server';
import dbPromise from '@/lib/db';

export async function POST(request: NextRequest) {
  const { type, value } = await request.json();
  let address: string | null = null;
  let userId: string | null = null;
  let fullname: string | null = null;
  let username: string | null = null;
  let networkHint: number | null = null;

  const client = await dbPromise;
  const db = client.db(); // optionally: client.db('your_db_name')

  if (type === 'address') {
    // For direct wallet address, return the address as-is if it looks like a valid Ethereum address
    if (value && typeof value === 'string' && value.startsWith('0x') && value.length === 42) {
      address = value;
      // Try to find a user with this wallet address for additional metadata
      const user = await db.collection('users').findOne({ walletAddress: { $regex: new RegExp(`^${value}$`, 'i') } });
      if (user) {
        userId = user.userCode;
        fullname = user.fullname || null;
        username = user.username || null;
        networkHint = user.networkHint || 11155111; // Default to Sepolia testnet
      }
    }
  } else if (type === 'username') {
    const user = await db.collection('users').findOne({ username: value });
    if (user) {
      address = user.walletAddress;
      userId = user.userCode;
      fullname = user.fullname || null;
      username = user.username || null;
      networkHint = user.networkHint || 11155111; // Default to Sepolia testnet
    }
  } else if (type === 'userCode') {
    const user = await db.collection('users').findOne({ userCode: value });
    if (user) {
      address = user.walletAddress;
      userId = user.userCode;
      fullname = user.fullname || null;
      username = user.username || null;
      networkHint = user.networkHint || 11155111; // Default to Sepolia testnet
    }
  } else if (type === 'email') {
    const user = await db.collection('users').findOne({ email: value });
    if (user) {
      address = user.walletAddress;
      userId = user.userCode;
      fullname = user.fullname || null;
      username = user.username || null;
      networkHint = user.networkHint || 11155111; // Default to Sepolia testnet
    }
  } else {
    return NextResponse.json({ error: 'Invalid identifier type' }, { status: 400 });
  }

  if (!address) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ 
    address, 
    userId, 
    fullname, 
    username,
    metadata: {
      networkHint
    }
  });
}
