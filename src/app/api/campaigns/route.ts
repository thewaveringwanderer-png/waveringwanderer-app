// src/app/api/campaigns/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

type Inputs = {
  artistName?: string
  genre?: string
  influences?: string
  brandWords?: string
  audience?: string
  goal?: string
}

export async function POST(req: Request) {
  let inputs: Inputs = {}
  try {
    inputs = await req.json()
  } catch {}

  const {
    artistName = '',
    genre = '',
    influences = '',
    brandWords = '',
    audience = '',
    goal = '',
  } = inputs

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // ✅ return correct top-level shape
    return NextResponse.json(
      { ...fallbackConcepts({ artistName, genre, influences, brandWords, audience, goal }), _fallback: true },
      { status: 200 }
    )
  }

  const openai = new OpenAI({ apiKey })

  const system = `
You are a senior creative producer at a music creative agency. 
Create three campaign concepts for an independent artist, with concrete hooks, visual direction, and an execution plan.
Write in UK English. Avoid clichés. Be specific, testable, and platform-native.

Return ONLY valid JSON with this schema and minimums:
{
  "concepts": [
    {
      "name": string,
      "hook": string,                       // 1-sentence creative hook for short-form
      "synopsis": string,                   // 40–80 words describing the concept
      "visual_direction": {
        "shotlist": string[],               // 5–8 visually concrete shots (lenses, motion, light)
        "palette": string[],                // 3–5 hex codes
        "props": string[]                   // 4–8 concrete items or set pieces
      },
      "deliverables": string[],             // 6–10 deliverables by platform (e.g., 5x Reels, 3x TikToks, 1x YT Short, 1x BTS)
      "caption_tones": string[],            // 3–5 distinct caption tones
      "timeline": {
        "teasers": string[],                // 3–5 teaser beats
        "drop_day": string[],               // 3–5 beats on release day
        "post_drop": string[]               // 3–5 beats for weeks 2–3
      }
    }
  ],
  "kpis": string[],                         // 4–8 measurable goals (saves, shares %, pre-saves, comments)
  "hashtags": string[]                      // 10–15 relevant hashtags, mix short+long-tail
}
Arrays MUST meet minimum lengths.
If inputs are sparse, infer plausibly and be consistent with genre, audience, goal and brand words.
`.trim()

  const user = `
Artist: ${artistName || 'Unknown'}
Genre: ${genre || '—'}
Influences: ${influences || '—'}
Brand keywords: ${brandWords || '—'}
Audience: ${audience || '—'}
Goal: ${goal || '—'}

Task: Produce 3 distinct campaign concepts that would excite the artist and feel executable in 2–3 weeks with low-to-mid resources.
Make them clearly different in format, visual language, and CTA.
`.trim()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.9,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    const raw = completion.choices?.[0]?.message?.content?.trim() || ''
    let parsed: any

    try {
      parsed = JSON.parse(raw)
    } catch {
      // Rare with response_format, but keep your repair pass.
      const fix = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Return valid JSON only. Do not wrap in code fences.' },
          { role: 'user', content: `Repair this to valid JSON without changing meaning:\n${raw}` },
        ],
      })
      const txt = fix.choices?.[0]?.message?.content || '{"concepts":[],"kpis":[],"hashtags":[]}'
      try {
        parsed = JSON.parse(txt)
      } catch {
        parsed = { concepts: [], kpis: [], hashtags: [] }
      }
    }

    const fb = fallbackConcepts({ artistName, genre, influences, brandWords, audience, goal })

    // ✅ Ensure minimums and correct shape
    const merged = mergeWithFallback(parsed, fb)

    return NextResponse.json(merged, { status: 200 })
    } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error'
    return NextResponse.json(
      { ...fallbackConcepts({ artistName, genre, influences, brandWords, audience, goal }), _fallback: true, error: message },
      { status: 200 }
    )
  }

}

export function GET() {
  return NextResponse.json({ ok: true, route: 'campaigns' })
}

/* ---------------- helpers ---------------- */

