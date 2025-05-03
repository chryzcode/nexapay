import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import db from '@/lib/db';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const client = await db;
    const requests = client.db().collection('requests');
    const req = await requests.findOne({ _id: new ObjectId(params.id) });
    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    if (req.recipientIdentifier !== userId) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }
    await requests.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { status: 'rejected', updatedAt: new Date() } }
    );
    // Optionally: notify sender here
    return NextResponse.json({ message: 'Request rejected' });
  } catch (error) {
    console.error('Reject request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
