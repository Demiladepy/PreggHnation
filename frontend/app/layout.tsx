import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import CrisisResources from '@/components/CrisisResources'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BloomPath - Your Pregnancy Wellness Companion',
  description: 'AI-powered mental health and wellness support for your pregnancy journey',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <footer className="mt-auto">
            <CrisisResources variant="banner" />
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-4">
              <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
                <p>BloomPath is designed to support, not replace, professional mental health care.</p>
                <p className="mt-1">If you&apos;re struggling, please reach out to your healthcare provider.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
