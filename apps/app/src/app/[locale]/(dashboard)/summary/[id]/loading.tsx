import { JobStatusListener } from "@/components/JobStatus";
import { Skeleton } from "@v1/ui/skeleton";

export default function Loading({ jobId }: { jobId: string }) {
  return (
    <div className=" flex h-full w-full justify-between gap-2">
      <div className="flex h-full items-center justify-center w-[60%] flex-col gap-4 p-2">
        <JobStatusListener jobId={jobId} />
      </div>
      <div className="flex h-full w-[40%] flex-col justify-between gap-2 rounded-md border p-4 ">
        <div className="flex h-full w-full flex-col gap-4 px-4">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="mt-2 h-[150px] w-[250px] rounded-xl" />
        </div>

        <div className="h-full items-center justify-center space-y-2 px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />

          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
