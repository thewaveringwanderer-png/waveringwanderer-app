// src/app/api/identity/route.ts
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
    return NextResponse.json(
      { result: stubResult({ artistName, genre, influences, brandWords, audience, goal }), _fallback: true },
      { status: 200 }
    )
  }

  const openai = new OpenAI({ apiKey })

  const system = `
You are a senior creative director and artist strategist writing brand documents for independent musicians.
Write in UK English. Sound like a premium creative agency deck: concise, confident, specific.
Avoid clichés (e.g., "unique sound", "passionate about music", "rising star").
Focus on positioning, psychology, narrative hooks, and practical next steps.

YOU MUST return valid JSON only in this schema and meet the minimum counts:

{
  "brand_essence": string (45–80 words, no clichés, 1 vivid metaphor),
  "one_line_positioning": string (max 18 words; who it's for + promise + edge),
  "bio_short": string (60–100 words, 2 tangible specifics: scenes, objects, textures),
  "archetype": { "primary": string, "secondary": string },
  "audience_persona": {
    "nickname": string,
    "demographics": string,
    "psychographics": string (motivation, tension, desired status),
    "adjacent_artists": string[] (3–5)
  },
  "value_props": string[] (3–5, each actionable / testable),
  "tone_of_voice": string[] (3–5),
  "visual_aesthetics": {
    "palette": string[] (3–5 hex codes),
    "mood_words": string[] (3–6),
    "references": string[] (3–6 concrete references: lenses, set pieces, film scenes, photographers)
  },
  "content_pillars": [
    { "name": string, "why": string (audience psychology), "formats": string[] (3–5 specific formats) }
  ] (3–4 items),
  "platform_strategy": {
    "primary_platforms": string[] (2–3),
    "cadence": string (weekly rhythm by format),
    "cta_examples": string[] (3–6, no generic "follow/like")
  },
  "release_plan_90d": [
    { "week": string, "focus": string, "tasks": string[] (3–6 concrete tasks) }
  ] (4 blocks covering weeks 1–2, 3–6, 7–10, 11–12),
  "seo_keywords": string[] (6–10),
  "taglines": string[] (5–8; 2–5 words each, no rhymes)
}

All arrays must meet minimum lengths. If inputs are sparse, infer plausibly and keep consistent.
`.trim()

  const user = `
Artist: ${artistName || 'Unknown'}
Genre: ${genre || '—'}
Influences: ${influences || '—'}
Brand keywords: ${brandWords || '—'}
Audience: ${audience || '—'}
Goal (30–90 days): ${goal || '—'}

Task: Produce a consultancy-grade identity kit that would make the artist say "this is exactly me".
Be precise. Use concrete nouns and scenes. Avoid generic language.
`.trim()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.9,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    const raw = completion.choices?.[0]?.message?.content?.trim() || ''
    let result: any
    try {
      result = JSON.parse(raw)
    } catch {
      result = await repairJSON(openai, raw)
    }

    if (!meetsMinimums(result)) {
      result = await deepenResult(openai, result, { artistName, genre, influences, brandWords, audience, goal })
    }

    return NextResponse.json({ result }, { status: 200 })
  } catch (e: unknown) {
  console.error('[identity]', e)
  return NextResponse.json({ error: 'Server error' }, { status: 500 })
}

}

export function GET() {
  return NextResponse.json({ ok: true, route: 'identity' })
}

/* ---------------- helpers ---------------- */

function meetsMinimums(r: any) {
  if (!r) return false
  const atLeast = (x: any[] | undefined, n: number) => Array.isArray(x) && x.length >= n
  return Boolean(
    r.brand_essence &&
      r.one_line_positioning &&
      r.bio_short &&
      r.archetype?.primary &&
      atLeast(r.audience_persona?.adjacent_artists, 3) &&
      atLeast(r.value_props, 3) &&
      atLeast(r.tone_of_voice, 3) &&
      atLeast(r.visual_aesthetics?.palette, 3) &&
      atLeast(r.visual_aesthetics?.references, 3) &&
      atLeast(r.content_pillars, 3) &&
      atLeast(r.platform_strategy?.cta_examples, 3) &&
      atLeast(r.release_plan_90d, 4) &&
      atLeast(r.taglines, 5)
  )
}

