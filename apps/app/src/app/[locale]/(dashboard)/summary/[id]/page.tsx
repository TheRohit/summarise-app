import { SummaryLoading } from "@/components/summary/summary.loading";
import { SummaryServer } from "@/components/summary/summary.server";
import { Suspense } from "react";

interface Props {
  params: {
    id: string;
  };
}

export default async function Page({ params }: Props) {
  const { id } = params;

  return (
    <Suspense fallback={<SummaryLoading />}>
      <SummaryServer id={id} />
    </Suspense>
  );
}
