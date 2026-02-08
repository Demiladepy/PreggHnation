const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface MoodEntry {
  id: string
  score: number
  emotions: string[]
  notes?: string
  aiInsight?: string
  createdAt: string
}

export interface EPDSData {
  totalScore: number
  riskLevel: 'low' | 'moderate' | 'high'
  createdAt: string
}

export interface MoodStats {
  entries: MoodEntry[]
  stats: {
    averageScore: number
    totalEntries: number
    topEmotions: { emotion: string; count: number }[]
    concerningPattern: boolean
  }
  aiSummary: string
  weekNumber?: number
  epdsData: EPDSData | null
}

// Chat API
export async function sendMessage(message: string, userId: string): Promise<ChatMessage> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, userId }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to send message')
  }
  
  return response.json()
}

export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
  const response = await fetch(`${API_BASE}/api/chat/${userId}`)
  
  if (!response.ok) {
    throw new Error('Failed to get chat history')
  }
  
  return response.json()
}

// Mood API
export async function submitMood(
  userId: string,
  score: number,
  emotions: string[],
  notes?: string
): Promise<MoodEntry> {
  const response = await fetch(`${API_BASE}/api/mood`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, score, emotions, notes }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to submit mood')
  }
  
  return response.json()
}

export async function getMoodHistory(userId: string, days: number = 7): Promise<MoodEntry[]> {
  const response = await fetch(`${API_BASE}/api/mood/${userId}?days=${days}`)
  
  if (!response.ok) {
    throw new Error('Failed to get mood history')
  }
  
  return response.json()
}

// Insights API
export async function getInsights(userId: string): Promise<MoodStats> {
  const response = await fetch(`${API_BASE}/api/insights/${userId}`)
  
  if (!response.ok) {
    throw new Error('Failed to get insights')
  }
  
  return response.json()
}

// User API
export async function createOrGetUser(name: string, dueDate: string): Promise<{ id: string; weekNumber: number }> {
  const response = await fetch(`${API_BASE}/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, dueDate }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to create user')
  }
  
  return response.json()
}

// EPDS Screening API
export interface EPDSScreening {
  id: string
  totalScore: number
  itemScores: number[]
  riskLevel: 'low' | 'moderate' | 'high'
  aiInsight?: string
  createdAt: string
}

export async function submitEPDS(userId: string, itemScores: number[]): Promise<EPDSScreening> {
  const response = await fetch(`${API_BASE}/api/epds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemScores }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to submit screening')
  }
  
  return response.json()
}

export async function getEPDSHistory(userId: string): Promise<EPDSScreening[]> {
  const response = await fetch(`${API_BASE}/api/epds/${userId}`)
  
  if (!response.ok) {
    throw new Error('Failed to get screening history')
  }
  
  return response.json()
}

export async function getLatestEPDS(userId: string): Promise<EPDSScreening | null> {
  const response = await fetch(`${API_BASE}/api/epds/${userId}/latest`)
  
  if (!response.ok) {
    throw new Error('Failed to get latest screening')
  }
  
  return response.json()
}

// Partner Communication API
export async function generatePartnerMessage(userId: string, concern: string): Promise<{ message: string; createdAt: string }> {
  const response = await fetch(`${API_BASE}/api/partner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, concern }),
  })
  
  if (!response.ok) {
    throw new Error('Failed to generate partner message')
  }
  
  return response.json()
}

// Text-to-Speech (ElevenLabs) – returns audio blob or null if not configured
export async function getTtsAudio(text: string): Promise<Blob | null> {
  const response = await fetch(`${API_BASE}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (response.status === 503) return null // TTS not configured
  if (!response.ok) return null
  return response.blob()
}
