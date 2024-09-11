import SummaryContent from "@/components/summary/SummaryContent";
import { getSummary } from "@/lib/api";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { Suspense } from "react";

export default async function SummaryPage({
  params,
}: {
  params: { id: string };
}) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["summary", params.id],
    queryFn: () => getSummary(params.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SummaryContent id={params.id} />
    </HydrationBoundary>
  );
}
