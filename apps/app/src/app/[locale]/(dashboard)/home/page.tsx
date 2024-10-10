import { VideoSearch } from "@/components/VideoSearch";

export const metadata = {
  title: "Home",
};

export default async function Page() {
  return (
    <div className="flex h-full w-full  gap-2 flex-col">
      <h1 className="text-2xl font-bold mb-4">Video Search</h1>
      <VideoSearch />
    </div>
  );
}
