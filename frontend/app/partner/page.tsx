'use client'

import { useState, useEffect } from 'react'
import { generatePartnerMessage } from '@/lib/api'

export default function PartnerPage() {
  const [concern, setConcern] = useState('')
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('bloompath_user')
    if (stored) {
      const user = JSON.parse(stored)
      const id = user.id || btoa(user.name + user.dueDate).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
      setUserId(id)
    }
  }, [])

  const handleGenerate = async () => {
    if (!concern.trim() || !userId) return

    setIsGenerating(true)
    setCopied(false)
    try {
      const result = await generatePartnerMessage(userId, concern)
      setGeneratedMessage(result.message)
    } catch (error) {
      console.error('Failed to generate message:', error)
      // Fallback message
      setGeneratedMessage(`I wanted to share something with you that's been on my mind. ${concern}\n\nI know pregnancy can be challenging for both of us, and I want us to be able to talk about what I'm experiencing. I'd really appreciate your support and understanding right now.\n\nCan we find a good time to talk about this? I value our connection and want to make sure we're both feeling supported through this journey.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedMessage) return
    try {
      await navigator.clipboard.writeText(generatedMessage)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleReset = () => {
    setConcern('')
    setGeneratedMessage(null)
    setCopied(false)
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
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Partner Communication Helper</h1>
          <p className="text-gray-600">
            Need help explaining your feelings? We&apos;ll help you craft a thoughtful message.
          </p>
        </div>

        {!generatedMessage ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="mb-6">
              <label htmlFor="concern" className="block text-sm font-medium text-gray-700 mb-2">
                What would you like help explaining to your partner?
              </label>
              <textarea
                id="concern"
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                placeholder="For example: 'I've been feeling really anxious about labor and I'm having trouble sleeping. I need more support but I don't know how to ask for it.'"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-bloom-400 focus:ring-2 focus:ring-bloom-200 outline-none resize-none transition-smooth"
                rows={6}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Tips for effective communication:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use &quot;I&quot; statements to express your feelings</li>
                <li>• Be specific about what you need</li>
                <li>• Acknowledge that this journey affects both of you</li>
                <li>• Invite conversation rather than making demands</li>
              </ul>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!concern.trim() || isGenerating}
              className="w-full py-4 bg-gradient-to-r from-bloom-500 to-bloom-600 text-white rounded-xl font-medium hover:from-bloom-600 hover:to-bloom-700 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Message'
              )}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Message</h2>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {generatedMessage}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button
                onClick={handleCopy}
                className="flex-1 px-4 py-3 bg-bloom-500 text-white rounded-xl font-medium hover:bg-bloom-600 transition-smooth flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Message
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-smooth"
              >
                Create Another
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-medium text-green-800 mb-2">Next Steps:</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Copy the message and share it with your partner</li>
                <li>• Choose a good time when you both can talk</li>
                <li>• Be open to their response and questions</li>
                <li>• Remember: communication is a two-way conversation</li>
              </ul>
            </div>
          </div>
        )}

        {/* Quick Examples */}
        {!generatedMessage && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Example Topics:</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "I'm feeling overwhelmed and need more help around the house",
                "I'm scared about labor and need reassurance",
                "I'm having trouble sleeping and it's affecting my mood",
                "I feel like you don't understand what I'm going through",
                "I need more emotional support during this pregnancy",
                "I'm worried about how things will change after the baby"
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setConcern(example)}
                  className="text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-smooth border border-transparent hover:border-gray-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
