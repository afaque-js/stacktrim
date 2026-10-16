// src/app/api/init-db/route.ts
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("stacktrim");

    // Enforce a strict unique identifier constraint on the users email field
    await db
      .collection("users")
      .createIndex(
        { email: 1 },
        { unique: true, name: "user_email_unique_index" },
      );

    return NextResponse.json({
      success: true,
      message: "Database unique user indexes provisioned successfully!",
    });
  } catch (error: unknown) {
    console.error("Database initialization crash:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize index.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
