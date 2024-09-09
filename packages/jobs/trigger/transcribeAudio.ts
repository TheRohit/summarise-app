import fs from 'fs/promises'
import { Deepgram } from '@deepgram/sdk'
import { z } from 'zod'

const inputSchema = z.object({
  audioPath: z.string(),
})

export async function transcribeAudio(input: z.infer<typeof inputSchema>) {
  const { audioPath } = inputSchema.parse(input)
  const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY)

  try {
    const audio = await fs.readFile(audioPath)
    const response = await deepgram.transcription.preRecorded({ buffer: audio, mimetype: 'audio/m4a' })
    const transcript = response.results?.channels[0]?.alternatives[0]?.transcript || ''
    return { success: true, transcript }
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return { success: false, error: (error as Error).message }
  } finally {
    await fs.unlink(audioPath).catch(console.error)
  }
}