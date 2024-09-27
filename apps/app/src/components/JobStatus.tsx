"use client";

import { useEffect, useState } from "react";

interface JobStatus {
  status: string;
}

export function JobStatusListener({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<string>("Initializing...");

  useEffect(() => {
    const eventSource = new EventSource(`/api/job-status/${jobId}`);

    eventSource.onmessage = (event) => {
      const data: JobStatus = JSON.parse(event.data);
      setStatus(data.status);
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
    <div>
      <h2>Job Status</h2>
      <p>{status}</p>
    </div>
  );
}
