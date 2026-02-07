'use client'

import { useState, useEffect } from 'react'
import { submitMood, MoodEntry } from '@/lib/api'
import VoiceInput from '@/components/VoiceInput'
import Logo from '@/components/Logo'

const MOOD_EMOJIS = [
  { score: 1, emoji: '😢', label: 'Very Low' },
  { score: 2, emoji: '😔', label: 'Low' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😊', label: 'Great' },
]

const EMOTIONS = [
  { id: 'anxious', label: 'Anxious', color: 'bg-amber-100 border-amber-300 text-amber-700' },
  { id: 'hopeful', label: 'Hopeful', color: 'bg-green-100 border-green-300 text-green-700' },
  { id: 'tired', label: 'Tired', color: 'bg-gray-100 border-gray-300 text-gray-700' },
  { id: 'happy', label: 'Happy', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { id: 'overwhelmed', label: 'Overwhelmed', color: 'bg-red-100 border-red-300 text-red-700' },
  { id: 'calm', label: 'Calm', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { id: 'excited', label: 'Excited', color: 'bg-pink-100 border-pink-300 text-pink-700' },
  { id: 'worried', label: 'Worried', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { id: 'grateful', label: 'Grateful', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { id: 'irritable', label: 'Irritable', color: 'bg-rose-100 border-rose-300 text-rose-700' },
  { id: 'lonely', label: 'Lonely', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
  { id: 'confident', label: 'Confident', color: 'bg-teal-100 border-teal-300 text-teal-700' },
]

export default function MoodPage() {
  const [selectedScore, setSelectedScore] = useState<number | null>(null)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<MoodEntry | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('bloompath_user')
    if (stored) {
      const user = JSON.parse(stored)
      const id = user.id || btoa(user.name + user.dueDate).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
      setUserId(id)
    }
  }, [])

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotionId)
        ? prev.filter(e => e !== emotionId)
        : [...prev, emotionId]
    )
  }

  const handleSubmit = async () => {
    if (!selectedScore || selectedEmotions.length === 0 || !userId) return

    setIsSubmitting(true)
    try {
      const entry = await submitMood(userId, selectedScore, selectedEmotions, notes || undefined)
      setResult(entry)
      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit mood:', error)
      // Show a local result as fallback
      setResult({
        id: Date.now().toString(),
        score: selectedScore,
        emotions: selectedEmotions,
        notes: notes || undefined,
        aiInsight: "Thank you for checking in with yourself today. Your feelings are valid, and taking time to reflect is an important part of self-care during your pregnancy journey. Remember, you're doing an amazing job.",
        createdAt: new Date().toISOString()
      })
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedScore(null)
    setSelectedEmotions([])
    setNotes('')
    setSubmitted(false)
    setResult(null)
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

  if (submitted && result) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-cream-50">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-medium p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="text-6xl mb-5">
                {MOOD_EMOJIS.find(m => m.score === result.score)?.emoji}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-earth-700">
                Thanks for checking in!
              </h2>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-br from-sage-50 to-cream-50 rounded-2xl p-6 mb-8 border border-sage-100 shadow-soft">
              <div className="flex items-start gap-4">
                <Logo size="md" />
                <div>
                  <p className="text-sm font-bold text-sage-700 mb-2 uppercase tracking-wide">BloomPath says:</p>
                  <p className="text-earth-700 leading-relaxed">{result.aiInsight}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-earth-600 mb-4 uppercase tracking-wide">Your feelings today:</h3>
              <div className="flex flex-wrap gap-2">
                {result.emotions.map((emotion) => {
                  const emotionData = EMOTIONS.find(e => e.id === emotion)
                  return (
                    <span
                      key={emotion}
                      className={`px-4 py-2 rounded-full text-sm border-2 font-medium shadow-soft ${emotionData?.color || 'bg-cream-100 border-earth-100 text-earth-700'}`}
                    >
                      {emotionData?.label || emotion}
                    </span>
                  )
                })}
              </div>
            </div>

            {result.notes && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-earth-600 mb-3 uppercase tracking-wide">Your notes:</h3>
                <p className="text-earth-700 bg-cream-50 rounded-2xl p-4 text-sm leading-relaxed border border-earth-100">
                  {result.notes}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetForm}
                className="flex-1 px-6 py-4 border-2 border-earth-200 rounded-2xl text-earth-700 hover:bg-cream-50 transition-smooth font-semibold shadow-soft"
              >
                Log Another Entry
              </button>
              <a
                href="/insights"
                className="flex-1 px-6 py-4 bg-sage-400 text-white rounded-2xl text-center hover:bg-sage-500 transition-smooth font-semibold shadow-medium"
              >
                View Insights
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-cream-50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-earth-700 mb-3">Daily Check-in</h1>
          <p className="text-lg text-earth-600">How are you feeling right now?</p>
        </div>

        <div className="bg-white rounded-3xl shadow-medium p-6 md:p-10 space-y-10">
          {/* Mood Score */}
          <div>
            <h2 className="text-xl font-bold text-earth-700 mb-6">Overall Mood</h2>
            <div className="flex justify-between gap-3">
              {MOOD_EMOJIS.map(({ score, emoji, label }) => (
                <button
                  key={score}
                  onClick={() => setSelectedScore(score)}
                  className={`flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl transition-smooth border-2 ${
                    selectedScore === score
                      ? 'border-sage-400 bg-sage-50 shadow-soft'
                      : 'border-earth-100 hover:bg-cream-50 hover:border-earth-200'
                  }`}
                >
                  <span className={`text-4xl md:text-5xl transition-transform ${
                    selectedScore === score ? 'scale-110' : ''
                  }`}>
                    {emoji}
                  </span>
                  <span className="text-xs text-earth-600 font-medium hidden sm:block">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emotions */}
          <div>
            <h2 className="text-xl font-bold text-earth-700 mb-2">
              What emotions are you experiencing?
            </h2>
            <p className="text-sm text-earth-500 mb-6">(select all that apply)</p>
            <div className="flex flex-wrap gap-3">
              {EMOTIONS.map(({ id, label, color }) => (
                <button
                  key={id}
                  onClick={() => toggleEmotion(id)}
                  className={`px-5 py-2.5 rounded-full text-sm border-2 transition-smooth font-medium shadow-soft ${
                    selectedEmotions.includes(id)
                      ? `${color} border-current shadow-medium`
                      : 'bg-cream-50 border-earth-100 text-earth-700 hover:border-earth-200 hover:bg-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h2 className="text-xl font-bold text-earth-700 mb-2">
              Anything else on your mind?
            </h2>
            <p className="text-sm text-earth-500 mb-4">(optional)</p>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write a few thoughts if you'd like... Or use voice input."
                className="w-full px-5 py-4 pr-14 rounded-2xl border-2 border-earth-100 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 outline-none resize-none transition-smooth bg-cream-50 text-earth-700"
                rows={4}
              />
              <div className="absolute bottom-4 right-4">
                <VoiceInput
                  onTranscript={(text) => {
                    setNotes(prev => prev ? `${prev} ${text}` : text)
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <p className="text-xs text-earth-500 mt-3">
              Click the microphone icon to add notes using your voice (Chrome/Edge only)
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!selectedScore || selectedEmotions.length === 0 || isSubmitting}
            className="w-full py-5 bg-sage-400 text-white rounded-2xl font-semibold hover:bg-sage-500 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-medium hover:shadow-large text-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Submit Check-in'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
