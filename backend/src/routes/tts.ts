import { Router, Request, Response } from 'express'

const router = Router()
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL' // Bella – warm, calm (good for wellness)
const MODEL_ID = 'eleven_multilingual_v2'

router.post('/', async (req: Request, res: Response) => {
  if (!ELEVENLABS_API_KEY) {
    res.status(503).json({ error: 'Text-to-speech is not configured' })
    return
  }

  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : ''
  if (!text) {
    res.status(400).json({ error: 'Missing or invalid "text" in body' })
    return
  }

  // Limit length to avoid long synthesis (ElevenLabs has limits)
  const maxChars = 2500
  const truncated = text.length > maxChars ? text.slice(0, maxChars) + '...' : text

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: truncated,
          model_id: MODEL_ID,
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('ElevenLabs TTS error:', response.status, errText)
      res.status(response.status).json({ error: 'TTS request failed' })
      return
    }

    const contentType = response.headers.get('Content-Type') || 'audio/mpeg'
    res.setHeader('Content-Type', contentType)
    const buffer = await response.arrayBuffer()
    res.send(Buffer.from(buffer))
  } catch (err) {
    console.error('TTS error:', err)
    res.status(500).json({ error: 'TTS failed' })
  }
})

export default router
