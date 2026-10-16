// src/app/api/seed-metrics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import { IMetric } from "../../../types/metric";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Missing required parameter: projectId" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("stacktrim");

    // Verify the project exists in our database before generating metrics
    const projectObjectId = new ObjectId(projectId);
    const projectExists = await db
      .collection("projects")
      .findOne({ _id: projectObjectId });

    if (!projectExists) {
      return NextResponse.json(
        { success: false, message: "Target infrastructure module not found." },
        { status: 404 },
      );
    }

    const mockMetrics: IMetric[] = [];
    const targetRoutes = [
      "/api/checkout",
      "/api/user/login",
      "/api/products/list",
      "/api/analytics/track",
    ];

    // Generate 50 realistic historical logs spanning across the last 24 hours
    for (let i = 0; i < 50; i++) {
      const selectedRoute =
        targetRoutes[Math.floor(Math.random() * targetRoutes.length)];

      // Intentionally introduce an occasional massive performance bottleneck spike
      const isSpike = Math.random() > 0.85;
      const executionTime = isSpike
        ? Math.floor(Math.random() * 3500) + 1500 // Inefficient spike: 1.5s to 5s
        : Math.floor(Math.random() * 250) + 40; // Standard optimization: 40ms to 290ms

      const memoryUsed = isSpike ? 512 : 128;

      // Calculate serverless cost simulation matrix (GB-Seconds estimation)
      const computeCost =
        (executionTime / 1000) * (memoryUsed / 1024) * 0.00001667;

      const isError = Math.random() > 0.92; // 8% failure rate simulation

      const mockMetricDoc: IMetric[] = [
        {
          projectId: projectObjectId,
          routePath: selectedRoute,
          executionTimeMs: executionTime,
          memoryUsedMb: memoryUsed,
          computeCostUSD: parseFloat(computeCost.toFixed(6)),
          isError: isError,
          errorMessage: isError
            ? "TIMEOUT_LIMIT_EXCEEDED: Lambda execution terminated prematurely."
            : undefined,
          timestamp: new Date(Date.now() - i * 30 * 60 * 1000), // Increments backward by 30 mins
        },
      ];

      mockMetrics.push(mockMetricDoc[0]);
    }

    // High-speed write operation to our primary database metrics cluster
    const result = await db
      .collection<IMetric>("metrics")
      .insertMany(mockMetrics);

    return NextResponse.json(
      {
        success: true,
        message: `Successfully seeded ${result.insertedCount} infrastructure performance metrics!`,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Seeding Engine Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Seeding Layer Crash",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
