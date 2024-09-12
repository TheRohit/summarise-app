"use client";

import {
  QueryClient,
  HydrationBoundary as RQHydrationBoundary,
} from "@tanstack/react-query";

interface HydrationBoundaryProps {
  children: React.ReactNode;
  state: unknown;
}

export default function HydrationBoundary({
  children,
  state,
}: HydrationBoundaryProps) {
  return <RQHydrationBoundary state={state}>{children}</RQHydrationBoundary>;
}
