export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { fullname, email, password, username } = await request.json();

    // Validate input
    if (!fullname || !email || !password || !username) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const client = await db;
    const users = client.db().collection("users");

    // Generate unique 6-digit user code
    let userCode: string;
    do {
      userCode = Math.floor(100000 + Math.random() * 900000).toString();
    } while (await users.findOne({ userCode }));

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token & expiry (24h)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user
    const result = await users.insertOne({
      fullname,
      email,
      password: hashedPassword,
      username,
      userCode,
      verificationToken,
      verificationTokenExpiry,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Respond with a simple message to check email for verification link
    return NextResponse.json({
      message: "Registration successful. Please check your email for the verification link."
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}