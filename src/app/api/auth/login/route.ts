// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "../../../../lib/mongodb";
import { IUser } from "../../../../types/user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Basic validation check
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required fields." },
        { status: 400 },
      );
    }

    // 2. Connect to the database
    const client = await clientPromise;
    const db = client.db("stacktrim");

    // 3. Normalize email input to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // 4. Find the user inside our encrypted user directory
    const user = await db
      .collection<IUser>("users")
      .findOne({ email: normalizedEmail });

    // 5. Security Guard: If user doesn't exist, return a generic error message.
    // Avoid saying "User not found" because it tips off hackers that an email doesn't exist!
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password combination." },
        { status: 401 },
      );
    }

    // 6. Cryptographic Comparison: Re-hash the incoming password and compare it to the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password combination." },
        { status: 401 },
      );
    }

    // 7. Successful Handshake Match!
    return NextResponse.json(
      {
        success: true,
        message: "Authentication successful!",
        user: {
          id: user._id,
          email: user.email,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Login Pipeline Fault:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Authentication Layer Crash",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
