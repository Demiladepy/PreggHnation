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
      <div className="bg-amber-50 border-t border-amber-200 px-4 py-2">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
          <span className="text-amber-800 font-medium">Need immediate support?</span>
          <a href="tel:988" className="text-amber-700 hover:text-amber-900">
            988 (Suicide Prevention)
          </a>
          <span className="text-amber-400">|</span>
          <a href="tel:1-800-944-4773" className="text-amber-700 hover:text-amber-900">
            1-800-944-4773 (Postpartum Support)
          </a>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
        <div className="flex items-center gap-2 text-sm">
          <span>💛</span>
          <span className="text-amber-800">
            Need help? <a href="tel:988" className="font-semibold underline">Call 988</a> or{' '}
            <a href="tel:1-800-944-4773" className="font-semibold underline">1-800-944-4773</a>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
      {showToggle && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-amber-100 transition-smooth"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">💛</span>
            <span className="font-medium text-amber-800">Crisis Resources</span>
          </div>
          <svg 
            className={`w-5 h-5 text-amber-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      
      {isExpanded && (
        <div className={`p-4 ${showToggle ? 'pt-0' : ''}`}>
          {!showToggle && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💛</span>
              <span className="font-medium text-amber-800">Need Immediate Support?</span>
            </div>
          )}
          <p className="text-sm text-amber-700 mb-4">
            If you&apos;re in crisis or having thoughts of harming yourself, please reach out:
          </p>
          <div className="space-y-3">
            {RESOURCES.map((resource, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3">
                <span className="text-lg">📞</span>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{resource.name}</p>
                  <p className="text-bloom-600 font-semibold">{resource.number}</p>
                  <p className="text-xs text-gray-500">{resource.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
