// src/app/api/ai-diagnose/route.ts (Split 1 of 2)
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";

// Premium architectural fallback mock engine for secure local development
const generateMockAIDiagnosis = (
  projectName: string,
  latency: number,
  crashes: number,
) => {
  return {
    success: true,
    score: crashes > 2 ? 64 : 92,
    diagnosis: `Analysis completed for module [${projectName}]. Detected an elevated average execution time of ${Math.round(latency)}ms accompanied by ${crashes} serverless runtime exceptions. The main architectural bottleneck is located in the data access layer, leading to active connection leaks.`,
    remediationCode: `// Optimized Production Architecture Fix
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    // FIX: Reusing the cached global singleton connection promise 
    // instead of opening a raw new MongoClient instance inside the thread
    const client = await clientPromise;
    const db = client.db("stacktrim");
    
    const logs = await db.collection("metrics")
      .find({})
      .limit(10)
      .toArray();
      
    return Response.json({ success: true, data: logs });
  } catch (error) {
    return Response.json({ success: false }, { status: 500 });
  }
}`,
  };
};
// src/app/api/ai-diagnose/route.ts (Split 2 of 2)

export async function POST(request: NextRequest) {
  try {
    // 1. Parse the project ID from the incoming client query payload
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

    // 2. Fetch the metadata configuration document for the target project
    const projectObjectId = new ObjectId(projectId);
    const project = await db
      .collection("projects")
      .findOne({ _id: projectObjectId });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: "Infrastructure target module not identified.",
        },
        { status: 404 },
      );
    }

    // 3. Execute a database aggregation query to pull time-series metric stats
    const metricsAggregation = await db
      .collection("metrics")
      .aggregate([
        { $match: { projectId: projectObjectId } },
        {
          $group: {
            _id: null,
            avgExecutionTime: { $avg: "$executionTimeMs" },
            errorCount: {
              $sum: { $cond: [{ $eq: ["$isError", true] }, 1, 0] },
            },
          },
        },
      ])
      .toArray();

    const avgLatency = metricsAggregation[0]?.avgExecutionTime || 0;
    const totalCrashes = metricsAggregation[0]?.errorCount || 0;

    // 4. Fallback Architecture: Trigger the sandbox simulation engine
    // (This acts as the secure, free, local token alternative we engineered)
    const mockReport = generateMockAIDiagnosis(
      project.name,
      avgLatency,
      totalCrashes,
    );

    // 5. Transmit the structured architectural repair report back to the UI
    return NextResponse.json(mockReport, { status: 200 });
  } catch (error: any) {
    console.error("AI Audit Pipeline Crash:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal AI Processing Fault",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
