'use client'

import { usePathname } from 'next/navigation'
import { TopNav } from '@/components/TopNav'

export function AppChrome() {
  const pathname = usePathname()

  // Hide the global nav on the landing page only
  if (pathname === '/') return null

  return <TopNav />
}