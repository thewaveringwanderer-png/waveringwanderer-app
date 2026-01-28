// src/app/api/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

type CalItem = {
  id: string
  date: string // YYYY-MM-DD
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter' | 'Facebook' | 'Other'
  title: string
  caption?: string
  hashtags?: string[]
}

/**
 * Distribute N items across the 7-day range starting from weekStartISO.
 */
function distributeAcrossWeek(weekStartISO: string, count: number) {
  const start = new Date(weekStartISO)
  const days: string[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
  const picks: string[] = []
  for (let i = 0; i < count; i++) {
    picks.push(days[i % days.length])
  }
  return picks
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      releaseStatus = 'unreleased',
      songTitle = '',
      lyrics = '',
      description = '',
      weekStartISO, // YYYY-MM-DD (required)
      platforms = ['Instagram', 'TikTok', 'YouTube'],
      cadencePerWeek = 7, // how many posts we want total
      brandTone = ['introspective', 'motivational', 'authentic'], // optional fallback if you want
    } = body || {}

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 })
    }
    if (!weekStartISO || isNaN(new Date(weekStartISO).getTime())) {
      return NextResponse.json({ error: 'Invalid or missing weekStartISO' }, { status: 400 })
    }

    // Build prompt
    const system = `You are a senior music marketing strategist. 
Return highly practical, platform-specific post ideas as clean JSON ONLY. 
No prose, no markdown, no backticks. 
Each post must include: platform, title (concise), caption (1-2 lines), hashtags (3-6, lowercase without spaces), and be mapped to a date within the provided week.`

    const user = {
      releaseStatus,
      songTitle,
      description,
      lyrics_excerpt: lyrics?.slice(0, 800) ?? '',
      brand_tone: brandTone,
      platforms,
      cadencePerWeek,
      guidance: {
        unreleased: 'Build curiosity, tease concepts, avoid spoilers, use prompts and questions.',
        released: 'Celebrate the release, drive streams, highlight fan reactions and key moments.'
      },
      output_schema_example: {
        items: [
          {
            date: "YYYY-MM-DD",
            platform: "Instagram",
            title: "Short post title",
            caption: "One–two sentence caption.",
            hashtags: ["newmusic", "hiphop", "artistname"]
          }
        ]
      }
    }

    // Ask model for ideas
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(user) }
      ],
      response_format: { type: 'json_object' }
    })

    let parsed: any = {}
    try {
      const raw = response.choices[0]?.message?.content ?? '{}'
      parsed = JSON.parse(raw)
    } catch {
      parsed = {}
    }

    // Normalize + fallback if needed
    const desiredCount = Math.max(3, Math.min(14, Number(cadencePerWeek) || 7))
    const dates = distributeAcrossWeek(weekStartISO, desiredCount)

    const items: CalItem[] = Array.isArray(parsed?.items)
      ? parsed.items.slice(0, desiredCount)
      : []

    // If model returned fewer than needed, top-up with simple scaffolds
    if (items.length < desiredCount) {
      const topup = desiredCount - items.length
      for (let i = 0; i < topup; i++) {
        const p = platforms[i % platforms.length] as CalItem['platform']
        items.push({
          id: crypto.randomUUID(),
          date: dates[i],
          platform: p,
          title: releaseStatus === 'released'
            ? `Highlight: ${songTitle || 'new track'}`
            : `Teaser moment${songTitle ? ` — ${songTitle}` : ''}`,
          caption: releaseStatus === 'released'
            ? `What was your first reaction to the drop?`
            : `Guess the theme…`,
          hashtags: ['newmusic', 'independent', 'artist']
        })
      }
    }

    // Map dates, ensure IDs, clamp hashtags
    const out: CalItem[] = items.map((it: any, idx: number) => ({
      id: crypto.randomUUID(),
      date: dates[idx] || dates[dates.length - 1],
      platform: (it.platform as CalItem['platform']) || (platforms[idx % platforms.length] as CalItem['platform']),
      title: String(it.title || '').slice(0, 100) || 'Post idea',
      caption: String(it.caption || '').slice(0, 300),
      hashtags: Array.isArray(it.hashtags)
        ? it.hashtags.slice(0, 6).map((h: string) => h.replace(/^#/, '').toLowerCase())
        : []
    }))

    return NextResponse.json({ items: out }, { status: 200 })
  } catch (e: any) {
    console.error('[calendar API] error', e?.message || e)
    return NextResponse.json({ error: 'Failed to generate calendar' }, { status: 500 })
  }
}
