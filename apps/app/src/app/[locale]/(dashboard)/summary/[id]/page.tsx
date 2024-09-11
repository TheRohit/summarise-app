import HydrationBoundary from "@/components/HydrationBoundary";
import SummaryContent from "@/components/summary/SummaryContent";
import { getSummary } from "@/lib/api";

import { QueryClient } from "@tanstack/react-query";

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
    <HydrationBoundary>
      <SummaryContent id={params.id} />
    </HydrationBoundary>
  );
}