function fallbackConcepts({
  artistName,
  genre,
  influences,
  brandWords,
  audience,
  goal,
}: {
  artistName: string
  genre: string
  influences: string
  brandWords: string
  audience: string
  goal: string
}) {
  const name = artistName || 'the artist'
  const g = genre || '—'
  const a = audience || '—'
  const go = goal || '—'

  return {
    concepts: [
      {
        name: 'City After Dark',
        hook: 'What does your city feel like after midnight?',
        synopsis: `A nocturnal walk-n-talk format: ${name} narrates one line per location cut, building a confessional story across 30–45 seconds. Low-light, cool temperature, textured close-ups. (${g} • Audience: ${a} • Goal: ${go})`,
        visual_direction: {
          shotlist: [
            '35mm close-up on moving escalator, tungsten spill',
            'Wide alley dolly-in, neon rim, shallow DOF',
            'POV hand on condensation glass, street bokeh',
            'Static bench confession, slow push-in',
            'Handheld crossing lights, parallax cars',
            'Lift lobby mirror, soft bloom',
            'Underpass silhouette, haze can',
          ],
          palette: ['#0B0B0B', '#6D28D9', '#8B5CF6', '#F5E9FF'],
          props: ['condensation glass', 'mini haze can', 'neon sign', 'old lift mirror', 'bench', 'earbuds', 'hood'],
        },
        deliverables: ['5x Reels', '5x TikToks', '1x YT Short', '1x BTS reel', '5x Stills'],
        caption_tones: ['diary-fragment', 'coolly-confident', 'late-night vulnerable', 'matter-of-fact poetic'],
        timeline: {
          teasers: ['location scout stills', 'line fragments as text-on-video', 'colour tests', 'sound design snippet'],
          drop_day: ['master reel v1', 'alt cut (lyrics on screen)', 'stills carousel', 'BTS with voiceover'],
          post_drop: ['fan duet prompt', 'alt city route redo', 'night-walk live snippet'],
        },
      },
      {
        name: 'Lyric Objects',
        hook: 'One object per bar — the lyric becomes tangible.',
        synopsis: `Each key lyric is matched to a tangible object on a dark tabletop set. Clean macro shots + sound design. Fast to shoot; strongly ownable. (${g})`,
        visual_direction: {
          shotlist: [
            'Top light macro on textured object',
            'Slide-reveal to next object on beat',
            'Hands enter frame to swap item',
            'Match cut to artist profile',
            'Lens flare pass with phone light',
            'Static overhead grid of objects',
            'Slow spin turntable close-up',
          ],
          palette: ['#111111', '#6D28D9', '#C4B5FD', '#FFFFFF'],
          props: ['tabletop cloth', 'macro lens/phone macro', 'small turntable', 'assorted objects from lyrics'],
        },
        deliverables: ['6x Reels/TikToks', '1x Still grid carousel', '1x BTS cut'],
        caption_tones: ['precision-minimal', 'playful-inventive', 'behind-the-scenes geek'],
        timeline: {
          teasers: ['object hints', 'macro tests', 'sound design loop'],
          drop_day: ['master edit', 'object grid carousel', 'BTS assembly'],
          post_drop: ['UGC prompt: your object?', 'duet chain', 'alt colour grade'],
        },
      },
      {
        name: 'Notes To Self',
        hook: 'Write it down. Film the line. Own the page.',
        synopsis: `Handwritten lyrics on paper/post-its placed around everyday spaces; each cut reveals a new fragment with the track’s hook. Intimate, cheap, resonant. (${g})`,
        visual_direction: {
          shotlist: [
            'Close-up pen write-on, ink scratch',
            'Fridge door note, hinge squeak',
            'Bathroom mirror post-it, steam wipe',
            'Notebook on bus seat, soft sway',
            'Desk lamp pool, slow push',
            'Bedside table dawn glow',
            'Street poster paste-up (safe, legal alt: cork board)',
          ],
          palette: ['#0E0E0E', '#8B5CF6', '#EDEDED', '#FFE3F7'],
          props: ['notepaper', 'post-its', 'fine-liner', 'masking tape', 'desk lamp', 'mirror', 'cork board'],
        },
        deliverables: ['7x short-form edits', '1x stills carousel', '1x BTS voiceover'],
        caption_tones: ['intimate-matter-of-fact', 'encouraging', 'understated-confident'],
        timeline: {
          teasers: ['handwrite teasers', 'ambient room tone loop', 'note stacks timelapse'],
          drop_day: ['master sequence', 'alt cut on chorus', 'stills carousel'],
          post_drop: ['fan handwriting prompt', 'duet read-your-line', 'alt locations'],
        },
      },
    ],
    kpis: ['Saves rate > 8%', 'Shares rate > 5%', 'Average watch time > 65%', '+200 pre-saves', '+50 high-intent comments'],
    hashtags: [
      '#newmusic',
      '#independentartist',
      '#musicmarketing',
      '#altRNB',
      '#hiphopcommunity',
      '#ukmusic',
      '#nightphotography',
      '#cinematicvideo',
      '#lyrics',
      '#cityatnight',
      '#lowlight',
      '#broll',
      '#storytelling',
      '#creativeprocess',
    ],
  }
}

function mergeWithFallback(parsed: any, fb: any) {
  const out = { concepts: [], kpis: [], hashtags: [], ...parsed }

  // Hard shape checks
  if (!Array.isArray(out.concepts)) out.concepts = []
  if (!Array.isArray(out.kpis)) out.kpis = []
  if (!Array.isArray(out.hashtags)) out.hashtags = []

  // Minimums
  if (out.concepts.length < 3) out.concepts = fb.concepts
  if (out.kpis.length < 4) out.kpis = fb.kpis
  if (out.hashtags.length < 10) out.hashtags = fb.hashtags

  return out
}
