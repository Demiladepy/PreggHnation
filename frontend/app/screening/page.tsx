'use client'

import { useState, useEffect } from 'react'
import { submitEPDS, EPDSScreening } from '@/lib/api'

// Edinburgh Postnatal Depression Scale (EPDS) Questions
const EPDS_QUESTIONS = [
  {
    id: 1,
    question: "I have been able to laugh and see the funny side of things",
    options: [
      { value: 0, label: "As much as I always could" },
      { value: 1, label: "Not quite so much now" },
      { value: 2, label: "Definitely not so much now" },
      { value: 3, label: "Not at all" }
    ]
  },
  {
    id: 2,
    question: "I have looked forward with enjoyment to things",
    options: [
      { value: 0, label: "As much as I ever did" },
      { value: 1, label: "Rather less than I used to" },
      { value: 2, label: "Definitely less than I used to" },
      { value: 3, label: "Hardly at all" }
    ]
  },
  {
    id: 3,
    question: "I have blamed myself unnecessarily when things went wrong",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, some of the time" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, never" }
    ]
  },
  {
    id: 4,
    question: "I have been anxious or worried for no good reason",
    options: [
      { value: 0, label: "No, not at all" },
      { value: 1, label: "Hardly ever" },
      { value: 2, label: "Yes, sometimes" },
      { value: 3, label: "Yes, very often" }
    ]
  },
  {
    id: 5,
    question: "I have felt scared or panicky for no very good reason",
    options: [
      { value: 3, label: "Yes, quite a lot" },
      { value: 2, label: "Yes, sometimes" },
      { value: 1, label: "No, not much" },
      { value: 0, label: "No, not at all" }
    ]
  },
  {
    id: 6,
    question: "Things have been getting on top of me",
    options: [
      { value: 3, label: "Yes, most of the time I haven't been able to cope at all" },
      { value: 2, label: "Yes, sometimes I haven't been coping as well as usual" },
      { value: 1, label: "No, most of the time I have coped quite well" },
      { value: 0, label: "No, I have been coping as well as ever" }
    ]
  },
  {
    id: 7,
    question: "I have been so unhappy that I have had difficulty sleeping",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, sometimes" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, not at all" }
    ]
  },
  {
    id: 8,
    question: "I have felt sad or miserable",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, quite often" },
      { value: 1, label: "Not very often" },
      { value: 0, label: "No, not at all" }
    ]
  },
  {
    id: 9,
    question: "I have been so unhappy that I have been crying",
    options: [
      { value: 3, label: "Yes, most of the time" },
      { value: 2, label: "Yes, quite often" },
      { value: 1, label: "Only occasionally" },
      { value: 0, label: "No, never" }
    ]
  },
  {
    id: 10,
    question: "The thought of harming myself has occurred to me",
    options: [
      { value: 3, label: "Yes, quite often" },
      { value: 2, label: "Sometimes" },
      { value: 1, label: "Hardly ever" },
      { value: 0, label: "Never" }
    ],
    isCritical: true
  }
]

const CRISIS_RESOURCES = [
  { name: "National Suicide Prevention Lifeline", number: "988", description: "Call or text 24/7" },
  { name: "Postpartum Support International", number: "1-800-944-4773", description: "Specialized perinatal support" },
  { name: "Crisis Text Line", number: "Text HOME to 741741", description: "Text-based crisis support" },
]

