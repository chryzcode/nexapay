import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { ObjectId } from "mongodb";
import db from '@/lib/db';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

// Fetch user info by id, username, or userCode
async function getUserInfo(db: any, identifier: string, identifierType: string) {
  let query = {};
  if (identifierType === 'userId') {
    query = { _id: new ObjectId(identifier) };
  } else if (identifierType === 'username') {
    query = { username: identifier };
  } else if (identifierType === 'userCode') {
    query = { userCode: identifier };
  } else {
    return null;
  }
  const user = await db.collection('users').findOne(query);
  if (!user) return null;
  return {
    id: user._id.toString(),
    username: user.username,
    userCode: user.userCode,
    fullname: user.fullname,
    email: user.email,
  };
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
    const { recipient, identifierType, amount, note } = await request.json();
    if (!recipient || !identifierType || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    const client = await db;
    const requests = client.db().collection('requests');
    const now = new Date();
    const reqDoc = {
      senderId: userId,
      recipientIdentifier: recipient,
      identifierType,
      amount,
      note: note || '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    await requests.insertOne(reqDoc);
    return NextResponse.json({ message: 'Request sent successfully' });
  } catch (error) {
    console.error('Request money error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
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
    // Find requests where the user is sender or recipient
    const reqs = await requests.find({
      $or: [
        { senderId: userId },
        { recipientIdentifier: userId },
      ],
    }).sort({ createdAt: -1 }).toArray();
    // Attach sender/recipient info for clarity
    const usersColl = client.db().collection('users');
    const userIds = Array.from(new Set([
      ...reqs.map(r => r.senderId),
      ...reqs.map(r => r.recipientIdentifier)
    ]));
    const users = await usersColl.find({ $or: [
      { _id: { $in: userIds.filter(id => id.match(/^[a-f\d]{24}$/i)).map(id => new ObjectId(id)) } },
      { userCode: { $in: userIds.filter(id => /^\d{6}$/.test(id)) } },
      { username: { $in: userIds.filter(id => typeof id === 'string' && !/^\d{6}$/.test(id) && !id.match(/^[a-f\d]{24}$/i)) } }
    ] }).toArray();
    const userMap: Record<string, any> = {};
    users.forEach(u => {
      userMap[u._id?.toString()] = u;
      userMap[u.userCode] = u;
      userMap[u.username] = u;
    });
    const requestsWithNames = reqs.map(r => ({
      ...r,
      sender: userMap[r.senderId] ? {
        username: userMap[r.senderId].username,
        userCode: userMap[r.senderId].userCode
      } : { username: r.senderId, userCode: r.senderId },
      recipient: userMap[r.recipientIdentifier] ? {
        username: userMap[r.recipientIdentifier].username,
        userCode: userMap[r.recipientIdentifier].userCode
      } : { username: r.recipientIdentifier, userCode: r.recipientIdentifier }
    }));
    return NextResponse.json({ requests: requestsWithNames });
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
