import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { getChatResponse } from '../services/ai.js'

const router = Router()

// Send a message and get AI response
router.post('/', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { message, userId } = req.body

    if (!message || !userId) {
      return res.status(400).json({ error: 'Message and userId are required' })
    }

    // Get user's week number for context
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    // Save user message
    await prisma.chatMessage.create({
      data: {
        userId,
        role: 'user',
        content: message
      }
    })

    // Get conversation history (last 10 messages for context)
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    const conversationHistory = history
      .reverse()
      .slice(0, -1) // Exclude the message we just added
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

    // Get AI response
    const aiResponse = await getChatResponse(
      message,
      conversationHistory,
      user?.weekNumber || undefined
    )

    // Save AI response
    const savedResponse = await prisma.chatMessage.create({
      data: {
        userId,
        role: 'assistant',
        content: aiResponse
      }
    })

    res.json({
      id: savedResponse.id,
      role: 'assistant',
      content: aiResponse,
      createdAt: savedResponse.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'Failed to process message' })
  }
})

// Get chat history for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId } = req.params

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    })

    res.json(messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt.toISOString()
    })))
  } catch (error) {
    console.error('Get chat history error:', error)
    res.status(500).json({ error: 'Failed to get chat history' })
  }
})

// Clear chat history (optional)
router.delete('/:userId', async (req: Request, res: Response) => {
  try {
    const prisma: PrismaClient = req.app.locals.prisma
    const { userId } = req.params

    await prisma.chatMessage.deleteMany({
      where: { userId }
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Clear chat error:', error)
    res.status(500).json({ error: 'Failed to clear chat history' })
  }
})

export default router
