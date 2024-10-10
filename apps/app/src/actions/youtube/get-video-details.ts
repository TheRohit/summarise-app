"use server";

import { z } from "zod";
import { cloneInnertube } from "../../../../../packages/jobs/innertube/innertube";

const inputSchema = z.object({
  videoId: z.string(),
});

type VideoDetails = {
  title: string;
  description: string;
  duration: string;
  author: string;
  viewCount: string;
  thumbnails: { url?: string; width?: number; height?: number }[];
};

type GetVideoDetailsResult =
  | { success: true; data: VideoDetails }
  | {
      success: false;
      error: string;
      details?: z.ZodFormattedError<{ videoId: string }>;
    };

export async function getVideoDetails(
  input: unknown,
): Promise<GetVideoDetailsResult> {
  const result = inputSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: "Invalid input",
      details: result.error.format(),
    };
  }

  const { videoId } = result.data;

  try {
    const yt = await cloneInnertube();
    const video = await yt.getInfo(videoId);

    if (!video) {
      return { success: false, error: "Video not found" };
    }

    const videoInfo = {
      title: video.basic_info?.title ?? "",
      description: video.basic_info?.short_description ?? "",
      duration: video.basic_info?.duration?.toString() ?? "",
      author: video.basic_info?.author ?? "",
      viewCount: video.basic_info?.view_count?.toString() ?? "",
      thumbnails:
        video.basic_info?.thumbnail?.map((thumb) => ({
          url: thumb?.url,
          width: thumb?.width,
          height: thumb?.height,
        })) ?? [],
    };

    console.log("ytINFO", videoInfo);

    return { success: true, data: videoInfo };
  } catch (error) {
    console.error("Error fetching video details:", error);
    return {
      success: false,
      error: "An error occurred while fetching video details",
    };
  }
}
