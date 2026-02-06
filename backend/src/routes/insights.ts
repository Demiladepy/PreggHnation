import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { generateWeeklySummary } from '../services/ai.js'

const router = Router()

// Get insights for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId } = req.params

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // Get last 7 days of mood entries
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    const entries = await prisma.moodEntry.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Calculate stats
    const averageScore = entries.length > 0
      ? entries.reduce((sum, e) => sum + e.score, 0) / entries.length
      : 0

    // Get all emotions frequency
    const emotionCounts: Record<string, number> = {}
    entries.forEach(entry => {
      const emotions = JSON.parse(entry.emotions) as string[]
      emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      })
    })

    // Sort emotions by frequency
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }))

    // Get latest EPDS screening
    const latestEPDS = await prisma.ePDSScreening.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Generate AI summary (now includes EPDS context)
    const aiSummary = await generateWeeklySummary(
      entries,
      latestEPDS?.totalScore,
      user?.weekNumber || undefined
    )

    // Identify concerning patterns
    const recentLowMoods = entries.filter(e => e.score <= 2).length
    const concerningPattern = entries.length >= 3 && (recentLowMoods / entries.length) >= 0.5

    res.json({
      entries: entries.map(entry => ({
        id: entry.id,
        score: entry.score,
        emotions: JSON.parse(entry.emotions),
        notes: entry.notes,
        aiInsight: entry.aiInsight,
        createdAt: entry.createdAt.toISOString()
      })),
      stats: {
        averageScore: Math.round(averageScore * 10) / 10,
        totalEntries: entries.length,
        topEmotions,
        concerningPattern
      },
      aiSummary,
      weekNumber: user?.weekNumber,
      epdsData: latestEPDS ? {
        totalScore: latestEPDS.totalScore,
        riskLevel: latestEPDS.riskLevel,
        createdAt: latestEPDS.createdAt.toISOString()
      } : null
    })
  } catch (error) {
    console.error('Get insights error:', error)
    res.status(500).json({ error: 'Failed to get insights' })
  }
})

export default router
