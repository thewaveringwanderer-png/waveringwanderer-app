import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'


type Inputs = {
  artistName?: string
  genre?: string
  influences?: string
  brandWords?: string
  audience?: string
  direction?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function buildIdentityPreview(full: any) {
  return {
    core: {
      brandEssence: full?.core?.brandEssence ?? '',
      positioning: full?.core?.positioning ?? '',
      bio: full?.core?.bio ?? '',
    },
    audience: {
      persona: full?.audience?.persona ?? '',
      psychographics: Array.isArray(full?.audience?.psychographics)
        ? full.audience.psychographics.slice(0, 3)
        : [],
      emotionalTriggers: Array.isArray(full?.audience?.emotionalTriggers)
        ? full.audience.emotionalTriggers.slice(0, 3)
        : [],
    },
    tone: {
      voiceDescription: full?.tone?.voiceDescription ?? '',
      do: Array.isArray(full?.tone?.do) ? full.tone.do.slice(0, 3) : [],
      dont: Array.isArray(full?.tone?.dont) ? full.tone.dont.slice(0, 3) : [],
    },
    visuals: {
      colorPalette: {
        primary: Array.isArray(full?.visuals?.colorPalette?.primary)
          ? full.visuals.colorPalette.primary.slice(0, 2)
          : [],
        secondary: Array.isArray(full?.visuals?.colorPalette?.secondary)
          ? full.visuals.colorPalette.secondary.slice(0, 2)
          : [],
        accent: Array.isArray(full?.visuals?.colorPalette?.accent)
          ? full.visuals.colorPalette.accent.slice(0, 2)
          : [],
      },
      lighting: full?.visuals?.lighting ?? '',
      environment: Array.isArray(full?.visuals?.environment)
        ? full.visuals.environment.slice(0, 3)
        : [],
      framing: Array.isArray(full?.visuals?.framing)
        ? full.visuals.framing.slice(0, 3)
        : [],
      texture: Array.isArray(full?.visuals?.texture)
        ? full.visuals.texture.slice(0, 3)
        : [],
      symbolism: Array.isArray(full?.visuals?.symbolism)
        ? full.visuals.symbolism.slice(0, 3)
        : [],
    },
    content: {
      pillars: Array.isArray(full?.content?.pillars)
        ? full.content.pillars.slice(0, 3).map((p: any) => ({
            name: p?.name ?? '',
            purpose: p?.purpose ?? '',
          }))
        : [],
      formats: Array.isArray(full?.content?.formats)
        ? full.content.formats.slice(0, 2).map((f: any) => ({
            name: f?.name ?? '',
            type: f?.type ?? '',
            structure: f?.structure ?? '',
            emotionalGoal: f?.emotionalGoal ?? '',
          }))
        : [],
    },
    identityRules: Array.isArray(full?.identityRules)
      ? full.identityRules.slice(0, 4)
      : [],
    keywords: Array.isArray(full?.keywords) ? full.keywords.slice(0, 5) : [],
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
  direction = '',

} = inputs

  // ---- Auth token ----
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : ''
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ---- Validate token with Supabase (can timeout; handle gracefully) ----
  let uid = ''
let email = ''
  try {
    const supabaseAuth = createClient(supabaseUrl, supabaseAnon)
    const { data: userData } = await supabaseAuth.auth.getUser(token)
    uid = userData?.user?.id || ''
    email = userData?.user?.email || ''
  } catch (e: any) {
    console.error('[identity] auth.getUser failed', e?.message || e)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!serviceKey) return NextResponse.json({ error: 'Missing service role key' }, { status: 500 })

  const supabaseAdmin = createClient(supabaseUrl, serviceKey)

  // ---- Read tier + usage (usage column MUST exist) ----
  const { data: profileRow, error: profileErr } = await supabaseAdmin
    .from('ww_profiles')
    .select('tier, usage')
    .eq('user_id', uid)
    .maybeSingle()

  if (profileErr) {
    console.error('[identity] ww_profiles read error', profileErr)
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'Could not read profile.' }, { status: 500 })
  }

  


const tier = ((profileRow?.tier as any) || 'free') as 'free' | 'creator' | 'pro'
const usage: Record<string, any> = (profileRow?.usage as any) || {}
const used = Number(usage.identity_generate_uses || 0)
const devBypassEmails = ['nddawson15@gmail.com']
const isDevBypass = devBypassEmails.includes(email.trim().toLowerCase())

