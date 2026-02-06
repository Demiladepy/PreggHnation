import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { generatePartnerMessage } from '../services/ai.js'

const router = Router()

// Generate partner communication message
router.post('/', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId, concern } = req.body

    if (!userId || !concern) {
      return res.status(400).json({ error: 'userId and concern are required' })
    }

    // Get user's week number for context
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // Generate partner message
    const message = await generatePartnerMessage(
      concern,
      user?.weekNumber || undefined
    )

    res.json({
      message,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Partner message error:', error)
    res.status(500).json({ error: 'Failed to generate partner message' })
  }
})

export default router
