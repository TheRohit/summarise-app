"use client";

import { getSummary } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { SequenceFlowOutput } from "../../../../../packages/jobs/trigger/sequence";
import InitialContent from "./InitialContent";
import { SummaryLoading } from "./summary.loading";

export default function SummaryContent({ id }: { id: string }) {
  const {
    data: summary,
    isPending,
    error,
  } = useQuery<SequenceFlowOutput>({
    queryKey: ["summary", id],
    queryFn: () => getSummary(id),
  });

  if (isPending) return <SummaryLoading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex h-full w-full justify-between gap-2">
      {/* <ChatWindow videoId={id} /> */}
      <InitialContent
        chapters={summary?.chapters}
        videoInfo={summary?.videoDetails}
      />
    </div>
  );
}
