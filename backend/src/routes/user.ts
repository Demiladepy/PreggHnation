import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()

// Create or get user
router.post('/', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { name, dueDate } = req.body

    // Calculate week number from due date
    const dueDateObj = new Date(dueDate)
    const now = new Date()
    const daysUntilDue = Math.floor((dueDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const weekNumber = Math.max(1, Math.min(42, 40 - Math.floor(daysUntilDue / 7)))

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        dueDate: dueDateObj,
        weekNumber
      }
    })

    res.json({
      id: user.id,
      name: user.name,
      weekNumber: user.weekNumber,
      createdAt: user.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Get user by ID
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId } = req.params

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      name: user.name,
      weekNumber: user.weekNumber,
      dueDate: user.dueDate?.toISOString(),
      createdAt: user.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

// Update user week number (recalculate based on due date)
router.patch('/:userId/week', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId } = req.params

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || !user.dueDate) {
      return res.status(404).json({ error: 'User not found or no due date set' })
    }

    const now = new Date()
    const daysUntilDue = Math.floor((user.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const weekNumber = Math.max(1, Math.min(42, 40 - Math.floor(daysUntilDue / 7)))

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { weekNumber }
    })

    res.json({
      id: updated.id,
      weekNumber: updated.weekNumber
    })
  } catch (error) {
    console.error('Update week error:', error)
    res.status(500).json({ error: 'Failed to update week number' })
  }
})

export default router