console.log('[identity] profileRow:', profileRow)
console.log('[identity] resolved tier:', tier)
console.log('[identity] used:', used)

  // ✅ Enforce free limit (this is what triggers your pill)
  if (!isDevBypass && tier === 'free' && used >= 1) {
  return NextResponse.json(
    { error: 'FREE_LIMIT', message: 'Free plan includes 1 Identity Kit generation.' },
    { status: 429 }
  )
}

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    // still count as a generation (otherwise unlimited)
    const nextUsage = { ...usage, identity_generate_uses: used + 1 }
    await supabaseAdmin.from('ww_profiles').upsert([{ user_id: uid, tier, usage: nextUsage }], { onConflict: 'user_id' })

    return NextResponse.json(
      {
        result: buildIdentityPreview(stubResult({ artistName, genre, influences, brandWords, audience, direction })),
        _preview: true,
        _locked: ['Full visual identity system', 'Expanded audience psychology', 'Full visual direction', 'Advanced content system'],
      },
      { status: 200 }
    )
  }

  const openai = new OpenAI({ apiKey })

  const system = `
You are a senior creative director and artist strategist writing brand documents for independent musicians.
Write in UK English. Sound like a premium creative agency deck: concise, confident, specific.
Avoid clichés (e.g., "unique sound", "passionate about music", "rising star").
Focus on positioning, psychology, narrative cohesion, and usable brand constraints.
Return valid JSON only.

You are building an ARTIST IDENTITY SYSTEM, not just a description.

The output must define how the artist should:
- look
- sound
- communicate
- create content

The goal is to create constraints that make the artist consistent and recognisable.

---

VISUAL SYSTEM:

Define:
- color palette (primary, secondary, accent)
- lighting style (e.g. dim, natural, cinematic)
- environment (e.g. bedroom, city, abstract)
- framing (close-up, wide, POV)
- texture (grainy, clean, analogue, digital)
- symbolism (recurring objects or motifs)

---

CONTENT FORMATS:

Define 2–3 repeatable formats.

Each format must include:
- name
- type (talking video, montage, POV, etc.)
- structure (how it flows)
- emotional goal

---

AUDIENCE:

Define:
- persona (who they are)
- psychographics (how they think)
- emotional triggers (what makes them react, comment, share)

---

TONE:

Define:
- voice description
- what to do (style rules)
- what to avoid

---

IDENTITY RULES:

Define 5–8 rules that all content must follow.

These should act as constraints, not suggestions.

---

IMPORTANT:

Do NOT generate a 90-day plan.
Do NOT generate content ideas.
Do NOT generate marketing steps.

If a creative direction is provided, it must visibly shape:
- the visual system
- the tone of voice
- the content formats
- the identity rules

Do not treat direction as a loose note. Treat it as a core constraint.

This is a SYSTEM, not a plan.

`.trim()

  const user = `
Build a premium artist identity system for this musician.

Inputs:
Artist: ${artistName || 'Unknown'}
Genre: ${genre || '—'}
Influences: ${influences || '—'}
Brand keywords: ${brandWords || '—'}
Audience: ${audience || '—'}
Direction: ${direction || '—'}

Return valid JSON matching exactly this shape:

{
  "core": {
    "brandEssence": string,
    "positioning": string,
    "bio": string
  },
  "audience": {
    "persona": string,
    "psychographics": string[],
    "emotionalTriggers": string[]
  },
  "tone": {
    "voiceDescription": string,
    "do": string[],
    "dont": string[]
  },
  "visuals": {
    "colorPalette": {
      "primary": string[],
      "secondary": string[],
      "accent": string[]
    },
    "lighting": string,
    "environment": string[],
    "framing": string[],
    "texture": string[],
    "symbolism": string[]
  },
  "content": {
    "pillars": [
      {
        "name": string,
        "purpose": string
      }
    ],
    "formats": [
      {
        "name": string,
        "type": string,
        "structure": string,
        "emotionalGoal": string
      }
    ]
  },
  "identityRules": string[],
  "keywords": string[]
}

Requirements:
- Make the identity feel distinct and ownable
- Avoid generic artist branding language
- The visuals section must feel specific enough to guide artwork, content, and styling
- The content formats must be repeatable and realistic
- The audience section must describe how the audience thinks, not just who they are
- The identityRules must act like constraints, not advice
- The result should feel like a system another feature can use, not a moodboard

- If Direction is provided, it must materially influence the visuals, tone, content formats, and identity rules

Minimums:
- psychographics: 4
- emotionalTriggers: 4
- tone.do: 4
- tone.dont: 4
- visuals.environment: 4
- visuals.framing: 4
- visuals.texture: 4
- visuals.symbolism: 4
- content.pillars: 3
- content.formats: 3
- identityRules: 6
- keywords: 8

Do NOT include:
- 90-day plans
- rollout strategy
- content calendars
- release tactics
- generic filler
`.trim()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    const raw = completion.choices?.[0]?.message?.content?.trim() || '{}'
    const result = JSON.parse(raw)

    // ✅ Count the generation AFTER success (this stops unlimited use)
    const nextUsage = { ...usage, identity_generate_uses: used + 1 }
    const { error: upsertErr } = await supabaseAdmin
      .from('ww_profiles')
      .upsert([{ user_id: uid, tier, usage: nextUsage }], { onConflict: 'user_id' })

    if (upsertErr) {
      console.error('[identity] ww_profiles upsert error', upsertErr)
      return NextResponse.json({ error: 'SERVER_ERROR', message: 'Could not update usage.' }, { status: 500 })
    }

    if (tier === 'free') {
      return NextResponse.json(
        {
          result: buildIdentityPreview(result),
          _preview: true,
          _locked: ['Full visual identity system', 'Expanded audience psychology', 'Full visual direction', 'Advanced content system'],

        },
        { status: 200 }
      )
    }

    return NextResponse.json({ result, _preview: false }, { status: 200 })
  } catch (e: any) {
    console.error('[identity] route error', e?.message || e)
    return NextResponse.json({ error: 'SERVER_ERROR', message: e?.message || String(e) }, { status: 500 })
  }
}

