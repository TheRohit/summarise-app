import { exec } from 'child_process'
import { promisify } from 'util'
import { z } from 'zod'

const execAsync = promisify(exec)

const inputSchema = z.object({
  videoUrl: z.string().url(),
  outputPath: z.string(),
})

export async function downloadVideo(input: z.infer<typeof inputSchema>) {
  const { videoUrl, outputPath } = inputSchema.parse(input)

  try {
    await execAsync(`yt-dlp -f 'bestaudio[ext=m4a]' -o "${outputPath}" ${videoUrl}`)
    return { success: true, outputPath }
  } catch (error) {
    console.error('Error downloading video:', error)
    return { success: false, error: (error as Error).message }
  }
}