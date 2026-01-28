import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

type PlanItem = {
  date: string             // "YYYY-MM-DD"
  title: string            // short post title
  platform: string         // Instagram | TikTok | YouTube | X/Twitter | Threads | Spotify
  notes?: string           // producer notes
  caption?: string         // platform-ready caption
  hashtags?: string[]      // smart set (<= 10)
  post_time?: string       // "HH:MM" (local)
  hook?: string            // opening hook line
  call_to_action?: string  // CTA
  angle?: string           // creative angle
  assets?: {
    broll?: string[]
    shots?: string[]
    props?: string[]
    locations?: string[]
    overlays?: string[]
  }
}

function ok(json: any, status = 200) {
  return NextResponse.json(json, { status })
}
function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function isISODate(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s) }
const PLATFORMS = ['Instagram','TikTok','YouTube','X/Twitter','Threads','Instagram','TikTok']

function fallbackPlan(dates: string[], mode: 'kit'|'release', ctx: any): PlanItem[] {
  // Heuristic plan that still uses lyrics/description keywords if present
  const kws = (ctx?.lyrics || ctx?.description || '').toLowerCase().slice(0, 140)
  return dates.map((d, i) => ({
    date: d,
    platform: PLATFORMS[i % PLATFORMS.length],
    title: mode === 'release'
      ? ['Teaser A','Teaser B','Behind the Lyrics','Hook Test','UGC Prompt','Milestones','Thank You'][i % 7]
      : ['Lyric Moment','Studio POV','World-build','Prompt','Hook Test','Micro-vlog','Recap'][i % 7],
    angle: kws ? `Tie to lyric/desc: ${kws}` : undefined,
    hook: 'Open strong in first 2 seconds with visual movement',
    call_to_action: 'Save & share; duet your version; comment your scene',
    post_time: ['18:00','20:00','17:30','19:00','18:30','20:30','17:45'][i % 7],
    caption: 'Short, concrete, single-CTA. Keep first line punchy.',
    hashtags: ['#newmusic','#music','#independentartist','#fyp','#hiphop'].slice(0, 5),
    assets: {
      broll: ['studio','night-walk','hands','transport'],
      shots: ['close-up','mid','insert'],
      props: ['notebook','mic'],
      locations: ['stairwell','underpass','bedroom-studio'],
      overlays: ['lyrics-on-screen']
    },
    notes: 'Trim to 12–20s; big text first; cut no dead air.'
  }))
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { mode, dates, release, lyrics, description } = body as {
    mode?: 'kit'|'release'
    dates?: string[]
    release?: { title?: string; status?: 'unreleased'|'released'; date?: string; goals?: string }
    lyrics?: string
    description?: string
  }

  if (!mode || (mode !== 'kit' && mode !== 'release')) return bad('Missing or invalid "mode"')
  if (!Array.isArray(dates) || dates.length === 0 || !dates.every(isISODate)) return bad('Invalid "dates" array')

  const ctx = { lyrics, description, release }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // Fallback when no key: still generate structured, useful plan
    return ok(fallbackPlan(dates, mode, ctx))
  }

  const system = `You are a senior social content strategist for independent recording artists.
Return ONLY a JSON array (no prose, no fences) of items with keys:
date, title, platform, notes, caption, hashtags, post_time, hook, call_to_action, angle, assets{broll,shots,props,locations,overlays}.
- Keep "title" short & shootable.
- "caption" 1–2 lines, single clear CTA.
- "hashtags" <= 8 mixed broad/niche; no commas in hashtags.
- "post_time" in HH:MM (24h), evening-biased.
- Use artist context (lyrics/description/release) to tailor angles & hooks.
- Platforms limited to: Instagram, TikTok, YouTube, X/Twitter, Threads, Spotify.`

  const user =
    mode === 'release'
      ? `Make a 7-post weekly calendar for a ${release?.status || 'unreleased'} track.
Title: ${release?.title || 'Untitled'}
Release date: ${release?.date || 'TBD'}
Goals: ${release?.goals || 'Increase saves and UGC'}
Dates (assign one per item): ${dates.join(', ')}
Lyrics (optional): ${lyrics || '(none)'}
Description (optional): ${description || '(none)'}`
      : `Make a 7-post weekly calendar based on the artist's identity.
Dates (assign one per item): ${dates.join(', ')}
Lyrics (optional): ${lyrics || '(none)'}
Description (optional): ${description || '(none)'}`

  const openai = new OpenAI({ apiKey })

  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.8,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })

    const raw = resp.choices?.[0]?.message?.content?.trim() || ''
    const cleaned = raw.replace(/```json|```/g, '').trim()

    let plan: PlanItem[] | null = null
    try {
      const parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) plan = parsed as PlanItem[]
    } catch {
      // ignore; will fallback
    }

    if (!plan || plan.length === 0) {
      plan = fallbackPlan(dates, mode, ctx)
    }

    // Normalize & remap to exactly the given dates (1 per item)
    const normalized = dates.map((d, i) => {
      const p = plan![i] || plan![0]
      return {
        date: d,
        title: String(p?.title || 'Post').slice(0, 100),
        platform: String(p?.platform || 'Instagram'),
        notes: p?.notes ? String(p.notes).slice(0, 500) : '',
        caption: p?.caption ? String(p.caption).slice(0, 500) : '',
        hashtags: Array.isArray(p?.hashtags) ? (p.hashtags as string[]).slice(0, 8) : [],
        post_time: /^\d{2}:\d{2}$/.test(String(p?.post_time || '')) ? p!.post_time! : '19:00',
        hook: p?.hook ? String(p.hook).slice(0, 140) : '',
        call_to_action: p?.call_to_action ? String(p.call_to_action).slice(0, 140) : '',
        angle: p?.angle ? String(p.angle).slice(0, 140) : '',
        assets: {
          broll: p?.assets?.broll || [],
          shots: p?.assets?.shots || [],
          props: p?.assets?.props || [],
          locations: p?.assets?.locations || [],
          overlays: p?.assets?.overlays || []
        }
      } as PlanItem
    })

    return ok(normalized)
  } catch (e: any) {
    console.error('[calendar/suggest] OpenAI failed, using fallback', e?.message || e)
    return ok(fallbackPlan(dates, mode, ctx))
  }
}

