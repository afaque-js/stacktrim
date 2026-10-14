// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { IProject } from "@/types/project";

// This handler listens for incoming POST requests to save a new cloud application
export async function POST(request: NextRequest) {
  try {
    // 1. Ingest and parse the incoming JSON payload from the user
    const body = await request.json();

    // 2. Extract and validate parameters based on our low-level schema needs
    const { name, cloudProvider } = body;

    if (!name || !cloudProvider) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: name or cloudProvider",
        },
        { status: 400 },
      );
    }

    // 3. Construct a clean data object matching our IProject interface
    const newProject: IProject = {
      name: name.trim(),
      cloudProvider: cloudProvider,
      status: "active",
      createdAt: new Date(),
    };

    // 4. Connect to MongoDB and fetch the active client singleton
    const client = await clientPromise;
    const db = client.db("stacktrim");

    // 5. Insert the document directly into a collection named "projects"
    const result = await db
      .collection<IProject>("projects")
      .insertOne(newProject);

    // 6. Return a successful response along with the newly generated MongoDB ID
    return NextResponse.json(
      {
        success: true,
        message: "Project registered successfully!",
        projectId: result.insertedId,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("API Project Creation Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
// Add this at the bottom of src/app/api/projects/route.ts

// This handler listens for incoming GET requests to fetch all registered projects
export async function GET() {
  try {
    // 1. Connect to MongoDB and fetch the active client singleton
    const client = await clientPromise;
    const db = client.db("stacktrim");

    // 2. Query the "projects" collection, find all documents, and convert them to an array
    const projects = await db
      .collection<IProject>("projects")
      .find({})
      .sort({ createdAt: -1 }) // Sort by newest created first
      .toArray();

    // 3. Return the array of documents to the client
    return NextResponse.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    console.error("API Project Fetch Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
