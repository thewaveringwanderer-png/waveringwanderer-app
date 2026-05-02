import { useEffect, useState } from 'react'

const DEFAULT_MESSAGES = [
  'Gathering your inputs...',
  'Understanding your style...',
  'Finding fresh angles...',
  'Shaping your results...',
  'Building something strong...',
]

export function useGeneratingMessages(active: boolean, messages = DEFAULT_MESSAGES) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active) {
      setIndex(0)
      return
    }

    const interval = window.setInterval(() => {
      setIndex(prev => (prev + 1) % messages.length)
    }, 1600)

    return () => window.clearInterval(interval)
  }, [active, messages.length])

  return messages[index]
}