export function GET() {
  return NextResponse.json({ ok: true, route: 'identity' })
}

/* ---- stub ---- */
function stubResult({
  artistName,
  genre,
  influences,
  brandWords,
  audience,
  direction,
}: {
  artistName: string
  genre: string
  influences: string
  brandWords: string
  audience: string
  direction: string
}) {
  const influenceList = influences
    ? influences.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return {
    core: {
  brandEssence: `${artistName || 'This artist'} crafts ${genre || 'left-field'} music with ${brandWords || 'nocturnal, tactile'} detail, guided by ${direction || 'a focused creative identity'}.`,
  positioning: `${artistName || 'This artist'} makes introspective music for ${audience || 'listeners who want depth, atmosphere, and honesty'}.`,
  bio: `${artistName || 'The artist'} builds a coherent world across music and visuals, shaped by ${direction || 'a clear emotional and visual direction'}.`,
},
    audience: {
      persona: audience || 'Listeners who are emotionally reflective, thoughtful, and drawn to meaning-rich music',
      psychographics: [
        'Values emotional honesty over hype',
        'Feels drawn to quiet, reflective content',
        'Connects with storytelling and inner dialogue',
        'Shares music that feels personally revealing',
      ],
      emotionalTriggers: [
        'Feeling behind in life but still moving forward',
        'Moments of private reflection',
        'Recognition of personal growth',
        'Songs that feel like internal conversation',
      ],
    },
    tone: {
      voiceDescription: 'Reflective, grounded, intimate, and emotionally observant',
      do: [
        'Sound personal rather than performative',
        'Use specific emotional language',
        'Keep the tone intimate and human',
        'Let the messaging feel thoughtful and understated',
      ],
      dont: [
        'Do not sound overly polished or corporate',
        'Do not force hype language',
        'Do not use generic artist clichés',
        'Do not make the messaging feel loud or attention-seeking',
      ],
    },
    visuals: {
      colorPalette: {
        primary: ['charcoal', 'soft grey'],
        secondary: ['muted blue', 'off-white'],
        accent: ['faded amber', 'deep burgundy'],
      },
      lighting: 'Low light, soft shadows, cinematic and intimate',
      environment: ['bedroom', 'late-night city', 'window light', 'empty studio corners'],
      framing: ['close-up', 'mid-shot', 'static portrait framing', 'slow handheld detail shots'],
      texture: ['grainy', 'analogue', 'soft blur', 'slightly worn'],
      symbolism: ['rain on glass', 'notebooks', 'lamplight', 'empty streets'],
    },
    content: {
      pillars: [
        {
          name: 'Inner dialogue',
          purpose: 'Build emotional intimacy and relatability',
        },
        {
          name: 'Creative world-building',
          purpose: 'Make the artist feel visually and emotionally recognisable',
        },
        {
          name: 'Personal reflection',
          purpose: 'Turn songs into deeper audience connection',
        },
      ],
      formats: [
        {
          name: 'Late-night reflection',
          type: 'Talking-to-camera video',
          structure: 'Open with a direct thought, connect it to a lyric or feeling, end with a reflective prompt',
          emotionalGoal: 'Make the audience feel understood',
        },
        {
          name: 'Atmosphere montage',
          type: 'Visual edit / Reel',
          structure: 'Pair mood visuals with a key line, keep pacing slow and emotionally focused',
          emotionalGoal: 'Deepen immersion in the artist world',
        },
        {
          name: 'Meaning breakdown',
          type: 'Short-form story post',
          structure: 'Take one line, explain the emotion behind it, connect it to a wider human feeling',
          emotionalGoal: 'Encourage saves and shares from reflective listeners',
        },
      ],
    },
    identityRules: [
      'Every piece of content should feel like a moment, not an announcement',
      'Keep pacing calm, intimate, and emotionally intentional',
      'Use visuals that feel textured, low-lit, and lived-in',
      'Avoid loud, over-edited, or trend-chasing presentation',
      'Anchor the brand in reflection, memory, and emotional honesty',
      'Prioritise recognisable atmosphere over generic polish',
    ],
    keywords: [
      'introspective',
      'cinematic',
      'reflective',
      'late-night',
      'textured',
      'emotional depth',
      'story-led',
      'quiet ambition',
    ],
  }
}
