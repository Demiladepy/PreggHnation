'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 md:w-12 md:h-12',
    lg: 'w-20 h-20 md:w-28 md:h-28'
  }

  if (imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-2xl bg-sage-200 flex items-center justify-center shadow-soft ${className}`}>
        <span className="text-xl md:text-2xl">🌸</span>
      </div>
    )
  }

  return (
    <div className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden bg-transparent shadow-soft ${className}`}>
      <Image
        src="/assets/logo.png"
        alt="BloomPath Logo"
        fill
        className="object-contain"
        priority
        onError={() => setImageError(true)}
      />
    </div>
  )
}