export default function ScreeningPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(10).fill(null))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<EPDSScreening | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [showCrisisWarning, setShowCrisisWarning] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('bloompath_user')
    if (stored) {
      const user = JSON.parse(stored)
      const id = user.id || btoa(user.name + user.dueDate).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
      setUserId(id)
    }
  }, [])

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)

    // Check for self-harm question
    if (currentQuestion === 9 && value > 0) {
      setShowCrisisWarning(true)
    }

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentQuestion < 9) {
        setCurrentQuestion(currentQuestion + 1)
      }
    }, 300)
  }

  const handleSubmit = async () => {
    if (!userId || answers.some(a => a === null)) return

    setIsSubmitting(true)
    try {
      const screening = await submitEPDS(userId, answers as number[])
      setResult(screening)
    } catch (error) {
      console.error('Failed to submit screening:', error)
      // Calculate locally as fallback
      const totalScore = answers.reduce((sum, a) => sum! + (a || 0), 0) as number
      setResult({
        id: Date.now().toString(),
        totalScore,
        itemScores: answers as number[],
        riskLevel: totalScore >= 13 ? 'high' : totalScore >= 10 ? 'moderate' : 'low',
        aiInsight: totalScore >= 13 
          ? "Your score suggests you may be experiencing symptoms of depression. This is treatable, and we encourage you to speak with your healthcare provider soon."
          : totalScore >= 10
          ? "Your score is in the borderline range. Consider discussing these results with your healthcare provider."
          : "Your score is within the normal range. Continue with self-care and reach out if things change.",
        createdAt: new Date().toISOString()
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetScreening = () => {
    setCurrentQuestion(0)
    setAnswers(new Array(10).fill(null))
    setResult(null)
    setShowCrisisWarning(false)
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

  // Crisis warning modal
  if (showCrisisWarning && !result) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 md:p-8">
            <div className="text-center mb-6">
              <span className="text-4xl">💛</span>
              <h2 className="text-xl font-semibold text-amber-800 mt-4">
                We Care About You
              </h2>
            </div>
            
            <p className="text-amber-900 mb-6">
              We noticed you indicated having thoughts of self-harm. These feelings are more common than you might think, 
              and help is available. Please know that you&apos;re not alone, and these feelings can get better with support.
            </p>

            <div className="bg-white rounded-xl p-4 mb-6">
              <h3 className="font-medium text-gray-800 mb-3">Please reach out now:</h3>
              <div className="space-y-3">
                {CRISIS_RESOURCES.map((resource, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xl">📞</span>
                    <div>
                      <p className="font-medium text-gray-800">{resource.name}</p>
                      <p className="text-bloom-600 font-semibold">{resource.number}</p>
                      <p className="text-sm text-gray-500">{resource.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowCrisisWarning(false)}
                className="flex-1 px-4 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-smooth"
              >
                Continue Screening
              </button>
              <a
                href="/chat"
                className="flex-1 px-4 py-3 border border-amber-300 text-amber-700 rounded-xl text-center hover:bg-amber-50 transition-smooth"
              >
                Talk to BloomPath
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Results page
  if (result) {
    const getRiskColor = (level: string) => {
      switch (level) {
        case 'high': return 'text-red-600 bg-red-50 border-red-200'
        case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-200'
        default: return 'text-green-600 bg-green-50 border-green-200'
      }
    }

    const getRiskLabel = (level: string) => {
      switch (level) {
        case 'high': return 'Elevated Risk'
        case 'moderate': return 'Borderline'
        default: return 'Low Risk'
      }
    }

    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Screening Complete</h2>
              <p className="text-gray-600 mt-2">Edinburgh Postnatal Depression Scale</p>
            </div>

            {/* Score Display */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-bloom-600">{result.totalScore}</div>
                <div className="text-gray-500">/30</div>
              </div>
              <div className={`px-4 py-2 rounded-full border-2 ${getRiskColor(result.riskLevel)}`}>
                <span className="font-medium">{getRiskLabel(result.riskLevel)}</span>
              </div>
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

            {/* Score Interpretation */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Understanding Your Score:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-gray-600">0-9: Low risk - Continue self-care</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-gray-600">10-12: Borderline - Consider speaking with provider</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-gray-600">13+: Elevated - Please contact healthcare provider</span>
                </div>
              </div>
            </div>

            {/* Crisis Resources (always show if high risk) */}
            {result.riskLevel === 'high' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-amber-800 mb-3">Support Resources:</h3>
                <div className="space-y-2">
                  {CRISIS_RESOURCES.map((resource, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium text-amber-900">{resource.name}:</span>{' '}
                      <span className="text-amber-700">{resource.number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Important:</strong> The EPDS is a screening tool, not a diagnosis. 
                Only a qualified healthcare professional can diagnose perinatal depression. 
                If you&apos;re concerned about your mental health, please reach out to your doctor or midwife.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={resetScreening}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-smooth"
              >
                Take Again
              </button>
              <a
                href="/insights"
                className="flex-1 px-4 py-3 bg-bloom-500 text-white rounded-xl text-center hover:bg-bloom-600 transition-smooth"
              >
                View All Insights
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Questionnaire
  const progress = ((currentQuestion + 1) / 10) * 100
  const question = EPDS_QUESTIONS[currentQuestion]
  const canSubmit = answers.every(a => a !== null)

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mental Health Screening</h1>
          <p className="text-gray-600 mt-1">Edinburgh Postnatal Depression Scale (EPDS)</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {currentQuestion + 1} of 10</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-bloom-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <p className="text-sm text-gray-500 mb-2">In the past 7 days:</p>
          <h2 className="text-lg md:text-xl font-medium text-gray-800 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-smooth ${
                  answers[currentQuestion] === option.value
                    ? 'border-bloom-400 bg-bloom-50 text-bloom-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {question.isCritical && (
            <p className="text-sm text-gray-500 mt-4 italic">
              Your answer to this question is important to us. Please answer honestly - we&apos;re here to help.
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          
          {currentQuestion < 9 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={answers[currentQuestion] === null}
              className="flex-1 px-4 py-3 bg-bloom-500 text-white rounded-xl hover:bg-bloom-600 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="flex-1 px-4 py-3 bg-bloom-500 text-white rounded-xl hover:bg-bloom-600 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Get Results'}
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            <strong>About this screening:</strong> The EPDS is a validated tool used worldwide to screen for 
            perinatal depression. It takes about 5 minutes and asks about your feelings over the past 7 days. 
            Your responses are confidential.
          </p>
        </div>
      </div>
    </div>
  )
}
