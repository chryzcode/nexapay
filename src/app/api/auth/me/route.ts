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
      return NextResponse.json({ user: null });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
        email: string;
      };

      const client = await db;
      const users = client.db().collection("users");
      
      const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
      if (!user) {
        return NextResponse.json({ user: null });
      }

      return NextResponse.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
          userCode: user.userCode,
          fullname: user.fullname,
        },
      });
    } catch (error) {
      // Invalid token
      return NextResponse.json({ user: null });
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 