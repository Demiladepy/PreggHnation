'use client'

import { useState } from 'react'

const RESOURCES = [
  { 
    name: "National Suicide Prevention Lifeline", 
    number: "988", 
    description: "24/7 crisis support - call or text" 
  },
  { 
    name: "Postpartum Support International", 
    number: "1-800-944-4773", 
    description: "Specialized perinatal mental health support" 
  },
  { 
    name: "Crisis Text Line", 
    number: "Text HOME to 741741", 
    description: "Text-based crisis support" 
  },
  { 
    name: "SAMHSA National Helpline", 
    number: "1-800-662-4357", 
    description: "Free, confidential, 24/7 mental health support" 
  },
]

interface CrisisResourcesProps {
  variant?: 'full' | 'compact' | 'banner'
  showToggle?: boolean
}

export default function CrisisResources({ variant = 'full', showToggle = false }: CrisisResourcesProps) {
  const [isExpanded, setIsExpanded] = useState(!showToggle)

  if (variant === 'banner') {
    return (
      <div className="bg-peach-50 border-t border-peach-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
          <span className="text-earth-700 font-semibold">Need immediate support?</span>
          <a href="tel:988" className="text-sage-600 hover:text-sage-700 font-medium">
            988 (Suicide Prevention)
          </a>
          <span className="text-earth-300">|</span>
          <a href="tel:1-800-944-4773" className="text-sage-600 hover:text-sage-700 font-medium">
            1-800-944-4773 (Postpartum Support)
          </a>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="bg-peach-50 rounded-2xl p-4 border border-peach-200 shadow-soft">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-xl">💛</span>
          <span className="text-earth-700">
            Need help? <a href="tel:988" className="font-semibold text-sage-600 hover:text-sage-700 underline">Call 988</a> or{' '}
            <a href="tel:1-800-944-4773" className="font-semibold text-sage-600 hover:text-sage-700 underline">1-800-944-4773</a>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-peach-50 rounded-3xl border border-peach-200 overflow-hidden shadow-soft">
      {showToggle && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-peach-100 transition-smooth"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">💛</span>
            <span className="font-semibold text-earth-700">Crisis Resources</span>
          </div>
          <svg 
            className={`w-5 h-5 text-sage-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      
      {isExpanded && (
        <div className={`p-5 ${showToggle ? 'pt-0' : ''}`}>
          {!showToggle && (
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">💛</span>
              <span className="font-semibold text-earth-700">Need Immediate Support?</span>
            </div>
          )}
          <p className="text-sm text-earth-600 mb-5">
            If you&apos;re in crisis or having thoughts of harming yourself, please reach out:
          </p>
          <div className="space-y-3">
            {RESOURCES.map((resource, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-soft">
                <span className="text-xl">📞</span>
                <div>
                  <p className="font-semibold text-earth-700 text-sm mb-1">{resource.name}</p>
                  <p className="text-sage-600 font-bold text-base">{resource.number}</p>
                  <p className="text-xs text-earth-500 mt-1">{resource.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
