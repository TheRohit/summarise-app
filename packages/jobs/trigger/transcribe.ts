import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import { Deepgram } from '@deepgram/sdk'
import { z } from 'zod'

const execAsync = promisify(exec)

const inputSchema = z.object({
  videoUrl: z.string().url(),
  outputPath: z.string(),
})

async function downloadVideo(videoUrl: string, outputPath: string): Promise<void> {
  try {
    await execAsync(`yt-dlp -f 'bestaudio[ext=m4a]' -o "${outputPath}" ${videoUrl}`)
  } catch (error) {
    console.error('Error downloading video:', error)
    throw new Error('Failed to download video')
  }
}

async function transcribeAudio(audioPath: string): Promise<string> {
  const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY)
  
  try {
    const audio = await fs.readFile(audioPath)
    const response = await deepgram.transcription.preRecorded({ buffer: audio, mimetype: 'audio/m4a' })
    return response.results?.channels[0]?.alternatives[0]?.transcript || ''
  } catch (error) {
    console.error('Error transcribing audio:', error)
    throw new Error('Failed to transcribe audio')
  }
}

export async function transcribeVideo(input: z.infer<typeof inputSchema>) {
  const { videoUrl, outputPath } = inputSchema.parse(input)

  try {
    await downloadVideo(videoUrl, outputPath)
    const transcript = await transcribeAudio(outputPath)
    return { success: true, transcript }
  } catch (error) {
    console.error('Error in transcription process:', error)
    return { success: false, error: (error as Error).message }
  } finally {
    await fs.unlink(outputPath).catch(console.error)
  }
}
