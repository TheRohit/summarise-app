import { z } from 'zod'
import { downloadVideo } from './downloadVideo'
import { transcribeAudio } from './transcribeAudio'

const inputSchema = z.object({
  videoUrl: z.string().url(),
  outputPath: z.string(),
})

export async function transcribeVideo(input: z.infer<typeof inputSchema>) {
  const { videoUrl, outputPath } = inputSchema.parse(input)

  const downloadResult = await downloadVideo({ videoUrl, outputPath })
  if (!downloadResult.success) {
    return downloadResult
  }

  const transcribeResult = await transcribeAudio({ audioPath: outputPath })
  return transcribeResult
}