export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export async function POST() {
  try {
    const token = cookies().get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    try {
      // Verify the existing token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; email: string };
      
      // Get user from database to ensure they still exist
      const client = await db;
      const user = await client.db().collection("users").findOne({ _id: decoded.userId });
      
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 401 }
        );
      }

      // Generate new token
      const newToken = jwt.sign(
        { userId: user._id.toString(), email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      // Set new token in cookies
      cookies().set("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      // If token verification fails, clear the cookie
      cookies().delete("token");
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 