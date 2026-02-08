import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import chatRoutes from './routes/chat.js'
import moodRoutes from './routes/mood.js'
import insightsRoutes from './routes/insights.js'
import userRoutes from './routes/user.js'
import epdsRoutes from './routes/epds.js'
import partnerRoutes from './routes/partner.js'
import ttsRoutes from './routes/tts.js'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

// Middleware – allow frontend origins (local + production)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://pregg-hnation.vercel.app'
]
const frontendUrl = process.env.FRONTEND_URL
if (frontendUrl) allowedOrigins.push(frontendUrl)
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))
app.use(express.json())

// Make prisma available to routes
app.locals.prisma = prisma

// Routes
app.use('/api/chat', chatRoutes)
app.use('/api/mood', moodRoutes)
app.use('/api/insights', insightsRoutes)
app.use('/api/user', userRoutes)
app.use('/api/epds', epdsRoutes)
app.use('/api/partner', partnerRoutes)
app.use('/api/tts', ttsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🌸 BloomPath API running on http://localhost:${PORT}`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
