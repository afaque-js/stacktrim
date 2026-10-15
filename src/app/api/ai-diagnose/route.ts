// src/app/api/ai-diagnose/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { groq } from "@ai-sdk/groq";
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

    // 1. Fetch our target application metadata entry document from MongoDB
    const client = await clientPromise;
    const db = client.db("stacktrim");
    const projectObjectId = new ObjectId(projectId);

    const project = await db
      .collection("projects")
      .findOne({ _id: projectObjectId });
    if (!project) {
      return NextResponse.json(
        { success: false, message: "Target workspace node not found." },
        { status: 404 },
      );
    }

    // Default monitoring metric assumptions
    let actualLatencyMs = 0;
    let externalPayloadSizeText = "0 bytes";
    let isApiDown = false;
    let apiHttpStatusCode = 200;

    // 2. LIVE AUDIT GATEWAY LINK FETCH LAYER
    if (project.apiEndpoint) {
      try {
        const startTime = Date.now();

        // Execute a real network handshake query directly over the live internet lines
        const externalResponse = await fetch(project.apiEndpoint, {
          method: "GET",
          cache: "no-store",
        });

        actualLatencyMs = Date.now() - startTime;
        apiHttpStatusCode = externalResponse.status;

        if (!externalResponse.ok) {
          isApiDown = true;
        }

        // Measure raw response size text length
        const rawTextData = await externalResponse.text();
        externalPayloadSizeText = `${new Blob([rawTextData]).size} bytes`;
      } catch (fetchError: any) {
        console.error("External Target Ingestion Link Failure:", fetchError);
        isApiDown = true;
        actualLatencyMs = 1500; // Simulate timeout delay parameters if the connection drops
      }
    }

    // 3. Clean countDocuments query (Completely removes array symbols and backslash issues)
    const historicalCrashes = await db.collection("metrics").countDocuments({
      projectId: projectObjectId,
      isError: true,
    });

    // 4. Construct a clean prompt context string by appending arrays to avoid backtick glitches
    const aiPrompt = [
      "You are the core engineering module of StackTrim, an AI cloud cost auditor.",
      "Analyze these REAL-TIME operational audit metrics gathered live from the external target gateway connection:",
      "- Target Name: " + project.name,
      "- Connected Ingestion API link: " + project.apiEndpoint,
      "- Live Request Latency Response Time: " + actualLatencyMs + "ms",
      "- Live API HTTP Status Code response: " + apiHttpStatusCode,
      "- External Network Data Payload Size: " + externalPayloadSizeText,
      "- Database Historical Anomaly Log Detections: " +
        historicalCrashes +
        " exceptions",
      "- Is Endpoint Down: " + isApiDown.toString(),
      "",
      "Respond STRICTLY in a clean, valid JSON format matching this object shape exactly:",
      "{",
      '  "score": number (Infrastructure health score from 0 to 100),',
      '  "diagnosis": "string (A concise engineering summary in simple terms explaining how this real latency and payload size affects cloud billing costs)",',
      '  "remediationCode": "string (Provide a clean code fix snippet solving network speeds or payload caching parameters)"',
      "}",
      "Do not include any normal chat text, introductions or markdown code fence wrappers outside of the raw JSON object.",
    ].join("\n");

    // 5. Fire the payload up to Groq's high-speed inference cloud models
    const { text } = await generateText({
      model: groq("openai/gpt-oss-20b"),
      prompt: aiPrompt,
    });

    // 6. Safeguard parser cleanup
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
        score: structuredReport.score || 85,
        diagnosis:
          structuredReport.diagnosis || "Audit completed successfully.",
        remediationCode:
          structuredReport.remediationCode || "// Core settings optimal.",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Live AI Network Pipeline Crash:", error);
    return NextResponse.json(
      {
        success: false,
        message: "AI Ingestion Processing Fault",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
