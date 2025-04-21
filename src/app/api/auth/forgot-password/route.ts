import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const client = await db;
    const users = client.db().collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        message: "If an account exists with this email, you will receive a password reset link",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
        },
      }
    );

    // Send email with reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    const htmlContent = `
      <p>You requested a password reset for your NexaPay account.</p>
      <p>Click the link below to reset your password. This link will expire in 1 hour:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    // Use sendEmail from lib/email
    const { sendEmail } = await import("@/lib/email");
    await sendEmail(email, "Reset your NexaPay password", htmlContent);

    return NextResponse.json({
      message: "Password reset link sent to your email"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 