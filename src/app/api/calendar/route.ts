// src/app/api/calendar/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey }) : null

type CalendarRequest = {
  artistName?: string
  genre?: string
  audience?: string
  goal?: string
  startDate?: string // ISO date string, e.g. "2025-11-21"
  weeks?: number // e.g. 4
  postsPerWeek?: number // e.g. 4
  platforms?: string[] // e.g. ["instagram", "tiktok"]
  lyrics?: string // optional: pasted lyrics or excerpt
  lyricsFocus?: string // optional: e.g. "chorus", "verse 2", "theme summary"
  avoidTitles?: string[]
  focusMode?: string
  releaseContext?: string
  tone?: string
  mix?: { promo: number; brand: number; community: number; bts: number; lifestyle: number }
  energyPattern?: Array<'low' | 'medium' | 'high'>
  noveltySeed?: string
}

export type CalendarItem = {
  date: string // ISO date
  platform: string
  title: string
  short_label: string
  pillar: string
  format: string
  idea: string
  suggested_caption: string
  angle: string
  cta: string
}

type CalendarResponse = {
  items: CalendarItem[]
}

function addDaysIso(startIso: string, n: number) {
  const d = new Date(startIso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function fallbackCalendar(args: {
  startDate: string
  totalSlots: number
  platforms: string[]
  artistName: string
  goal: string
}) {
  const { startDate, totalSlots, platforms, artistName, goal } = args
  const items: CalendarItem[] = []

  for (let i = 0; i < totalSlots; i++) {
    const date = addDaysIso(startDate, i)
    const platform = platforms[i % platforms.length] || 'instagram'
    items.push({
      date,
      platform,
      title: `Quick win: 30s post (${platform})`,
      short_label: 'Quick win',
      pillar: 'Other',
      format: 'Vertical video',
      idea: `Simple, shootable idea for ${artistName || 'the artist'}: a short, clear moment that supports the goal (“${goal || 'momentum'}”).`,
      suggested_caption: `One small step today. Building momentum for what’s next.`,
      angle: 'Fallback plan: keeps you posting consistently without high lift.',
      cta: 'Save this + tell me what you want next week to focus on.',
    })
  }

  return { items }
}

export async function POST(req: Request) {
  let body: CalendarRequest = {}
  try {
    body = (await req.json()) as CalendarRequest
  } catch {}

  const {
  artistName = 'the artist',
  genre = '',
  audience = '',
  goal = '',
  tone = 'brand-consistent, concise, human, engaging',
  focusMode = 'general',
  releaseContext = '',
  mix,
  energyPattern,
  noveltySeed,
  lyrics = '',
  lyricsFocus = '',
  startDate,
  weeks = 4,
  postsPerWeek = 4,
  platforms = ['instagram', 'tiktok', 'youtube'],
  avoidTitles = [],
} = body

  if (!startDate) {
    return NextResponse.json({ error: 'Missing startDate (ISO string)' }, { status: 400 })
  }
  if (!weeks || weeks <= 0) {
    return NextResponse.json({ error: 'weeks must be a positive number' }, { status: 400 })
  }
  if (!postsPerWeek || postsPerWeek <= 0) {
    return NextResponse.json({ error: 'postsPerWeek must be a positive number' }, { status: 400 })
  }

  const totalSlots = weeks * postsPerWeek

  // ✅ No key? Return stable fallback (no crash)
  if (!openai) {
    return NextResponse.json(
      { ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal }), _fallback: true },
      { status: 200 }
    )
  }

  const contextLines: string[] = []
  if (genre) contextLines.push(`Genre / lane: ${genre}`)
  if (audience) contextLines.push(`Audience: ${audience}`)
  if (goal) contextLines.push(`Primary goal: ${goal}`)

  const contextBlock = contextLines.length
  
    ? contextLines.join('\n')
    : 'No extra context was given. Infer a reasonable plan for an independent artist.'

  const systemPrompt = `
  
You are an expert music marketing strategist and content calendar architect.
You design practical, shootable content plans that respect an artist's reality
(time, energy, budget) while still pushing growth.

Rules:
- Mix content pillars: performance, storytelling, behind-the-scenes, education, community.
- Vary FORMATS: e.g. performance clip, talking-to-camera, lyric graphic, duet, stitch, carousel.
- Avoid near-duplicates. Each slot should feel distinct but on-brand.
- If an "Avoid list" is provided, do NOT reuse or closely paraphrase those titles/hooks/ideas.
- Make sure posts align with the stated GOAL:
  - "Grow" → more discovery formats, hooks, collabs, trends, duets.
  - "Convert" → more direct CTAs, pre-saves, merch, ticket pushes.
  - "Deepen" → more storytelling, vulnerability, process, community.
  - "Test" → more experiments, different angles, split-testing hooks.
- Respect AUDIENCE language and interests.
- Assume a realistic solo/DIY artist workload: don't make every slot insanely complex.
Hard requirements for EACH item:
- "idea" MUST include:
  1) Hook (first line said/shown),
  2) Shot list (3 quick shots),
  3) On-screen text suggestion,
  4) End beat (what happens in last 2 seconds),
  5) Simple production note (where/when to film).
- "title" must be specific (avoid "Content slot", "Quick win").
- "suggested_caption" must sound human and specific to the idea (no generic motivational filler).
- Avoid near-duplicates: do not reuse the same hook style more than once per week.
- If "Content mix targets" are provided, roughly match pillar distribution across the plan.
- If an "Energy pattern" is provided (Mon..Sun), match effort level:
  - low → low-lift (talking head, VO, lyric text, simple clips)
  - medium → balanced (hook → context → payoff)
  - high → higher energy (performance, fast cuts, bold hooks)

Output STRICTLY valid JSON with this shape:

{
  "items": [
    {
      "date": "YYYY-MM-DD",
      "platform": "instagram" | "tiktok" | "youtube" | "facebook" | "x",
      "title": "Short internal title for the content slot",
      "short_label": "Very short label for calendar cell",
      "pillar": "Performance / Story / BTS / Education / Community / Other",
      "format": "e.g. Vertical performance clip, talking head, carousel, stitch, duet, live snippet",
      "idea": "Detailed but concise description of what the piece of content actually is",
      "suggested_caption": "A platform-appropriate caption in the artist's tone of voice",
      "angle": "1-2 sentences on WHY this angle works for this audience & goal",
      "cta": "Soft and human call to action that fits the goal"
    }
  ]
}

Do NOT include any other fields.
Return ONLY JSON, no commentary.
`.trim()

  const userPrompt = `
Artist: ${artistName}
${contextBlock}
Tone: ${tone}
Focus mode: ${focusMode}
Release/gig context: ${releaseContext || 'None'}

Content mix targets (approx %):
${mix ? `promo:${mix.promo} brand:${mix.brand} community:${mix.community} bts:${mix.bts} lifestyle:${mix.lifestyle}` : 'Not provided'}

Energy pattern (Mon..Sun):
${Array.isArray(energyPattern) && energyPattern.length ? energyPattern.join(', ') : 'Not provided'}
Session novelty key: ${noveltySeed || 'default'}

Lyrics context (optional):
${lyrics ? `Focus: ${lyricsFocus || 'general'}\nLyrics:\n${lyrics.slice(0, 4000)}` : 'No lyrics provided.'}

Strict requirements when lyrics are provided:
- At least 70% of items MUST be directly inspired by the lyrics' themes, imagery, emotions, or key phrases.
- Each item MUST include a "LYRICS ANCHOR:" line inside the "idea" field that states (without quoting long text):
  - the specific theme / image / emotion it came from (e.g. "LYRICS ANCHOR: 'storms clearing' → resilience")
- Do NOT output generic music-marketing staples unless they are reframed through the lyrics.
- Avoid repeating the same creative device more than once per week:
  - (e.g. "rate this hook", "studio BTS", "lyric breakdown", "walk + VO", etc.)
- For variety: include at least one of each across the plan:
  1) performance-based,
  2) storytelling talking-head,
  3) visual metaphor / cinematic,
  4) audience prompt / community,
  5) educational / breakdown.
- Do NOT reproduce long lyric excerpts. If you quote, max 6–8 words.

Plan parameters:
- Start date: ${startDate}
- Number of weeks: ${weeks}
- Approx posts per week: ${postsPerWeek}
- Allowed platforms: ${platforms.join(', ')}
- Avoid list (do not repeat or closely paraphrase):
${(avoidTitles || []).slice(0, 40).map(t => `- ${t}`).join('\n') || 'None'}

Design a content calendar that:
- Spreads posts across the weeks (not all on the same days).
- Uses a mix of the allowed platforms.
- Feels coherent with one artist identity (not random).
- Can be realistically executed by a busy independent artist.

You MUST:
- Fill exactly ~${totalSlots} slots (±1 is OK, but do NOT exceed by more than one).
- Ensure dates are valid calendar dates after the start date.
- Always include "suggested_caption" and "short_label".
`.trim()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 1.2,
      presence_penalty: 0.8,
      frequency_penalty: 0.4,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) {
      return NextResponse.json(
        { ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal }), _fallback: true },
        { status: 200 }
      )
    }

    let parsed: CalendarResponse
    try {
      parsed = JSON.parse(raw) as CalendarResponse
    } catch (e) {
      console.error('[calendar-api] JSON parse error', e, raw)
      return NextResponse.json(
        { ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal }), _fallback: true },
        { status: 200 }
      )
    }

    if (!Array.isArray(parsed.items)) {
      return NextResponse.json(
        { ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal }), _fallback: true },
        { status: 200 }
      )
    }

    // Normalise so the front-end can rely on fields
    const safePlatforms = Array.isArray(platforms) && platforms.length ? platforms : ['instagram']

    const normalisedItems: CalendarItem[] = parsed.items.map((item) => {
      const platform = safePlatforms.includes(item.platform) ? item.platform : safePlatforms[0]
      return {
        date: item.date,
        platform,
        title: item.title || 'Content slot',
        short_label: item.short_label || item.title || 'Post',
        pillar: item.pillar || 'Other',
        format: item.format || 'Vertical video',
        idea: item.idea || '',
        suggested_caption: item.suggested_caption || '',
        angle: item.angle || '',
        cta: item.cta || '',
      }
    })

    return NextResponse.json({ items: normalisedItems }, { status: 200 })
  } catch (e: unknown) {
    console.error('[calendar-api] unexpected error', e)
    return NextResponse.json(
      { ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal }), _fallback: true },
      { status: 200 }
    )
  }
}

export function GET() {
  return NextResponse.json({ ok: true, route: 'calendar' })
}
