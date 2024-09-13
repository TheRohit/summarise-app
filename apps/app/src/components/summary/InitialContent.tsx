"use client";

import { ChaptersResponse } from "../../../../../packages/jobs/trigger/chapters";
import { VideoInfo } from "../../../../../packages/jobs/trigger/transcribe";
import { Badge } from "../../../../../packages/ui/src/components/badge";
import { ScrollArea } from "../../../../../packages/ui/src/components/scroll-area";
import { Thumbnail } from "./Thumbnail";

interface StreamingContentProps {
  chapters: ChaptersResponse;
  videoInfo: VideoInfo;
}

const InitialContent = ({ chapters, videoInfo }: StreamingContentProps) => {
  return (
    <div className=" flex h-full w-[40%] flex-col justify-between gap-4 rounded-md border p-4 backdrop-blur-[2px]">
      <Thumbnail videoInfo={videoInfo} />
      <div className="flex h-full flex-col gap-2 overflow-hidden">
        <h1 className="text-xl font-bold ">Chapters</h1>
        <ScrollArea className=" h-full w-full rounded-md border p-4">
          {chapters?.chapters.map((chapter) => (
            <div
              className="mx-2 flex cursor-pointer flex-col items-start gap-1 space-x-4 rounded-md p-2 transition-all hover:bg-accent hover:text-accent-foreground"
              key={chapter.timestamp}
            >
              <div className="flex items-center justify-start gap-4  text-center">
                <p className="justify-start text-left font-bold ">
                  {chapter.title}
                </p>
                <Badge variant={"outline"}>{chapter.timestamp}</Badge>
              </div>
              <p className="justify-start text-left text-sm text-muted-foreground">
                {chapter.summary}
              </p>
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default InitialContent;
