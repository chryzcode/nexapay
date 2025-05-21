import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { ObjectId } from "mongodb";
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
    const { txHash, amount } = await request.json();

    if (!txHash || !amount) {
      return NextResponse.json({ error: 'Transaction hash and amount are required' }, { status: 400 });
    }

    const client = await db;
    const requests = client.db().collection('requests');

    // Find the request and verify the recipient
    const requestDoc = await requests.findOne({ _id: new ObjectId(params.id) });
    if (!requestDoc) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Get user info to handle different identifier types
    const user = await client.db().collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the user is authorized to approve this request
    const isAuthorized = 
      requestDoc.recipientIdentifier === userId ||
      requestDoc.recipientIdentifier === user.username ||
      requestDoc.recipientIdentifier === user.userCode;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized to approve this request' }, { status: 403 });
    }

    if (requestDoc.status !== 'pending') {
      return NextResponse.json({ error: 'Request is not pending' }, { status: 400 });
    }

    // Update the request status
    await requests.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: 'approved',
          txHash,
          paidAmount: amount,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ message: 'Request approved successfully' });
  } catch (error) {
    console.error('Approve request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 