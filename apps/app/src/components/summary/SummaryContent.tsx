"use client";

import { getSummary } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function SummaryContent({ id }: { id: string }) {
  const {
    data: summary,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["summary", id],
    queryFn: () => getSummary(id),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  console.log(summary);

  return <div>hiii</div>;
}
