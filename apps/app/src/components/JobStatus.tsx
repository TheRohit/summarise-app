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

export function JobStatusListener({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<Status>("initializing");

  useEffect(() => {
    const eventSource = new EventSource(`/api/job-status/${jobId}`);

    eventSource.onmessage = (event) => {
      const data: JobStatus = JSON.parse(event.data);
      setStatus(data.status as Status);
      console.log("Received status update:", data.status);

      if (data.status === "FINISHED" || data.status === "timeout") {
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

  return (
    <div className="flex flex-row gap-2 items-center">
      <div className="animate-spin dark:text-neutral-400 text-neutral-500">
        <LoadingIcon />
      </div>
      <div className="text-neutral-500 dark:text-neutral-400 text-md ">
        {status}
      </div>
    </div>
  );
}