async function repairJSON(openai: OpenAI, raw: string) {
  const fix = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Return valid JSON only. Do not wrap in code fences.' },
      { role: 'user', content: `Fix this into valid JSON without changing meaning:\n${raw}` },
    ],
  })

  const txt = fix.choices?.[0]?.message?.content || '{}'
  try {
    return JSON.parse(txt)
  } catch {
    return {}
  }
}

async function deepenResult(openai: OpenAI, result: any, inputs: Inputs) {
  const ask = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `
You will receive a partially complete Artist Identity Kit JSON and must return
a repaired, enriched JSON matching the exact schema and minimum counts from earlier.
Strengthen specificity (concrete references, scenes, objects). No clichés. UK English.
Return JSON only.
`.trim(),
      },
      { role: 'user', content: JSON.stringify({ inputs, partial: result }) },
    ],
  })

  const txt = ask.choices?.[0]?.message?.content || '{}'
  try {
    return JSON.parse(txt)
  } catch {
    return result
  }
}

function stubResult({
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
  const infl = influences
    ? String(influences)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 4)
    : ['FKA twigs', 'James Blake', 'Dave', 'Little Simz']

  const aud = audience || 'late-night listeners who value craft and meaning'
  const go = goal || 'build momentum into the next release'

  return {
    brand_essence: `${artistName || 'This artist'} crafts ${genre || 'left-field'} songs with ${
      brandWords || 'nocturnal, tactile'
    } detail — like streetlight through fog: soft-edged, precise, impossible to ignore.`,
    one_line_positioning: `${artistName || 'The artist'}: ${genre || 'alt'} storytelling for ${aud}.`,
    bio_short: `${artistName || 'The artist'} builds a coherent world across music, visuals and touchpoints: cool-toned lighting, grainy close-ups, and narrative fragments that reward repeat listening. Their next 30–90 day focus: ${go}.`,
    archetype: { primary: 'Sage', secondary: 'Creator' },
    audience_persona: {
      nickname: 'Night Walkers',
      demographics: '18–32, UK/EU/US, culture-forward urban listeners.',
      psychographics:
        'Introspective, aesthetics-led, values craft and meaning; seeks identity, momentum, and proof of progress.',
      adjacent_artists: infl,
    },
    value_props: [
      'Cinematic narratives with tactile sonic identity',
      'Ownable visual language across touchpoints',
      'Community prompts that generate UGC',
    ],
    tone_of_voice: ['introspective', 'assured', 'poetic'],
    visual_aesthetics: {
      palette: ['#0B0B0B', '#6D28D9', '#8B5CF6', '#EDEDED'],
      mood_words: ['nocturnal', 'textural', 'elegant', 'grounded'],
      references: ['35mm stills', 'projected light on concrete', 'mist + neon edges', 'slow dolly shots'],
    },
    content_pillars: [
      { name: 'Lyric Moments', why: 'Narrative decoding = deeper bond', formats: ['Text-on-reel', 'Caption threads', 'Carousel breakdowns'] },
      { name: 'Making The Track', why: 'Humanise the craft', formats: ['Studio POV', 'Process diaries', 'A/B snippet tests'] },
      { name: 'World-Building', why: 'Own a distinctive lane', formats: ['Mood edits', 'Micro-set design', 'Lookbooks'] },
    ],
    platform_strategy: {
      primary_platforms: ['Instagram', 'TikTok', 'YouTube'],
      cadence: '3× shorts, 1× long-form per week',
      cta_examples: ['What scene do you see?', 'Duet your verse', 'Save this for the night walk'],
    },
    release_plan_90d: [
      { week: '1–2', focus: 'Brand setup', tasks: ['Palette & type system', 'Hero look test', '5× b-roll shoots'] },
      { week: '3–6', focus: 'Single rollout', tasks: ['Teaser ladder', 'Lyric moments series', 'Studio POV'] },
      { week: '7–10', focus: 'Depth & community', tasks: ['Live session', 'Fan prompt chain', 'Collab duet'] },
      { week: '11–12', focus: 'Next drop prep', tasks: ['Snippet tests', 'Pre-save path', 'Visual refresh'] },
    ],
    seo_keywords: [
      artistName || 'independent artist',
      'new music',
      genre || 'alt',
      'storytelling rap',
      'cinematic music',
      'UK artist',
    ],
    taglines: ['Night-wired stories', 'Cinema after dark', 'Textures you can feel', 'Ink & neon', 'Keep the city close'],
  }
}
