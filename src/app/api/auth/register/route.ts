// src/app/api/auth/register/route.ts
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

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long.",
        },
        { status: 400 },
      );
    }

    // 2. Connect to the database
    const client = await clientPromise;
    const db = client.db("stacktrim");

    // 3. Normalize email to lowercase to prevent duplicates (e.g. User@App.com vs user@app.com)
    const normalizedEmail = email.toLowerCase().trim();

    // 4. Check if the user already exists before doing heavy hashing math
    const existingUser = await db
      .collection<IUser>("users")
      .findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email address already exists.",
        },
        { status: 400 },
      );
    }

    // 5. SECURE STEP: Hash the password using BCrypt with a salt round of 10
    // This turns a plain password like "MySecret123" into a scrambled string like "$2a$10$X..."
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Construct the new user document matching our IUser interface contract
    const newUser: IUser = {
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
    };

    // 7. Insert the user into the database
    const result = await db.collection<IUser>("users").insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        message: "User account registered securely!",
        userId: result.insertedId,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Registration Pipeline Crash:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
