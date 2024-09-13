import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { createClient, srt } from "@deepgram/sdk";
import ytdl, { thumbnail } from "@distube/ytdl-core";
import { task } from "@trigger.dev/sdk/v3";

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

export interface VideoInfo {
  title: string;
  description: string;
  duration: string;
  author: string;
  viewCount: string;
  thumbnails: thumbnail[];
}

function formatSRT(srt: string): string {
  const lines = srt.split("\n");
  let formatted = "";
  let currentTime = "";
  let isSubtitleText = false;

  for (const line of lines) {
    if (line.includes("-->")) {
      currentTime = formatTime(line?.split(" --> ")[0] ?? "");
      isSubtitleText = true;
    } else if (line.trim() !== "" && isSubtitleText) {
      formatted += `${currentTime} ${line}\n`;
      isSubtitleText = false;
    }
  }

  return formatted.trim();
}

function formatTime(time: string): string {
  const [hours, minutes, seconds] = time.split(/[:,.]/);
  return `${hours?.padStart(2, "0")}:${minutes?.padStart(2, "0")}:${seconds?.padStart(2, "0")}`;
}

export const transcribe = task({
  id: "transcribe-worker",
  run: async (payload: { id: string }) => {
    const { id } = payload;
    const url = `https://www.youtube.com/watch?v=${id}`;

    try {
      const { id } = payload;
      const url = `https://www.youtube.com/watch?v=${id}`;

      const cookies = JSON.parse(process.env.YOUTUBE_COOKIES || "{}");
      const info = await ytdl.getInfo(url, {
        agent: ytdl.createAgent(cookies),
      });

      const format = ytdl.chooseFormat(info.formats, {
        quality: "lowestaudio",
        filter: "audioonly",
      });
      if (!format) {
        return { error: "No suitable audio format found" };
      }

      // Stream the audio data to Deepgram
      const stream = ytdl(url, { format });
      const { result, error } =
        await deepgram.listen.prerecorded.transcribeFile(
          stream as unknown as Buffer,
          {
            model: "nova-2",
            smart_format: true,
            mimetype: format.mimeType,
          },
        );

      if (error) {
        throw new Error(`Transcription error: ${error}`);
      }

      const videoInfo: VideoInfo = {
        title: info.videoDetails.title,
        description: info.videoDetails.description || "",
        duration: info.videoDetails.lengthSeconds,
        author: info.videoDetails.author.name,
        viewCount: info.videoDetails.viewCount,
        thumbnails: info.videoDetails.thumbnails,
      };

      const subtitles = srt(result);
      const formattedSubtitles = formatSRT(subtitles);
      return {
        transcription: formattedSubtitles,
        videoInfo,
      };
    } catch (error) {
      console.error("Error in transcribe task:", error);
      return { error: "An error occurred during transcription" };
    }
  },
});
