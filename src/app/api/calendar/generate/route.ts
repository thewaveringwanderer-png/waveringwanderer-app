// src/app/api/calendar/generate/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type GenerateBody = {
  mode: 'identity_kit' | 'project'
  identityKit?: unknown // ✅ no any
  projectInfo?: {
    title: string
    releaseDate?: string // ISO
    theme?: string
    type?: 'single' | 'ep' | 'album' | 'tour' | 'other'
  }
  durationDays: number
  platforms: string[] // ['instagram','tiktok','youtube','twitter','other']
}

// ---------- small helpers ----------
function getErrorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

function asRecord(x: unknown): Record<string, unknown> | null {
  return x && typeof x === 'object' ? (x as Record<string, unknown>) : null
}

function isGenerateBody(x: unknown): x is GenerateBody {
  const obj = asRecord(x)
  if (!obj) return false
  if (obj.mode !== 'identity_kit' && obj.mode !== 'project') return false
  if (typeof obj.durationDays !== 'number' || !Number.isFinite(obj.durationDays) || obj.durationDays <= 0) return false
  if (!Array.isArray(obj.platforms)) return false
  return true
}

function getOpenAIOutputText(data: unknown): string {
  const obj = asRecord(data)
  if (!obj) return ''

  // 1) responses API often has output_text
  const outputText = obj.output_text
  if (typeof outputText === 'string') return outputText

  // 2) fallback: chat-completions-like shape
  const choices = obj.choices
  if (Array.isArray(choices) && choices.length > 0) {
    const c0 = asRecord(choices[0])
    const msg = c0 ? asRecord(c0.message) : null
    const content = msg ? msg.content : null
    if (typeof content === 'string') return content
  }

  return ''
}

type CalendarPost = {
  date: string
  platform: string
  content_type: string
  theme: string
  caption: string
  hashtags: string[]
  goal: string
}

function isCalendarShape(x: unknown): x is { posts: CalendarPost[] } {
  const obj = asRecord(x)
  if (!obj) return false
  if (!Array.isArray(obj.posts)) return false
  return true
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 })
    }

    const rawBody = (await req.json()) as unknown
    if (!isGenerateBody(rawBody)) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }
    const body = rawBody

    const identitySummary = body.mode === 'identity_kit' ? summarizeIdentity(body.identityKit) : null
    const projectSummary = body.mode === 'project' ? summarizeProject(body.projectInfo) : null

    const system = `You are a music marketing strategist for independent artists.
You generate structured, platform-aware social content calendars.
Return STRICT JSON only.`

    const user = buildPrompt({
      mode: body.mode,
      durationDays: body.durationDays,
      platforms: body.platforms,
      identitySummary,
      projectSummary,
    })

    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        input: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.7,
      }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      return NextResponse.json({ error: `OpenAI error: ${err}` }, { status: 500 })
    }

    const data = (await resp.json()) as unknown
    const raw = getOpenAIOutputText(data)

    let parsed: unknown
    try {
      parsed = JSON.parse(extractJson(raw))
    } catch {
      return NextResponse.json({ error: 'Model returned non-JSON output', raw }, { status: 500 })
    }

    if (!isCalendarShape(parsed)) {
      return NextResponse.json({ error: 'Invalid calendar shape', raw: parsed }, { status: 500 })
    }

    return NextResponse.json({
      duration_days: body.durationDays,
      mode: body.mode,
      platforms: body.platforms,
      identity_summary: identitySummary,
      project_summary: projectSummary,
      posts: parsed.posts,
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: getErrorMessage(e) || 'Server error' }, { status: 500 })
  }
}

/* ---------------- helpers ---------------- */

function summarizeIdentity(kit: unknown) {
  const k = asRecord(kit)
  if (!k) return null

  const visual = asRecord(k.visual_aesthetics)
  const palette = visual?.palette
  const moodWords = visual?.mood_words

  return {
    brand_essence: k.brand_essence ?? null,
    tone_of_voice: Array.isArray(k.tone_of_voice) ? k.tone_of_voice : [],
    content_pillars: Array.isArray(k.content_pillars) ? k.content_pillars : [],
    visual_aesthetics: {
      palette: Array.isArray(palette) ? palette : [],
      mood: Array.isArray(moodWords) ? moodWords : [],
    },
    audience_persona: k.audience_persona ?? null,
  }
}

function summarizeProject(info?: GenerateBody['projectInfo']) {
  if (!info) return null
  return {
    title: info.title,
    releaseDate: info.releaseDate,
    type: info.type ?? 'single',
    theme: info.theme ?? '',
  }
}

function buildPrompt(opts: {
  mode: 'identity_kit' | 'project'
  durationDays: number
  platforms: string[]
  identitySummary: unknown
  projectSummary: unknown
}) {
  const modeLine =
    opts.mode === 'identity_kit'
      ? `Mode: identity_kit\nIdentity Summary:\n${safeStringify(opts.identitySummary)}`
      : `Mode: project\nProject Summary:\n${safeStringify(opts.projectSummary)}`

  return `
Generate a ${opts.durationDays}-day social content calendar for an independent artist.

${modeLine}

Platforms: ${opts.platforms.join(', ')}

Rules:
- Use 3–4 posts per week max.
- Tailor content_type and caption style per platform (Instagram, TikTok, YouTube, Twitter).
- If a releaseDate is present (project mode), create a logical pre-release → release week → post-release plan.
- Keep captions short, conversational; add 8–14 relevant hashtags.
- Include a high-level "goal" for each post (e.g., build anticipation, pre-save push, social proof).
- Dates must be YYYY-MM-DD; start from today if no releaseDate context exists.
- Return STRICT JSON only:

{
  "posts": [
    {
      "date": "YYYY-MM-DD",
      "platform": "instagram|tiktok|youtube|twitter|other",
      "content_type": "Reel|Short|Carousel|Story|Community|Live|Longform",
      "theme": "short label",
      "caption": "string",
      "hashtags": ["#...", "#..."],
      "goal": "string"
    }
  ]
}
`.trim()
}

function extractJson(text: string) {
  const fenceMatch = text.match(/```json([\s\S]*?)```/i)
  if (fenceMatch) return fenceMatch[1].trim()
  return text.trim()
}

function safeStringify(v: unknown) {
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}
