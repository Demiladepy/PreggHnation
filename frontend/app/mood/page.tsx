'use client'

import { useState, useEffect } from 'react'
import { submitMood, MoodEntry } from '@/lib/api'
import VoiceInput from '@/components/VoiceInput'

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
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">
                {MOOD_EMOJIS.find(m => m.score === result.score)?.emoji}
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Thanks for checking in!
              </h2>
            </div>

            {/* AI Insight */}
            <div className="bg-gradient-to-r from-bloom-50 to-sage-50 rounded-xl p-5 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌸</span>
                <div>
                  <p className="text-sm font-medium text-bloom-700 mb-2">BloomPath says:</p>
                  <p className="text-gray-700">{result.aiInsight}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Your feelings today:</h3>
              <div className="flex flex-wrap gap-2">
                {result.emotions.map((emotion) => {
                  const emotionData = EMOTIONS.find(e => e.id === emotion)
                  return (
                    <span
                      key={emotion}
                      className={`px-3 py-1 rounded-full text-sm border ${emotionData?.color || 'bg-gray-100'}`}
                    >
                      {emotionData?.label || emotion}
                    </span>
                  )
                })}
              </div>
            </div>

            {result.notes && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Your notes:</h3>
                <p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">
                  {result.notes}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-smooth"
              >
                Log Another Entry
              </button>
              <a
                href="/insights"
                className="flex-1 px-4 py-3 bg-bloom-500 text-white rounded-xl text-center hover:bg-bloom-600 transition-smooth"
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
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Daily Check-in</h1>
          <p className="text-gray-600">How are you feeling right now?</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">
          {/* Mood Score */}
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">Overall Mood</h2>
            <div className="flex justify-between gap-2">
              {MOOD_EMOJIS.map(({ score, emoji, label }) => (
                <button
                  key={score}
                  onClick={() => setSelectedScore(score)}
                  className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-smooth border-2 ${
                    selectedScore === score
                      ? 'border-bloom-400 bg-bloom-50'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-3xl md:text-4xl transition-transform ${
                    selectedScore === score ? 'scale-110' : ''
                  }`}>
                    {emoji}
                  </span>
                  <span className="text-xs text-gray-600 hidden sm:block">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emotions */}
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              What emotions are you experiencing?
              <span className="text-sm font-normal text-gray-500 ml-2">(select all that apply)</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map(({ id, label, color }) => (
                <button
                  key={id}
                  onClick={() => toggleEmotion(id)}
                  className={`px-4 py-2 rounded-full text-sm border-2 transition-smooth ${
                    selectedEmotions.includes(id)
                      ? `${color} border-current`
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">
              Anything else on your mind?
              <span className="text-sm font-normal text-gray-500 ml-2">(optional)</span>
            </h2>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write a few thoughts if you'd like... Or use voice input."
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-bloom-400 focus:ring-2 focus:ring-bloom-200 outline-none resize-none transition-smooth"
                rows={4}
              />
              <div className="absolute bottom-3 right-3">
                <VoiceInput
                  onTranscript={(text) => {
                    setNotes(prev => prev ? `${prev} ${text}` : text)
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click the microphone icon to add notes using your voice (Chrome/Edge only)
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!selectedScore || selectedEmotions.length === 0 || isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-bloom-500 to-bloom-600 text-white rounded-xl font-medium hover:from-bloom-600 hover:to-bloom-700 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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
