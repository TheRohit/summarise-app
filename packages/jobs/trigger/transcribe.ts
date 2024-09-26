import {
  DeepgramResponse,
  SyncPrerecordedResponse,
  createClient,
  srt,
} from "@deepgram/sdk";
import { task } from "@trigger.dev/sdk/v3";

import { thumbnail } from "@distube/ytdl-core";
import { cloneInnertube } from "../innertube/innertube";
import { formatSRT } from "../innertube/util";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

export interface VideoInfo {
  title: string;
  description: string;
  duration: string;
  author: string;
  viewCount: string;
  thumbnails: thumbnail[];
}

export const transcribe = task({
  id: "transcribe-worker",
  run: async (payload: { id: string }) => {
    const { id } = payload;

    try {
      const yt = await cloneInnertube();
      const video = await yt.getInfo(id);
      if (!video) {
        return { error: "Video not found" };
      }
      const format = video.chooseFormat({
        type: "audio",
      });

      if (!format) {
        return { error: "No suitable audio format found" };
      }

      console.log("format quality", format.quality);

      const stream = await yt.download(id, {
        type: "audio",
      });

      let transcriptionResult: DeepgramResponse<SyncPrerecordedResponse>;
      try {
        transcriptionResult = await deepgram.listen.prerecorded.transcribeFile(
          stream as unknown as Buffer,
          {
            model: "nova-2",
            smart_format: true,
            mimetype: format.mime_type,
          },
        );
      } catch (deepgramError: unknown) {
        console.error("Deepgram API error:", deepgramError);
        return {
          error: `Deepgram API error: ${(deepgramError as Error).message || "Unknown error"}`,
        };
      }

      if (transcriptionResult.error) {
        console.error("Transcription error:", transcriptionResult.error);
        return { error: `Transcription error: ${transcriptionResult.error}` };
      }

      const subtitles = srt(transcriptionResult.result);
      const formattedSubtitles = formatSRT(subtitles);
      return {
        transcription: formattedSubtitles,
        videoInfo: {
          title: video?.basic_info?.title ?? "",
          description: video?.basic_info?.short_description ?? "",
          duration: video?.basic_info?.duration?.toString() ?? "",
          author: video?.basic_info?.author ?? "",
          viewCount: video?.basic_info?.view_count?.toString() ?? "",
          thumbnails:
            video?.basic_info?.thumbnail?.map((thumb) => ({
              url: thumb?.url,
              width: thumb?.width,
              height: thumb?.height,
            })) ?? [],
        },
      };
    } catch (error: unknown) {
      console.error("Error in transcribe task:", error);
      return {
        error: `An error occurred during transcription: ${(error as Error).message || "Unknown error"}`,
      };
    }
  },
});
