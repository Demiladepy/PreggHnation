'use client'

import { useState, useEffect, useRef } from 'react'
import { sendMessage, getChatHistory, getTtsAudio, ChatMessage } from '@/lib/api'
import Logo from '@/components/Logo'

const QUICK_REPLIES = [
  "I'm feeling anxious today",
  "I need some encouragement",
  "Help me relax",
  "I'm having trouble sleeping",
  "I'm worried about the baby",
  "Help me explain my feelings to my partner",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('bloompath_user')
    if (stored) {
      const user = JSON.parse(stored)
      setUserName(user.name)
      // Use a consistent user ID based on stored data
      const id = user.id || btoa(user.name + user.dueDate).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
      setUserId(id)
      if (!user.id) {
        localStorage.setItem('bloompath_user', JSON.stringify({ ...user, id }))
      }
    }
  }, [])

  useEffect(() => {
    if (userId) {
      loadChatHistory()
    }
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    if (!userId) return
    try {
      const history = await getChatHistory(userId)
      setMessages(history)
    } catch (error) {
      console.error('Failed to load chat history:', error)
      // Add welcome message if no history
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hello${userName ? ` ${userName}` : ''}! I'm BloomPath, your pregnancy wellness companion. I'm here to listen and support you. How are you feeling today?`,
        createdAt: new Date().toISOString()
      }])
    }
  }

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading || !userId) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await sendMessage(text, userId)
      setMessages(prev => [...prev, response])
    } catch (error) {
      console.error('Failed to send message:', error)
      // Fallback response
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I hear you. Your feelings are valid, and I'm here for you. While I'm having some connection issues right now, please know that whatever you're experiencing is part of this journey. Take a deep breath with me. If you need immediate support, please reach out to your healthcare provider.",
        createdAt: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleListen = async (message: ChatMessage) => {
    if (message.role !== 'assistant' || !message.content.trim()) return
    if (playingId) {
      audioRef.current?.pause()
      setPlayingId(null)
      if (playingId === message.id) return
    }
    setPlayingId(message.id)
    try {
      const blob = await getTtsAudio(message.content)
      if (!blob) {
        setPlayingId(null)
        return
      }
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => {
        URL.revokeObjectURL(url)
        setPlayingId(null)
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        setPlayingId(null)
      }
      await audio.play()
    } catch {
      setPlayingId(null)
    }
  }

  if (!userId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please complete onboarding first.</p>
          <a href="/" className="text-bloom-600 hover:text-bloom-700 font-medium">
            Go to Home →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Chat Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-earth-100 px-4 py-4 shadow-soft">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Logo size="md" />
          <div>
            <h1 className="font-bold text-earth-700">BloomPath</h1>
            <p className="text-xs text-earth-500">Your pregnancy wellness companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-messages p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-sage-400 text-white rounded-br-md shadow-soft'
                    : 'bg-cream-50 shadow-soft rounded-bl-md border border-earth-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="whitespace-pre-wrap text-sm md:text-base flex-1">{message.content}</p>
                  {message.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => handleListen(message)}
                      className="flex-shrink-0 p-1.5 rounded-lg text-earth-500 hover:bg-earth-100 hover:text-earth-700 transition-smooth"
                      title={playingId === message.id ? 'Stop' : 'Listen'}
                    >
                      {playingId === message.id ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                      )}
                    </button>
                  )}
                </div>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-white/70' : 'text-earth-400'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-cream-50 shadow-soft rounded-2xl rounded-bl-md px-5 py-4 border border-earth-100">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-sage-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies */}
      {messages.length <= 2 && (
        <div className="px-4 py-3 bg-cream-50 border-t border-earth-100">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-earth-600 mb-3 font-medium">Quick replies:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(reply)}
                  disabled={isLoading}
                  className="text-sm px-4 py-2 bg-white border-2 border-earth-100 rounded-full hover:border-sage-300 hover:bg-sage-50 transition-smooth disabled:opacity-50 shadow-soft text-earth-700 font-medium"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-earth-100 p-4 shadow-medium">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1 px-5 py-4 rounded-2xl border-2 border-earth-100 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 outline-none resize-none transition-smooth bg-cream-50 text-earth-700"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="px-6 py-4 bg-sage-400 text-white rounded-2xl hover:bg-sage-500 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-earth-500 mt-3 text-center">
            BloomPath is here to support, not replace professional care. If you need medical advice, please consult your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  )
}
