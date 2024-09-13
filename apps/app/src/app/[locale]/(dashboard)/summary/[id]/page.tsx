import { transcribe } from "@/actions/transcribe/transcribe-action";
import { getQueryClient } from "@/app/get-query-client";
import SummaryContent from "@/components/summary/SummaryContent";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

export default async function SummaryPage({
  params,
}: {
  params: { id: string; locale: string };
}) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["summary", params.id],
    queryFn: async () => await transcribe(params.id),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SummaryContent id={params.id} />
    </HydrationBoundary>
  );
}
