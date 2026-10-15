// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { IProject } from "@/types/project";

// This handler listens for incoming POST requests to save a new cloud application
// Update the POST handler function inside src/app/api/projects/route.ts

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. FIXED: Extract the fresh apiEndpoint variable from the network payload
    const { name, cloudProvider, apiEndpoint } = body;

    if (!name || !cloudProvider || !apiEndpoint) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: name, cloudProvider, or apiEndpoint",
        },
        { status: 400 },
      );
    }

    // 2. Map fields to match our updated structural schema contract definitions
    const newProject = {
      name: name.trim(),
      cloudProvider: cloudProvider,
      apiEndpoint: apiEndpoint.trim().toLowerCase(), // Locked into lowercase for clean queries
      status: "active",
      createdAt: new Date(),
    };

    const client = await clientPromise;
    const db = client.db("stacktrim");
    const result = await db.collection("projects").insertOne(newProject);

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
// Replace the GET function at the bottom of src/app/api/projects/route.ts

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("stacktrim");

    // Advanced High-Level System Aggregation Pipeline
    const projectsWithMetrics = await db
      .collection("projects")
      .aggregate([
        {
          // 1. Perform a relational Left Outer Join to link the metrics collection
          $lookup: {
            from: "metrics",
            localField: "_id",
            foreignField: "projectId",
            as: "performanceLogs",
          },
        },
        {
          // 2. Compute mathematical summaries across all time-series documents per project
          $addFields: {
            totalComputeCost: { $sum: "$performanceLogs.computeCostUSD" },
            avgExecutionTime: { $avg: "$performanceLogs.executionTimeMs" },
            errorCount: {
              $size: {
                $filter: {
                  input: "$performanceLogs",
                  as: "log",
                  cond: { $eq: ["$$log.isError", true] },
                },
              },
            },
          },
        },
        {
          // 3. Remove the massive raw log arrays to keep the network payload light
          $project: {
            performanceLogs: 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      count: projectsWithMetrics.length,
      data: projectsWithMetrics,
    });
  } catch (error: any) {
    console.error("Aggregation Pipeline Error:", error);
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
