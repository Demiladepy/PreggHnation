'use client'

import { useState, useEffect } from 'react'
import { getInsights, MoodEntry, MoodStats, getEPDSHistory, EPDSScreening } from '@/lib/api'
import MoodChart from '@/components/MoodChart'

interface InsightsData extends MoodStats {
  entries: MoodEntry[]
}

const EMOTION_LABELS: Record<string, string> = {
  anxious: 'Anxious',
  hopeful: 'Hopeful',
  tired: 'Tired',
  happy: 'Happy',
  overwhelmed: 'Overwhelmed',
  calm: 'Calm',
  excited: 'Excited',
  worried: 'Worried',
  grateful: 'Grateful',
  irritable: 'Irritable',
  lonely: 'Lonely',
  confident: 'Confident',
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [epdsHistory, setEpdsHistory] = useState<EPDSScreening[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('bloompath_user')
    if (stored) {
      const user = JSON.parse(stored)
      const id = user.id || btoa(user.name + user.dueDate).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
      setUserId(id)
    }
  }, [])

  useEffect(() => {
    if (userId) {
      loadInsights()
    }
  }, [userId])

  const loadInsights = async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const data = await getInsights(userId)
      setInsights(data as InsightsData)
      
      // Load EPDS history
      try {
        const history = await getEPDSHistory(userId)
        setEpdsHistory(history)
      } catch (error) {
        console.error('Failed to load EPDS history:', error)
      }
    } catch (error) {
      console.error('Failed to load insights:', error)
      // Set empty state
      setInsights({
        entries: [],
        stats: {
          averageScore: 0,
          totalEntries: 0,
          topEmotions: [],
          concerningPattern: false
        },
        aiSummary: "Start tracking your mood to see personalized insights here. Even a quick daily check-in can help you understand your emotional patterns during pregnancy.",
        epdsData: null
      })
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-bloom-200 border-t-bloom-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your insights...</p>
        </div>
      </div>
    )
  }

  const getMoodLabel = (score: number): string => {
    if (score >= 4.5) return "Excellent"
    if (score >= 3.5) return "Good"
    if (score >= 2.5) return "Moderate"
    if (score >= 1.5) return "Low"
    return "Very Low"
  }

  const getMoodColor = (score: number): string => {
    if (score >= 4) return "text-green-600"
    if (score >= 3) return "text-yellow-600"
    if (score >= 2) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Wellness Insights</h1>
          <p className="text-gray-600">
            {insights?.weekNumber 
              ? `Week ${insights.weekNumber} of your pregnancy journey`
              : "Track your emotional patterns over time"
            }
          </p>
        </div>

        {/* Concerning Pattern Alert */}
        {insights?.stats.concerningPattern && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💛</span>
              <div>
                <p className="font-medium text-amber-800">We've noticed some patterns</p>
                <p className="text-sm text-amber-700 mt-1">
                  Your mood has been lower than usual lately. This is common during pregnancy, but if you're struggling, 
                  please consider reaching out to your healthcare provider. You don't have to go through this alone.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Mood */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Mood</h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getMoodColor(insights?.stats.averageScore || 0)}`}>
                {insights?.stats.averageScore?.toFixed(1) || '-'}
              </span>
              <span className="text-gray-500">/5</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {insights?.stats.averageScore ? getMoodLabel(insights.stats.averageScore) : 'No data yet'}
            </p>
          </div>

          {/* Total Check-ins */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Check-ins This Week</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-bloom-600">
                {insights?.stats.totalEntries || 0}
              </span>
              <span className="text-gray-500">entries</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {(insights?.stats.totalEntries || 0) >= 5 ? 'Great consistency!' : 'Keep tracking daily'}
            </p>
          </div>

          {/* EPDS Score */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Latest EPDS Score</h3>
            {insights?.epdsData ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${
                    insights.epdsData.totalScore >= 13 ? 'text-red-600' :
                    insights.epdsData.totalScore >= 10 ? 'text-amber-600' :
                    'text-green-600'
                  }`}>
                    {insights.epdsData.totalScore}
                  </span>
                  <span className="text-gray-500">/30</span>
                </div>
                <p className={`text-sm mt-1 font-medium ${
                  insights.epdsData.riskLevel === 'high' ? 'text-red-600' :
                  insights.epdsData.riskLevel === 'moderate' ? 'text-amber-600' :
                  'text-green-600'
                }`}>
                  {insights.epdsData.riskLevel === 'high' ? 'Elevated Risk' :
                   insights.epdsData.riskLevel === 'moderate' ? 'Borderline' :
                   'Low Risk'}
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-2">No screening yet</p>
                <a
                  href="/screening"
                  className="text-bloom-600 hover:text-bloom-700 text-sm font-medium"
                >
                  Take Screening →
                </a>
              </>
            )}
          </div>

          {/* Top Emotion */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Most Common Feeling</h3>
            {insights?.stats.topEmotions?.[0] ? (
              <>
                <p className="text-2xl font-bold text-sage-600">
                  {EMOTION_LABELS[insights.stats.topEmotions[0].emotion] || insights.stats.topEmotions[0].emotion}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Felt {insights.stats.topEmotions[0].count} times
                </p>
              </>
            ) : (
              <p className="text-gray-400">No data yet</p>
            )}
          </div>
        </div>

        {/* Mood Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Over Time</h3>
          {insights && insights.entries.length > 0 ? (
            <MoodChart entries={insights.entries} />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="mb-2">No mood data yet</p>
                <a href="/mood" className="text-bloom-600 hover:text-bloom-700 text-sm font-medium">
                  Log your first check-in →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* AI Summary */}
        <div className="bg-gradient-to-r from-bloom-50 to-sage-50 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-2xl flex-shrink-0">
              🌸
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">BloomPath Weekly Summary</h3>
              <p className="text-gray-700 leading-relaxed">{insights?.aiSummary}</p>
            </div>
          </div>
        </div>

        {/* EPDS History */}
        {epdsHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">EPDS Screening History</h3>
            <div className="space-y-3">
              {epdsHistory.slice(0, 5).map((screening) => (
                <div key={screening.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      screening.totalScore >= 13 ? 'bg-red-500' :
                      screening.totalScore >= 10 ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}>
                      {screening.totalScore}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Score: {screening.totalScore}/30
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(screening.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    screening.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                    screening.riskLevel === 'moderate' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {screening.riskLevel === 'high' ? 'Elevated' :
                     screening.riskLevel === 'moderate' ? 'Borderline' :
                     'Low Risk'}
                  </span>
                </div>
              ))}
            </div>
            {epdsHistory.length > 5 && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                Showing 5 most recent screenings
              </p>
            )}
          </div>
        )}

        {/* Top Emotions List */}
        {insights?.stats.topEmotions && insights.stats.topEmotions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Emotions This Week</h3>
            <div className="space-y-3">
              {insights.stats.topEmotions.map(({ emotion, count }) => (
                <div key={emotion} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {EMOTION_LABELS[emotion] || emotion}
                      </span>
                      <span className="text-sm text-gray-500">{count} times</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-bloom-400 to-bloom-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (count / (insights.stats.totalEntries || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <a
            href="/mood"
            className="inline-flex items-center gap-2 px-6 py-3 bg-bloom-500 text-white rounded-xl font-medium hover:bg-bloom-600 transition-smooth shadow-md"
          >
            <span>📝</span>
            Log Today's Check-in
          </a>
        </div>
      </div>
    </div>
  )
}
