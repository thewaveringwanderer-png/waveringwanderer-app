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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function buildIdentityPreview(full: any) {
  return {
    brand_essence: full?.brand_essence ?? '',
    one_line_positioning: full?.one_line_positioning ?? '',
    archetype: full?.archetype ?? null,
    bio_short: full?.bio_short ?? '',
    tone_of_voice: Array.isArray(full?.tone_of_voice) ? full.tone_of_voice.slice(0, 4) : [],
    value_props: Array.isArray(full?.value_props) ? full.value_props.slice(0, 3) : [],
    audience_persona: full?.audience_persona
      ? {
          nickname: full.audience_persona.nickname ?? '',
          demographics: full.audience_persona.demographics ?? '',
          psychographics: full.audience_persona.psychographics ?? '',
          adjacent_artists: Array.isArray(full.audience_persona.adjacent_artists)
            ? full.audience_persona.adjacent_artists.slice(0, 4)
            : [],
        }
      : null,
    content_pillars: Array.isArray(full?.content_pillars)
      ? full.content_pillars.slice(0, 3).map((p: any) => ({
          name: p?.name ?? '',
          why: p?.why ?? '',
          formats: Array.isArray(p?.formats) ? p.formats.slice(0, 3) : [],
        }))
      : [],
  }
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
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : ''

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAuth = createClient(supabaseUrl, supabaseAnon)
  const { data: userData } = await supabaseAuth.auth.getUser(token)
  const uid = userData?.user?.id

  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!serviceKey) {
    return NextResponse.json({ error: 'Missing service role key' }, { status: 500 })
  }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey)

  // --- Load profile row (if missing, treat as free with 0 usage) ---
  const { data: profileRow, error: profileErr } = await supabaseAdmin
    .from('ww_profiles')
    .select('tier, usage')
    .eq('user_id', uid)
    .maybeSingle()

  if (profileErr) {
    console.error('[identity] ww_profiles read error', profileErr)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  const tier = ((profileRow?.tier as any) || 'free') as 'free' | 'creator' | 'pro'
  const usage: Record<string, any> = (profileRow?.usage as any) || {}

  const used = Number(usage.identity_generate_uses || 0)

  // ✅ Block free users after 1 use
  if (tier === 'free' && used >= 1) {
    return NextResponse.json(
      { error: 'FREE_LIMIT', message: 'Free plan includes 1 Identity Kit generation.' },
      { status: 429 }
    )
  }

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
   // ✅ Increment usage AFTER successful generation (single source of truth)
const nextUsage = { ...usage, identity_generate_uses: used + 1 }

const { error: upsertErr } = await supabaseAdmin
  .from('ww_profiles')
  .upsert([{ user_id: uid, tier, usage: nextUsage }], { onConflict: 'user_id' })

if (upsertErr) {
  console.error('[identity] ww_profiles usage upsert error', upsertErr)
  return NextResponse.json(
    { error: 'SERVER_ERROR', message: 'Could not update usage tracking.' },
    { status: 500 }
  )
}



    if (tier === 'free') {
      return NextResponse.json(
        {
          result: buildIdentityPreview(result),
          _preview: true,
          _locked: [
            'Full visual identity system',
            'Deep platform strategy',
            'Full 90-day plan',
            'SEO keywords + taglines',
          ],
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ result, _preview: false }, { status: 200 })

  } catch (e: unknown) {
  const msg =
    e instanceof Error ? e.message : typeof e === 'string' ? e : JSON.stringify(e)

  console.error('[identity] route error:', msg)

  return NextResponse.json(
    { error: 'SERVER_ERROR', message: msg },
    { status: 500 }
  )
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
