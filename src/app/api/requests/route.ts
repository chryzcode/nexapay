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
    const requestData = await request.json();
    console.log('Raw request data:', requestData);

    const { amount, recipient, identifierType, note } = requestData;

    console.log('Parsed request data:', { amount, recipient, identifierType, note });

    // Validate the request data
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Please enter a valid amount' }, { status: 400 });
    }

    if (!recipient) {
      console.log('Recipient is missing');
      return NextResponse.json({ error: 'Recipient is required' }, { status: 400 });
    }

    const client = await db;
    const requests = client.db().collection('requests');

    // Check if recipient exists by ID
    const recipientUser = await client.db().collection('users').findOne({
      _id: new ObjectId(recipient)
    });

    console.log('Found recipient:', recipientUser);

    if (!recipientUser) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Check if trying to send to self
    if (recipientUser._id.toString() === userId) {
      return NextResponse.json({ error: 'Cannot send request to yourself' }, { status: 400 });
    }

    const newRequest = {
      amount: Number(amount),
      note: note?.trim() || '',
      status: 'pending',
      senderId: userId,
      recipientIdentifier: recipientUser.username,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating new request:', newRequest);

    await requests.insertOne(newRequest);
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
    
    // Get user info to handle different identifier types
    const user = await client.db().collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find requests where the user is sender or recipient
    const reqs = await requests.find({
      $or: [
        { senderId: userId },
        { recipientIdentifier: userId },
        { recipientIdentifier: user.username },
        { recipientIdentifier: user.userCode }
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

    const requestsWithNames = reqs.map(r => {
      const sender = userMap[r.senderId];
      const recipient = userMap[r.recipientIdentifier];
      
      return {
        ...r,
        sender: sender ? {
          username: sender.username,
          userCode: sender.userCode,
          id: sender._id.toString()
        } : { username: r.senderId, userCode: r.senderId, id: r.senderId },
        recipient: recipient ? {
          username: recipient.username,
          userCode: recipient.userCode,
          id: recipient._id.toString()
        } : { username: r.recipientIdentifier, userCode: r.recipientIdentifier, id: r.recipientIdentifier }
      };
    });

    return NextResponse.json({ requests: requestsWithNames });
  } catch (error) {
    console.error('Get requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
