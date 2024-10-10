"use client";

import { useEffect, useState } from "react";
import { LoadingIcon } from "./icons";

interface JobStatus {
  status: string;
}

type Status =
  | "initializing"
  | "transcribing"
  | "transcribed"
  | "generating"
  | "generated"
  | "pushing"
  | "pushed"
  | "creating"
  | "created"
  | "completed"
  | "failed"
  | "FINISHED"
  | "timeout";

const statusMessages: Record<Status, string> = {
  initializing: "Preparing your video",
  transcribing:
    "🎧 Listening to your video... Is that a cat playing piano? 🐱🎹",
  transcribed: "✅Phew! Finished decoding those mysterious sounds 🕵️‍♂️🔊",
  generating: "Generating Chapters",
  generated: "Content generation complete",
  pushing: "Almost there...",
  pushed: "Almost there...",
  creating: "Creating final output...",
  created: "Final output created",
  completed: "Video processing completed successfully!",
  failed: "An error occurred. Please try again.",
  FINISHED: "Video processing finished successfully!",
  timeout: "Video processing timed out. Please try again.",
};

export function JobStatusListener({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<string>("initializing");

  useEffect(() => {
    const eventSource = new EventSource(`/api/job-status/${jobId}`);

    eventSource.onmessage = (event) => {
      const data: JobStatus = JSON.parse(event.data);
      setStatus(data.status);

      if (
        data.status === "FINISHED" ||
        data.status === "timeout" ||
        data.status === "completed"
      ) {
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [jobId]);

  const message = statusMessages[status as Status] || "Processing...";

  return (
    <div className="flex flex-row gap-2 items-center">
      <div className="animate-spin dark:text-neutral-400 text-neutral-500">
        <LoadingIcon />
      </div>
      <div className="text-neutral-500 dark:text-neutral-400 text-md">
        {message}
      </div>
    </div>
  );
}
