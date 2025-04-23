import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { fullname, username, password } = await request.json();
    if (!fullname || !username) {
      return NextResponse.json({ error: "Full name and username are required" }, { status: 400 });
    }

    const client = await db;
    const users = client.db().collection("users");
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if username is changing and not taken by another user
    if (username !== user.username) {
      const usernameExists = await users.findOne({ username });
      if (usernameExists) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
    }

    // Prepare update fields
    const updateFields: any = {
      fullname,
      username,
      updatedAt: new Date(),
    };
    if (password && password.length > 0) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    await users.updateOne(
      { _id: user._id },
      { $set: updateFields }
    );

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
