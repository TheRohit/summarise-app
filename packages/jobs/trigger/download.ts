import { task } from "@trigger.dev/sdk/v3";
import ytdl from "@distube/ytdl-core";
import fs from "fs";
import path from "path";

export const download = task({
  id: "download",
  run: async (payload: { id: string }) => {
    const { id } = payload;
    const url = `https://www.youtube.com/watch?v=${id}`;
    const cookiesString = process.env.YOUTUBE_COOKIES;
    
    if (!cookiesString) {
      throw new Error("YouTube cookies not found in environment variables");
    }
    
    const cookies = JSON.parse(cookiesString);
    const agent = ytdl.createAgent(cookies);
    const info = await ytdl.getInfo(url, { agent });
    const format = ytdl.chooseFormat(info.formats, {
      quality: "lowestaudio",
      filter: "audioonly",
    });
    
    if (!format) {
      throw new Error("No suitable format found");
    }
    
    const audioStream = ytdl.downloadFromInfo(info, { format });
    const audioPath = path.join("/tmp", `audio_${Date.now()}.${format.container}`);
    
    await new Promise<void>((resolve, reject) => {
      const audioFile = fs.createWriteStream(audioPath);
      audioStream.pipe(audioFile);
      
      audioStream.on("error", (error) => {
        audioFile.close();
        fs.unlink(audioPath, () => {});
        reject(error);
      });
      
      audioFile.on("finish", () => {
        audioFile.close();
        resolve();
      });
      
      audioFile.on("error", (error) => {
        audioFile.close();
        fs.unlink(audioPath, () => {});
        reject(error);
      });
    });
    
    const audioContent = await fs.promises.readFile(audioPath);
    await fs.promises.unlink(audioPath);
    
    return {
      audioContent: audioContent.toString('base64'),
      videoInfo: {
        title: info.videoDetails.title,
        description: info.videoDetails.description ?? "",
        duration: info.videoDetails.lengthSeconds,
        author: info.videoDetails.author.name,
        viewCount: info.videoDetails.viewCount,
        thumbnails: info.videoDetails.thumbnails ?? [],
      },
    };
  },
});
