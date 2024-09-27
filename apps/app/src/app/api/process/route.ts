import { runs } from "@trigger.dev/sdk/v3";
import { client as redis } from "@v1/kv/client";
import { NextRequest, NextResponse } from "next/server";
import { SequenceFlowOutput } from "../../../../../../packages/jobs/trigger/sequence";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get("jobId");
  const videoId = searchParams.get("videoId");

  try {
    if (!jobId || !videoId) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const cachedData = await redis.get<SequenceFlowOutput>(videoId);
    if (cachedData) {
      console.log("--- CACHED ---");
      return NextResponse.json({
        output: cachedData,
        status: "COMPLETED",
      });
    }

    if (jobId === "unknown" && !cachedData) {
      return NextResponse.json({
        output: null,
        status: "NOT_FOUND",
      });
    }

    const run = await runs.retrieve(jobId);
    console.log("--- NOT CACHED ---");
    return NextResponse.json({
      output: run.output as SequenceFlowOutput,
      status: run.status,
    });
  } catch (error) {
    console.error("Error retrieving run:", error);
    return NextResponse.json(
      { error: "Failed to retrieve run data" },
      { status: 500 },
    );
  }
}
