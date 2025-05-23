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
            { senderId: userId },
            { recipientId: userId },
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
          sender: transaction.senderId,
          recipient: transaction.recipientId,
          senderWallet: transaction.senderWallet,
          recipientWallet: transaction.recipientWallet,
          currency: transaction.currency || 'ETH',
          network: transaction.network,
          txHash: transaction.txHash
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

      const { amount, recipientId, type, status, txHash, currency, network, senderId, createdAt } = await request.json();

      if (!amount || !recipientId || !type) {
        return NextResponse.json(
          { error: "Amount, recipient ID, and type are required" },
          { status: 400 }
        );
      }

      const client = await db;
      const transactions = client.db().collection("transactions");
      const users = client.db().collection("users");
      let senderWallet = null;
      let recipientWallet = null;
      if (senderId) {
        const senderUser = await users.findOne({ _id: new ObjectId(senderId) });
        senderWallet = senderUser?.walletAddress || null;
      }
      if (recipientId) {
        const recipientUser = await users.findOne({ _id: new ObjectId(recipientId) });
        recipientWallet = recipientUser?.walletAddress || null;
      }

      // If this is a payment (type === 'sent'), create both 'sent' and 'received' records
      if (type === 'sent') {
        // Sent record for sender
        const sentResult = await transactions.insertOne({
          amount,
          type: 'sent',
          status: status || "completed",
          senderId: senderId || userId,
          recipientId,
          senderWallet,
          recipientWallet,
          txHash,
          currency: currency || 'ETH',
          network,
          createdAt: createdAt || new Date(),
          updatedAt: new Date(),
        });
        // Received record for recipient
        const receivedResult = await transactions.insertOne({
          amount,
          type: 'received',
          status: status || "completed",
          senderId: senderId || userId,
          recipientId,
          senderWallet,
          recipientWallet,
          txHash,
          currency: currency || 'ETH',
          network,
          createdAt: createdAt || new Date(),
          updatedAt: new Date(),
        });
        return NextResponse.json({
          message: "Transaction created successfully",
          sentTransactionId: sentResult.insertedId.toString(),
          receivedTransactionId: receivedResult.insertedId.toString(),
        });
      } else if (type === 'received') {
        // For requests, only create a 'received' record for the recipient
        const result = await transactions.insertOne({
          amount,
          type: 'received',
          status: status || "pending",
          senderId: senderId || userId,
          recipientId,
          senderWallet,
          recipientWallet,
          txHash,
          currency: currency || 'ETH',
          network,
          createdAt: createdAt || new Date(),
          updatedAt: new Date(),
        });
        return NextResponse.json({
          message: "Transaction created successfully",
          transactionId: result.insertedId.toString(),
        });
      } else {
        // Fallback: create a single record as before
        const result = await transactions.insertOne({
          amount,
          type,
          status: status || "pending",
          senderId: senderId || userId,
          recipientId,
          senderWallet,
          recipientWallet,
          txHash,
          currency: currency || 'ETH',
          network,
          createdAt: createdAt || new Date(),
          updatedAt: new Date(),
        });
        return NextResponse.json({
          message: "Transaction created successfully",
          transactionId: result.insertedId.toString(),
        });
      }
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