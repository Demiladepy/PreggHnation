'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'

export default function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/chat', label: 'Chat', icon: '💬' },
    { href: '/mood', label: 'Check-in', icon: '📝' },
    { href: '/screening', label: 'Screening', icon: '🩺' },
    { href: '/partner', label: 'Partner', icon: '💑' },
    { href: '/insights', label: 'Insights', icon: '📊' },
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-soft border-b border-earth-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="group-hover:bg-sage-200 transition-smooth">
              <Logo size="md" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-earth-700 text-lg">BLOOMPATH</span>
              <span className="block text-xs text-earth-500 font-normal">Wellness Companion</span>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-smooth ${
                  pathname === link.href
                    ? 'bg-sage-100 text-sage-700 shadow-soft'
                    : 'text-earth-600 hover:bg-cream-50'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
