import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { generateMoodInsight } from '../services/ai.js'

const router = Router()

// Submit a mood entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId, score, emotions, notes } = req.body

    if (!userId || !score || !emotions) {
      return res.status(400).json({ error: 'userId, score, and emotions are required' })
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({ error: 'Score must be between 1 and 5' })
    }

    // Get user's week number for context
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // Generate AI insight
    const aiInsight = await generateMoodInsight(
      score,
      emotions,
      notes,
      user?.weekNumber || undefined
    )

    // Save mood entry
    const entry = await prisma.moodEntry.create({
      data: {
        userId,
        score,
        emotions: JSON.stringify(emotions),
        notes: notes || null,
        aiInsight
      }
    })

    res.json({
      id: entry.id,
      score: entry.score,
      emotions: JSON.parse(entry.emotions),
      notes: entry.notes,
      aiInsight: entry.aiInsight,
      createdAt: entry.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Submit mood error:', error)
    res.status(500).json({ error: 'Failed to submit mood entry' })
  }
})

// Get mood history for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId } = req.params
    const days = parseInt(req.query.days as string) || 7

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const entries = await prisma.moodEntry.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(entries.map(entry => ({
      id: entry.id,
      score: entry.score,
      emotions: JSON.parse(entry.emotions),
      notes: entry.notes,
      aiInsight: entry.aiInsight,
      createdAt: entry.createdAt.toISOString()
    })))
  } catch (error) {
    console.error('Get mood history error:', error)
    res.status(500).json({ error: 'Failed to get mood history' })
  }
})

// Get today's mood entry (if exists)
router.get('/:userId/today', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId } = req.params

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const entry = await prisma.moodEntry.findFirst({
      where: {
        userId,
        createdAt: { gte: today }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!entry) {
      return res.json(null)
    }

    res.json({
      id: entry.id,
      score: entry.score,
      emotions: JSON.parse(entry.emotions),
      notes: entry.notes,
      aiInsight: entry.aiInsight,
      createdAt: entry.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Get today mood error:', error)
    res.status(500).json({ error: 'Failed to get today mood' })
  }
})

export default router
