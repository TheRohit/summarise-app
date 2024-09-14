import SummaryContent from "@/components/summary/SummaryContent";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Loading from "./loading";

export default async function SummaryPage({
  params,
  searchParams,
}: {
  params: { id: string; jobId: string };
  searchParams?: { jobId: string };
}) {
  return (
    <Suspense fallback={<Loading />}>
      <SummaryContent id={params.id} jobId={searchParams?.jobId} />
    </Suspense>
  );
}
