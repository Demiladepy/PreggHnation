'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌸</span>
            <span className="font-semibold text-bloom-700 hidden sm:inline">BloomPath</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                  pathname === link.href
                    ? 'bg-bloom-100 text-bloom-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
