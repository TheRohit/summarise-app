"use client";

import { ProcessResponse } from "@/actions/transcribe/transcribe.types";
import Loading from "@/app/[locale]/(dashboard)/summary/[id]/loading";
import { useSuspenseQuery } from "@tanstack/react-query";
import ChatWindow from "./ChatWindow";
import InitialContent from "./InitialContent";

const hostName =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.VERCEL_URL;

export default function SummaryContent({
  id,
  jobId,
}: {
  id: string;
  jobId?: string;
}) {
  const { data: summary } = useSuspenseQuery<ProcessResponse>({
    queryKey: ["summary", id],
    queryFn: async () => {
      const params = new URLSearchParams({
        jobId: jobId ?? "cached",
        videoId: id,
      });

      const run = await fetch(`${hostName}/api/process?${params.toString()}`, {
        method: "GET",
      });
      return run.json();
    },
    refetchInterval: (query) =>
      query.state.data?.status !== "COMPLETED" ? 2000 : false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchIntervalInBackground: true,
  });

  if (summary.status !== "COMPLETED") {
    return <Loading />;
  }
  return (
    <div className="flex h-full w-full justify-between gap-2">
      <ChatWindow videoId={id} />
      <InitialContent
        chapters={summary.output.chapters}
        videoInfo={summary.output.videoDetails}
      />
    </div>
  );
}
