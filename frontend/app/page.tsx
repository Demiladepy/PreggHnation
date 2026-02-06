'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createOrGetUser } from '@/lib/api'

export default function Home() {
  const [userName, setUserName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [weekNumber, setWeekNumber] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('bloompath_user')
    if (stored) {
      const user = JSON.parse(stored)
      setUserName(user.name)
      setDueDate(user.dueDate)
      setIsOnboarded(true)
      calculateWeek(user.dueDate)
    }
  }, [])

  const calculateWeek = (due: string) => {
    const dueDateTime = new Date(due).getTime()
    const now = Date.now()
    const daysUntilDue = Math.floor((dueDateTime - now) / (1000 * 60 * 60 * 24))
    const weeksPregnant = 40 - Math.floor(daysUntilDue / 7)
    setWeekNumber(Math.max(1, Math.min(42, weeksPregnant)))
  }

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Create user in backend
      const userData = await createOrGetUser(userName, dueDate)
      
      // Store in localStorage with backend ID
      const user = { 
        id: userData.id,
        name: userName, 
        dueDate, 
        weekNumber: userData.weekNumber,
        createdAt: new Date().toISOString() 
      }
      localStorage.setItem('bloompath_user', JSON.stringify(user))
      setIsOnboarded(true)
      setWeekNumber(userData.weekNumber)
    } catch (error) {
      console.error('Failed to create user:', error)
      // Fallback to local-only storage
      const user = { name: userName, dueDate, createdAt: new Date().toISOString() }
      localStorage.setItem('bloompath_user', JSON.stringify(user))
      setIsOnboarded(true)
      calculateWeek(dueDate)
    }
  }

  if (!isOnboarded) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌸</div>
            <h1 className="text-3xl font-bold text-bloom-700 mb-2">Welcome to BloomPath</h1>
            <p className="text-gray-600">Your compassionate companion for pregnancy wellness</p>
          </div>
          
          <form onSubmit={handleOnboard} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                What should we call you?
              </label>
              <input
                type="text"
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-bloom-400 focus:ring-2 focus:ring-bloom-200 outline-none transition-smooth"
                placeholder="Your name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                When is your due date?
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-bloom-400 focus:ring-2 focus:ring-bloom-200 outline-none transition-smooth"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-bloom-500 to-bloom-600 text-white py-3 px-6 rounded-xl font-medium hover:from-bloom-600 hover:to-bloom-700 transition-smooth shadow-md hover:shadow-lg"
            >
              Begin Your Journey
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-500 mt-6">
            Your data stays on your device. We prioritize your privacy.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-bloom-700 mb-2">
            Hello, {userName}! 🌸
          </h1>
          {weekNumber && (
            <p className="text-gray-600">
              You&apos;re in week {weekNumber} of your pregnancy journey
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Chat Card */}
          <Link href="/chat" className="block group">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-smooth border-2 border-transparent hover:border-bloom-200">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-bloom-600">
                Talk to BloomPath
              </h2>
              <p className="text-gray-600">
                Share your thoughts and feelings with your AI companion. Get personalized support anytime you need it.
              </p>
            </div>
          </Link>

          {/* Mood Card */}
          <Link href="/mood" className="block group">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-smooth border-2 border-transparent hover:border-sage-200">
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-sage-600">
                Daily Check-in
              </h2>
              <p className="text-gray-600">
                Track your mood and emotions. Voice input available for accessibility.
              </p>
            </div>
          </Link>

          {/* Screening Card */}
          <Link href="/screening" className="block group">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-smooth border-2 border-transparent hover:border-amber-200">
              <div className="text-4xl mb-4">🩺</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-amber-600">
                Depression Screening
              </h2>
              <p className="text-gray-600">
                Take the clinically-validated EPDS assessment. Early detection leads to better outcomes.
              </p>
            </div>
          </Link>

          {/* Partner Card */}
          <Link href="/partner" className="block group">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-smooth border-2 border-transparent hover:border-pink-200">
              <div className="text-4xl mb-4">💑</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-pink-600">
                Partner Communication
              </h2>
              <p className="text-gray-600">
                Need help explaining your feelings? We&apos;ll help you craft a thoughtful message.
              </p>
            </div>
          </Link>

          {/* Insights Card */}
          <Link href="/insights" className="block group md:col-span-2 lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-smooth border-2 border-transparent hover:border-bloom-200">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-bloom-600">
                Your Wellness Insights
              </h2>
              <p className="text-gray-600">
                See your mood trends, EPDS scores, and get AI-powered insights to support your wellbeing.
              </p>
            </div>
          </Link>
        </div>

        {/* Statistics Banner */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">You&apos;re Not Alone</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-bloom-50 rounded-xl">
              <div className="text-2xl font-bold text-bloom-600">1 in 4</div>
              <div className="text-xs text-gray-600">women experience perinatal depression</div>
            </div>
            <div className="p-3 bg-sage-50 rounded-xl">
              <div className="text-2xl font-bold text-sage-600">50%</div>
              <div className="text-xs text-gray-600">of cases go undiagnosed</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <div className="text-2xl font-bold text-amber-600">96%</div>
              <div className="text-xs text-gray-600">satisfaction with AI support</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">#1</div>
              <div className="text-xs text-gray-600">complication of childbirth</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 bg-gradient-to-r from-bloom-50 to-sage-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Remember</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-bloom-500">✓</span>
              <span>Your feelings are valid. This journey has ups and downs.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-bloom-500">✓</span>
              <span>BloomPath is here to support, not replace professional care.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-bloom-500">✓</span>
              <span>If you&apos;re struggling, please reach out to your healthcare provider.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
