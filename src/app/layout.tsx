import type { Metadata } from 'next'
import './globals.css'
import { Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import { AppChrome } from '@/components/AppChrome'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wavering Wanderers | AI tools for independent artists',
  description:
    'AI-powered creative tools for independent artists to build clarity, consistency, and momentum.',
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
        <AppChrome />
        {children}

        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}