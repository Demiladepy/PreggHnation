import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { generateEPDSInsight } from '../services/ai.js'

const router = Router()

// Submit EPDS screening
router.post('/', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId, itemScores } = req.body

    if (!userId || !itemScores || !Array.isArray(itemScores) || itemScores.length !== 10) {
      return res.status(400).json({ error: 'userId and 10 itemScores are required' })
    }

    // Validate each score is 0-3
    for (const score of itemScores) {
      if (typeof score !== 'number' || score < 0 || score > 3) {
        return res.status(400).json({ error: 'Each item score must be 0-3' })
      }
    }

    // Calculate total score
    const totalScore = itemScores.reduce((sum: number, score: number) => sum + score, 0)

    // Determine risk level
    let riskLevel = 'low'
    if (totalScore >= 13) {
      riskLevel = 'high'
    } else if (totalScore >= 10) {
      riskLevel = 'moderate'
    }

    // Generate AI insight
    const aiInsight = await generateEPDSInsight(totalScore, itemScores)

    // Save screening
    const screening = await prisma.ePDSScreening.create({
      data: {
        userId,
        totalScore,
        itemScores: JSON.stringify(itemScores),
        riskLevel,
        aiInsight
      }
    })

    res.json({
      id: screening.id,
      totalScore: screening.totalScore,
      itemScores: JSON.parse(screening.itemScores),
      riskLevel: screening.riskLevel,
      aiInsight: screening.aiInsight,
      createdAt: screening.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Submit EPDS error:', error)
    res.status(500).json({ error: 'Failed to submit screening' })
  }
})

// Get EPDS history for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId } = req.params

    const screenings = await prisma.ePDSScreening.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    res.json(screenings.map(s => ({
      id: s.id,
      totalScore: s.totalScore,
      itemScores: JSON.parse(s.itemScores),
      riskLevel: s.riskLevel,
      aiInsight: s.aiInsight,
      createdAt: s.createdAt.toISOString()
    })))
  } catch (error) {
    console.error('Get EPDS history error:', error)
    res.status(500).json({ error: 'Failed to get screening history' })
  }
})

// Get latest EPDS screening
router.get('/:userId/latest', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId } = req.params

    const screening = await prisma.ePDSScreening.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    if (!screening) {
      return res.json(null)
    }

    res.json({
      id: screening.id,
      totalScore: screening.totalScore,
      itemScores: JSON.parse(screening.itemScores),
      riskLevel: screening.riskLevel,
      aiInsight: screening.aiInsight,
      createdAt: screening.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Get latest EPDS error:', error)
    res.status(500).json({ error: 'Failed to get latest screening' })
  }
})

export default router
