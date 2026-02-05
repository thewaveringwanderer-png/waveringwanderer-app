// src/components/ww/LimitReachedPill.tsx
'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'

type Props = {
  title?: string
  message: string
  buttonLabel?: string
  onUpgrade: () => void
  className?: string
}

export default function LimitReachedPill({
  title = 'FREE LIMIT REACHED',
  message,
  buttonLabel = 'Upgrade',
  onUpgrade,
  className = '',
}: Props) {
  return (
    <div
      className={
        'w-full rounded-2xl border border-white/12 bg-black/50 px-4 py-3 flex items-center justify-between gap-3 ' +
        className
      }
    >
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">{title}</p>
        <p className="text-sm text-white/80 mt-1 truncate">{message}</p>
      </div>

      <button
        type="button"
        onClick={onUpgrade}
        className="shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-full bg-ww-violet text-white text-sm font-semibold shadow-[0_0_18px_rgba(186,85,211,0.7)] hover:shadow-[0_0_24px_rgba(186,85,211,0.9)] active:scale-95 transition"
      >
        {buttonLabel}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
