"use client";

import { ProcessResponse } from "@/actions/transcribe/transcribe.types";

import Loading from "@/app/[locale]/(dashboard)/summary/[id]/loading";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import ChatWindow from "./ChatWindow";
import InitialContent from "./InitialContent";

const getHostName = () => {
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return "https://summarise-v1.vercel.app";
};

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
        jobId: jobId ?? "unknown",
        videoId: id,
      });

      const run = await fetch(
        `${getHostName()}/api/process?${params.toString()}`,
        {
          method: "GET",
        }
      );
      return run.json();
    },
    refetchInterval: (query) =>
      query.state.data?.status !== "COMPLETED" ? 2000 : false,
    staleTime: Number.POSITIVE_INFINITY,
    refetchIntervalInBackground: true,
  });

  const router = useRouter();

  if (summary.status === "NOT_FOUND" && typeof window !== "undefined") {
    router.push("/");
  }

  if (summary.status !== "COMPLETED") {
    return <Loading jobId={jobId ?? ""} />;
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
