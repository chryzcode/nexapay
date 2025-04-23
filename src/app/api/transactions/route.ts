export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { ObjectId } from "mongodb";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export async function GET() {
  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        );
      }
      const { userId } = decoded as { userId: string };

      const client = await db;
      const transactions = client.db().collection("transactions");

      const userTransactions = await transactions
        .find({
          $or: [
            { senderId: new ObjectId(userId) },
            { recipientId: new ObjectId(userId) },
          ],
        })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({
        transactions: userTransactions.map((transaction) => ({
          id: transaction._id.toString(),
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          createdAt: transaction.createdAt,
          sender: transaction.senderId.toString(),
          recipient: transaction.recipientId.toString(),
        })),
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 401 }
        );
      }
      const { userId } = decoded as { userId: string };

      const { amount, recipientId, type } = await request.json();

      if (!amount || !recipientId || !type) {
        return NextResponse.json(
          { error: "Amount, recipient ID, and type are required" },
          { status: 400 }
        );
      }

      const client = await db;
      const transactions = client.db().collection("transactions");
      const users = client.db().collection("users");

      // Check if recipient exists
      const recipient = await users.findOne({
        _id: new ObjectId(recipientId),
      });

      if (!recipient) {
        return NextResponse.json(
          { error: "Recipient not found" },
          { status: 404 }
        );
      }

      // Create transaction
      const result = await transactions.insertOne({
        amount,
        type,
        status: "pending",
        senderId: new ObjectId(userId),
        recipientId: new ObjectId(recipientId),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return NextResponse.json({
        message: "Transaction created successfully",
        transactionId: result.insertedId.toString(),
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 