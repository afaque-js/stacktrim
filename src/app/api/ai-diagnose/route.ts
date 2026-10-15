// src/app/api/ai-diagnose/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { groq } from "@ai-sdk/groq"; // Natively targeted Groq provider import
import { generateText } from "ai";
import clientPromise from "../../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: "Missing projectId" },
        { status: 400 },
      );
    }

    // 1. Gather stats data from MongoDB metrics tables
    const client = await clientPromise;
    const db = client.db("stacktrim");
    const projectObjectId = new ObjectId(projectId);

    const project = await db
      .collection("projects")
      .findOne({ _id: projectObjectId });
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Target module not found." },
        { status: 404 },
      );
    }

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

    const stats = metricsAggregation[0] || {
      avgExecutionTime: 0,
      errorCount: 0,
    };
    const avgLatency = stats.avgExecutionTime || 0;
    const totalCrashes = stats.errorCount || 0;

    // 2. Build our clean prompt instruction set
    const aiPrompt = [
      "You are the core engineering module of StackTrim, an AI cloud cost auditor.",
      "Analyze these live performance log stats for the application named [" +
        project.name +
        "]:",
      "- Cloud Host Provider: " + project.cloudProvider,
      "- Average Execution Latency: " + Math.round(avgLatency) + "ms",
      "- Total Serverless Runtime Crashes: " + totalCrashes,
      "",
      "Respond STRICTLY in a clean, valid JSON format matching this object shape exactly:",
      "{",
      '  "score": number,',
      '  "diagnosis": "string",',
      '  "remediationCode": "string"',
      "}",
      "Do not include any conversational greeting or trailing chat text. Output only raw JSON.",
    ].join("\n");

    // 3. Launch native network call to Groq's high-speed Llama 3 model
    const { text } = await generateText({
      model: groq("openai/gpt-oss-20b"), // Using native groq function selector
      prompt: aiPrompt,
    });

    // 4. Extract raw JSON block boundaries
    let cleanText = text.trim();
    const firstBrace = cleanText.indexOf("{");
    const lastBrace = cleanText.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    const structuredReport = JSON.parse(cleanText);

    return NextResponse.json(
      {
        success: true,
        score: structuredReport.score || 80,
        diagnosis: structuredReport.diagnosis || "Audit completed.",
        remediationCode:
          structuredReport.remediationCode || "// System optimal.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Live AI Network Pipeline Crash:", error);
    return NextResponse.json(
      { success: false, message: "AI Processing Fault", error: error.message },
      { status: 500 },
    );
  }
}
