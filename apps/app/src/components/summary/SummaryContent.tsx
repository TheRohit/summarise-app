"use client";

import { transcribe } from "@/actions/transcribe/transcribe-action";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { SequenceFlowOutput } from "../../../../../packages/jobs/trigger/sequence";

import Loading from "@/app/[locale]/(dashboard)/summary/[id]/loading";
import ChatWindow from "./ChatWindow";
import InitialContent from "./InitialContent";

export default function SummaryContent({ id }: { id: string }) {
  const {
    data: summary,
    isLoading,
    error,
  } = useSuspenseQuery({
    queryKey: ["summary", id],
    queryFn: async () => {
      const result = await transcribe(id);
      if ("error" in result) {
        throw new Error(result.error);
      }
      return result as SequenceFlowOutput;
    },
  });

  if (isLoading || !summary) return <Loading />;
  if (error)
    return (
      <div>
        Error:{" "}
        {error instanceof Error ? error.message : "An unknown error occurred"}
      </div>
    );

  return (
    <div className="flex h-full w-full justify-between gap-2">
      <ChatWindow videoId={id} />
      <InitialContent
        chapters={summary.chapters}
        videoInfo={summary.videoDetails}
      />
    </div>
  );
}
