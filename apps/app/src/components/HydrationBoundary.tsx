"use client";

import {
  QueryClient,
  HydrationBoundary as RQHydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";

export default function HydrationBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  const dehydratedState = dehydrate(queryClient);

  return (
    <RQHydrationBoundary state={dehydratedState} >
      {children}
    </RQHydrationBoundary>
  );
}
