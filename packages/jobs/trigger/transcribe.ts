import { createClient, srt } from "@deepgram/sdk";
import ytdl from "@distube/ytdl-core";
import { task } from "@trigger.dev/sdk/v3";
import fs from 'fs';
import path from 'path';

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

interface VideoInfo {
  title: string;
  description: string;
  duration: string;
  author: string;
  viewCount: string;
  thumbnails: any;
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
    
    const cookies = JSON.parse(process.env.YOUTUBE_COOKIES || '{}');
    const info = await ytdl.getInfo(url, { agent: ytdl.createAgent(cookies) });
    
    const format = ytdl.chooseFormat(info.formats, { quality: "lowestaudio", filter: "audioonly" });
    if (!format) throw new Error("No suitable audio format found");
    
    const audioPath = path.join("/tmp", `audio_${Date.now()}.${format.container}`);
    
    await new Promise<void>((resolve, reject) => {
      ytdl.downloadFromInfo(info, { format })
        .pipe(fs.createWriteStream(audioPath))
        .on('finish', resolve)
        .on('error', reject);
    });

    const audioFileStream = fs.createReadStream(audioPath);
    
    try {
      const { result } = await deepgram.listen.prerecorded.transcribeFile(
        audioFileStream,
        {
          model: "nova-2",
            smart_format: true,
          },
      );

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
    } finally {
      audioFileStream.close();
      fs.unlinkSync(audioPath);
    }
  },
});
