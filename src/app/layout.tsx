import type { Metadata } from 'next'
import './globals.css'
import { Space_Grotesk } from 'next/font/google'
import { TopNav } from '@/components/TopNav'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wavering Wanderers',
  description: 'AI-crafted creativity for independent artists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} font-sans bg-ww-bg text-ww-text`}
      >
        {/* Global nav with conditional logout */}
        <TopNav />

        {/* Page content */}
        {children}
      </body>
    </html>
  )
}
