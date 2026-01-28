import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

type CalendarAddBody = {
  date: string // 'YYYY-MM-DD'
  post_time?: string | null // 'HH:MM' or 'HH:MM:SS'
  platform: string
  title: string
  details?: string
  notes?: string
  caption?: string
  hashtags?: string[]
  hook?: string
  call_to_action?: string
  angle?: string
  assets?: unknown
  context?: unknown
  starts_at?: string | null // ISO timestamp if you ever use it
}

function isCalendarAddBody(x: unknown): x is CalendarAddBody {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>

  const isStringOrUndef = (v: unknown) => v === undefined || typeof v === 'string'
  const isStringNullOrUndef = (v: unknown) => v === undefined || v === null || typeof v === 'string'
  const isStringArrayOrUndef = (v: unknown) =>
    v === undefined || (Array.isArray(v) && v.every(i => typeof i === 'string'))

  return (
    typeof o.date === 'string' &&
    typeof o.platform === 'string' &&
    typeof o.title === 'string' &&
    isStringNullOrUndef(o.post_time) &&
    isStringOrUndef(o.details) &&
    isStringOrUndef(o.notes) &&
    isStringOrUndef(o.caption) &&
    isStringArrayOrUndef(o.hashtags) &&
    isStringOrUndef(o.hook) &&
    isStringOrUndef(o.call_to_action) &&
    isStringOrUndef(o.angle) &&
    (o.starts_at === undefined || o.starts_at === null || typeof o.starts_at === 'string')
  )
}

export async function POST(req: Request) {
  try {
    const raw = (await req.json()) as unknown

    if (!isCalendarAddBody(raw)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid body. Required: date, platform, title' },
        { status: 400 }
      )
    }

    const {
      date,
      post_time = null,
      platform,
      title,
      details = '',
      notes,
      caption,
      hashtags,
      hook,
      call_to_action,
      angle,
      assets,
      context,
      starts_at = null,
    } = raw

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.from('calendar_items').insert([
      {
        date,
        post_time,
        platform,
        title,
        details,
        notes: notes ?? null,
        caption: caption ?? null,
        hashtags: hashtags ?? null,
        hook: hook ?? null,
        call_to_action: call_to_action ?? null,
        angle: angle ?? null,
        assets: assets ?? null,
        context: context ?? null,
        starts_at,
      },
    ])

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error'
    console.error('[calendar/add]', e)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
