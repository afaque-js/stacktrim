// src/app/api/test-db/route.ts
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    // 1. Await the singleton MongoDB client connection
    const client = await clientPromise;

    // 2. Select the specific database we defined in our connection string
    const db = client.db("stacktrim");

    // 3. Run a low-level administrative command to ping the deployment
    const adminDb = db.admin();
    const serverStatus = await adminDb.serverStatus();

    // 4. Return a successful JSON response with connection metrics
    return NextResponse.json({
      success: true,
      message: "Successfully connected to MongoDB Atlas!",
      databaseName: db.databaseName,
      mongodbVersion: serverStatus.version,
      activeConnections: serverStatus.connections.current,
    });
  } catch (error: unknown) {
    console.error("Database connection error:", error);

    // 5. Return a structured error response if the connection fails
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to the database.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
