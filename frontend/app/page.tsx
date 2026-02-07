'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createOrGetUser } from '@/lib/api'
import Logo from '@/components/Logo'

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
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-cream-50 to-sage-50">
        <div className="max-w-lg w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-earth-700 mb-3">Welcome to BloomPath</h1>
            <p className="text-lg text-earth-600">Your compassionate companion for pregnancy wellness</p>
          </div>
          
          <form onSubmit={handleOnboard} className="bg-white rounded-3xl shadow-medium p-8 md:p-10 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-earth-700 mb-3">
                What should we call you?
              </label>
              <input
                type="text"
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-earth-100 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 outline-none transition-smooth bg-cream-50 text-earth-700"
                placeholder="Your name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-earth-700 mb-3">
                When is your due date?
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-earth-100 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 outline-none transition-smooth bg-cream-50 text-earth-700"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-sage-400 text-white py-4 px-6 rounded-2xl font-semibold hover:bg-sage-500 transition-smooth shadow-medium hover:shadow-large text-lg"
            >
              Begin Your Journey
            </button>
          </form>
          
          <p className="text-center text-sm text-earth-500 mt-6">
            Your data stays secure. We prioritize your privacy.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-sage-100 via-cream-50 to-peach-50 py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft mb-6">
            <span className="text-sage-500">🌸</span>
            <span className="text-sm font-medium text-earth-700">We Are Here For You</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-earth-700 mb-4 leading-tight">
            Hello, {userName}!<br />
            <span className="text-sage-600">Your Wellness Journey Starts Here</span>
          </h1>
          
          {weekNumber && (
            <p className="text-lg md:text-xl text-earth-600 mb-8 max-w-2xl">
              You&apos;re in week {weekNumber} of your pregnancy. We&apos;re here to support you every step of the way with personalized, compassionate care.
            </p>
          )}
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/mood"
              className="inline-flex items-center justify-center px-6 py-4 bg-sage-400 text-white rounded-2xl font-semibold hover:bg-sage-500 transition-smooth shadow-medium hover:shadow-large"
            >
              Start Your Check-in
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center justify-center px-6 py-4 bg-white border-2 border-earth-200 text-earth-700 rounded-2xl font-semibold hover:bg-cream-50 transition-smooth shadow-soft"
            >
              Talk to BloomPath
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-16">
        {/* Why Choose Us Section */}
        <div className="mb-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-earth-700 mb-2">
                Why Choose BloomPath?
              </h2>
              <p className="text-xl text-earth-600">
                Because Your Mental Health Deserves the Best
              </p>
            </div>
            <p className="text-earth-600 max-w-md">
              Evidence-based AI support designed specifically for pregnant women. Your care is personalized, compassionate, and available 24/7.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Chat Card */}
            <Link href="/chat" className="group">
              <div className="bg-cream-50 rounded-3xl p-8 shadow-soft hover:shadow-medium transition-smooth h-full">
                <div className="w-16 h-16 bg-sage-200 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sage-300 transition-smooth">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-xl font-bold text-earth-700 mb-3">AI Companion Chat</h3>
                <p className="text-earth-600 leading-relaxed">
                  Get personalized emotional support anytime. Our AI understands your pregnancy journey and provides compassionate guidance.
                </p>
              </div>
            </Link>

            {/* Mood Card */}
            <Link href="/mood" className="group">
              <div className="bg-cream-50 rounded-3xl p-8 shadow-soft hover:shadow-medium transition-smooth h-full">
                <div className="w-16 h-16 bg-peach-200 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-peach-300 transition-smooth">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-bold text-earth-700 mb-3">Daily Mood Tracking</h3>
                <p className="text-earth-600 leading-relaxed">
                  Track your emotional patterns with voice input support. Understand your feelings and get AI-powered insights.
                </p>
              </div>
            </Link>

            {/* Screening Card */}
            <Link href="/screening" className="group">
              <div className="bg-cream-50 rounded-3xl p-8 shadow-soft hover:shadow-medium transition-smooth h-full">
                <div className="w-16 h-16 bg-sage-300 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sage-400 transition-smooth">
                  <span className="text-3xl">🩺</span>
                </div>
                <h3 className="text-xl font-bold text-earth-700 mb-3">Clinical Screening</h3>
                <p className="text-earth-600 leading-relaxed">
                  Take the validated EPDS assessment. Early detection leads to better outcomes and timely support.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Partner Card */}
          <Link href="/partner" className="group">
            <div className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-medium transition-smooth h-full border border-earth-100">
              <div className="w-16 h-16 bg-peach-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-peach-200 transition-smooth">
                <span className="text-3xl">💑</span>
              </div>
              <h3 className="text-xl font-bold text-earth-700 mb-3">Partner Communication</h3>
              <p className="text-earth-600 leading-relaxed">
                Need help explaining your feelings? We&apos;ll help you craft thoughtful messages to strengthen your support network.
              </p>
            </div>
          </Link>

          {/* Insights Card */}
          <Link href="/insights" className="group">
            <div className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-medium transition-smooth h-full border border-earth-100">
              <div className="w-16 h-16 bg-sage-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sage-200 transition-smooth">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-earth-700 mb-3">Wellness Insights</h3>
              <p className="text-earth-600 leading-relaxed">
                See your mood trends, EPDS scores, and get personalized AI summaries to support your wellbeing journey.
              </p>
            </div>
          </Link>
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-br from-sage-50 to-cream-50 rounded-3xl p-8 md:p-12 shadow-soft mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-earth-700 mb-8 text-center">You&apos;re Not Alone</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-sage-500 mb-2">1 in 4</div>
              <div className="text-sm text-earth-600">women experience perinatal depression</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-sage-500 mb-2">50%</div>
              <div className="text-sm text-earth-600">of cases go undiagnosed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-sage-500 mb-2">96%</div>
              <div className="text-sm text-earth-600">satisfaction with AI support</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-sage-500 mb-2">#1</div>
              <div className="text-sm text-earth-600">complication of childbirth</div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-soft">
          <h3 className="text-2xl font-bold text-earth-700 mb-6">Remember</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sage-600 font-bold">✓</span>
              </div>
              <div>
                <p className="text-earth-700 font-medium mb-1">Your feelings are valid</p>
                <p className="text-earth-600">This journey has ups and downs. Every emotion you experience is part of your unique pregnancy experience.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sage-600 font-bold">✓</span>
              </div>
              <div>
                <p className="text-earth-700 font-medium mb-1">Support, not replacement</p>
                <p className="text-earth-600">BloomPath is here to support, not replace professional mental health care. We complement your healthcare team.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-sage-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sage-600 font-bold">✓</span>
              </div>
              <div>
                <p className="text-earth-700 font-medium mb-1">Professional help available</p>
                <p className="text-earth-600">If you&apos;re struggling, please reach out to your healthcare provider. Help is always available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
