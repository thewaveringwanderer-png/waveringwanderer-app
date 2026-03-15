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
  date: string
  platform: string
  title: string
  short_label: string
  pillar: string
  format: string

  hook?: string
  idea: string
  visual_suggestions?: string[]
  on_screen_text?: string
  end_beat?: string
  production_note?: string

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

function normaliseTextForCompare(value: string) {
  return (value || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function ideaFingerprint(item: Partial<CalendarItem>) {
  const a = normaliseTextForCompare(item.title || '')
  const b = normaliseTextForCompare(item.idea || '')
  const c = normaliseTextForCompare(item.format || '')
  return `${a} | ${b.slice(0, 120)} | ${c}`
}

function isTooSimilarIdea(a: Partial<CalendarItem>, b: Partial<CalendarItem>) {
  const fa = ideaFingerprint(a)
  const fb = ideaFingerprint(b)
  if (!fa || !fb) return false

  if (fa === fb) return true

  const aIdea = normaliseTextForCompare(a.idea || '')
  const bIdea = normaliseTextForCompare(b.idea || '')
  const aTitle = normaliseTextForCompare(a.title || '')
  const bTitle = normaliseTextForCompare(b.title || '')

  if (aIdea && bIdea && (aIdea.includes(bIdea) || bIdea.includes(aIdea))) return true
  if (aTitle && bTitle && aTitle === bTitle) return true

  return false
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

  const creativeModes = [
  'story',
  'performance',
  'community',
  'behind_the_scenes',
  'opinion',
  'lyric',
  'experimental',
]

function getCreativeMode(index: number) {
  return creativeModes[index % creativeModes.length]
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
You design creative, engaging, and realistically shootable content plans for independent artists.

Your job is to create content ideas that feel:
- inspiring
- emotionally engaging
- culturally aware
- simple enough for a solo/DIY artist to execute
- distinct but still on-brand

Core principles:
- Prioritise creativity, engaging topics, strong hooks, and emotional relevance.
- Ideas should feel exciting to make, not overly technical or rigid.
- Keep the content practical and shootable, but do not over-direct the filming.
- Think like a smart creative strategist, not a videographer.
- Give the artist enough structure to act, but leave room for their own personality and style.

Every item must feel meaningfully different from the others.

Treat each content slot as having a different CREATIVE MODE.
Possible creative modes include:
- story / confession
- performance
- audience question
- lyric meaning
- opinion / hot take
- behind the scenes
- humour / irony
- visual metaphor
- artist mindset
- mini lesson / education
- world-building
- contrast / expectation flip

Rules for uniqueness:
- Do not reuse the same creative mode more than once in the same 7-day block unless absolutely necessary.
- Do not reuse the same hook pattern more than once in the same 7-day block.
- Do not reuse the same content mechanic more than once in the same 7-day block.
- “content mechanic” means the actual post structure, for example:
  - lyric breakdown
  - talking head confession
  - audience question
  - performance snippet
  - behind-the-scenes clip
  - opinion monologue
  - walk-and-voiceover
  - screen text reflection
  - reply-to-comment format
- If you are running out of ideas, change the mechanic completely instead of repeating the same one.

Examples of angles:
- storytelling
- lyric explanation
- performance moment
- fan interaction
- behind the scenes
- opinion or hot take
- humour
- vulnerable moment

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
- Assume a realistic solo/DIY artist workload: don't make every slot complex or high-effort.

Calendar length rules:

- If the user selects 1 week → generate EXACTLY 7 items.
- If the user selects 2 weeks → generate EXACTLY 14 items.
- If the user selects 4 weeks → generate EXACTLY 28 items.

Never generate fewer or more items.

Every day in the range MUST have an entry.

If unsure, invent a creative idea rather than leaving a field blank.

Creative guidance:
- Favour ideas built around emotion, opinion, story, tension, identity, curiosity, vulnerability, contrast, or fan interaction.
- The best ideas should make the artist think: "I actually want to post that."
- Avoid generic filler, bland prompts, or robotic marketing language.
- Avoid overly technical camera directions, lens language, or detailed cinematography instructions.
- Shot suggestions should be simple, flexible, and easy to execute with a phone.
- On-screen text should feel punchy, human, and worth reading.
- End beats should help the post land emotionally or invite response naturally.

Each item should explore a different emotional trigger, story angle, or interaction style.
Avoid repeating the same structure such as:
- lyric explanation
- studio clip
- audience question
more than once per week.

Hard requirements for EACH item:
Each item must contain these fields:

hook
idea
visual_suggestions (2 simple visual ideas)
on_screen_text
end_beat
production_note

Each day must contain a different core idea.
Do not repeat the same concept structure twice in the same week.

Keep everything short, clear, and easy to execute.
- "title" must be specific (avoid "Content slot", "Quick win").
- "suggested_caption" must sound human and specific to the idea (no generic motivational filler).
- Avoid near-duplicates: do not reuse the same hook style more than once per week.
- If "Content mix targets" are provided, roughly match pillar distribution across the plan.
- If an "Energy pattern" is provided (Mon..Sun), match effort level:
  - low → low-lift (talking head, VO, lyric text, simple clips)
  - medium → balanced (hook → context → payoff)
  - high → higher energy (performance, stronger edits, bolder concepts)

Output STRICTLY valid JSON with this shape:

{
  "items": [
    {
      "date": "YYYY-MM-DD",
      "platform": "instagram",
      "title": "Short internal title",
      "short_label": "Very short label",
      "pillar": "Performance / Story / BTS / Education / Community / Other",
      "format": "content format",

      "hook": "First line said or shown",

      "idea": "Short explanation of the content concept",

      "visual_suggestions": [
        "Simple visual suggestion",
        "Second visual suggestion"
      ],

      "on_screen_text": "Text that appears on screen",

      "end_beat": "How the video ends",

      "production_note": "Simple note about where or when to film",

      "suggested_caption": "Platform appropriate caption",

      "angle": "Why this works for the audience",

      "cta": "Soft CTA"
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

Creative mode guidance:

Each day must follow this creative mode rotation:

Day 1: Story / confession
Day 2: Performance moment
Day 3: Audience interaction
Day 4: Behind-the-scenes
Day 5: Opinion / hot take
Day 6: Lyric / music insight
Day 7: Experimental or visually creative

Then repeat the pattern if the calendar is longer.

The idea for each day must clearly match its creative mode.

You MUST:
- Generate EXACTLY ${totalSlots} items.
- Never return fewer or more items.
- Ensure dates are valid calendar dates after the start date.
- Always include "suggested_caption" and "short_label".

For variety across the plan:
- In every 7-item block, make sure the items span different creative modes.
- In every 7-item block, do not repeat the same mechanic twice.
- In every 7-item block, include a balance of:
  1) one performance-based idea
  2) one story/confession idea
  3) one community/audience interaction idea
  4) one insight/opinion/education idea
  5) one visually-led or metaphor-led idea
- The remaining items can be hybrids, but must still feel distinct.
- If one idea feels too close to an earlier day, replace it with a different mechanic instead of paraphrasing it.
`.trim()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 1.05,
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

let items = parsed.items || []

const fallbackIdeaBank: Array<{
  title: string
  short_label: string
  pillar: string
  format: string
  idea: string
  suggested_caption: string
  angle: string
  cta: string
}> = [
  {
    title: 'Why this lyric matters',
    short_label: 'Lyric meaning',
    pillar: 'Story',
    format: 'Talking to camera',
    idea: 'Explain one lyric or emotional theme from your music and why it still stays with you.',
    suggested_caption: 'Some lyrics stay with you long after writing them.',
    angle: 'Creates emotional connection with the audience.',
    cta: 'Tell me a lyric that stayed with you.',
  },
  {
    title: 'Small studio truth',
    short_label: 'Studio moment',
    pillar: 'BTS',
    format: 'Phone clip + voiceover',
    idea: 'Show a real moment from your music process such as a rough take or writing note.',
    suggested_caption: 'Not every music moment is cinematic.',
    angle: 'Makes the artist feel relatable and human.',
    cta: 'Want more studio moments?',
  },
  {
    title: 'Question for listeners',
    short_label: 'Audience prompt',
    pillar: 'Community',
    format: 'Talking to camera',
    idea: 'Ask fans a thoughtful question connected to music, mood, or identity.',
    suggested_caption: 'Real question — what music helps you when life gets heavy?',
    angle: 'Encourages real comments instead of empty engagement.',
    cta: 'Answer honestly.',
  },
  {
    title: 'Short performance',
    short_label: 'Performance',
    pillar: 'Performance',
    format: 'Vertical performance clip',
    idea: 'Perform a short emotional section of a song in a simple setting.',
    suggested_caption: 'Just a small piece of this one.',
    angle: 'Lets the music speak directly.',
    cta: 'Should I post the full version?',
  },
  {
    title: 'Song origin',
    short_label: 'Song story',
    pillar: 'Story',
    format: 'Talking to camera',
    idea: 'Explain the real moment or feeling that caused a song idea.',
    suggested_caption: 'This song came from a very specific moment.',
    angle: 'Fans connect more when they understand the origin.',
    cta: 'Want more behind-the-song stories?',
  },
  {
    title: 'Creative belief shift',
    short_label: 'Hot take',
    pillar: 'Education',
    format: 'Talking to camera',
    idea: 'Share one belief you had about music or creativity that you changed your mind about.',
    suggested_caption: 'One belief I had to let go of as an artist.',
    angle: 'Opinion-led posts spark discussion.',
    cta: 'Agree or disagree?',
  },
]

items = items.filter(item => {
  const text = [
    item?.title,
    item?.idea,
    item?.suggested_caption,
    item?.angle,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return !text.includes('simple, shootable idea for') && !text.includes('supports the goal')
})

// ---------- STEP 1: Trim if too many ----------
if (items.length > totalSlots) {
  items = items.slice(0, totalSlots)
}

// ---------- STEP 2: Fill missing slots ----------
if (items.length < totalSlots) {
  const missing = totalSlots - items.length

  const fallbackIdeaBank: Array<{
  title: string
  short_label: string
  pillar: string
  format: string
  idea: string
  suggested_caption: string
  angle: string
  cta: string
}> = [
  {
    title: 'The line I still think about',
    short_label: 'Lyric meaning',
    pillar: 'Story',
    format: 'Talking to camera',
    idea: 'Talk about one line, image, or feeling from your music that still follows you after writing it, and explain why it stayed.',
    suggested_caption: 'Some lyrics leave you before the song even comes out. Some stay with you for ages.',
    angle: 'Turns the music into a conversation and gives the audience a way into the emotional world behind it.',
    cta: 'Tell me a line you wish you wrote.',
  },
  {
    title: 'Small performance, big feeling',
    short_label: 'Performance',
    pillar: 'Performance',
    format: 'Vertical performance clip',
    idea: 'Perform a short section of a song in a simple setting, focusing on emotion and delivery rather than polish.',
    suggested_caption: 'No big setup. Just the feeling.',
    angle: 'Lets the music do the work while keeping the post easy to shoot.',
    cta: 'Want the full section next?',
  },
  {
    title: 'Question for the people who feel deeply',
    short_label: 'Audience prompt',
    pillar: 'Community',
    format: 'Talking to camera',
    idea: 'Ask a specific question tied to emotion, identity, or the kind of nights your music belongs to.',
    suggested_caption: 'Real question: what kind of song finds you when your head is loud?',
    angle: 'Encourages meaningful comments instead of shallow engagement bait.',
    cta: 'Answer properly, I’m curious.',
  },
  {
    title: 'What people don’t see',
    short_label: 'Behind the scenes',
    pillar: 'BTS',
    format: 'Phone clip + voiceover',
    idea: 'Show a normal, unglamorous part of your process — notes, rough takes, deleted drafts, or a small stuck moment.',
    suggested_caption: 'Not every creative moment looks impressive. Some of them just look honest.',
    angle: 'Humanises the artist and makes the work feel more real.',
    cta: 'Want more of the messy side?',
  },
  {
    title: 'A belief I had to outgrow',
    short_label: 'Hot take',
    pillar: 'Education',
    format: 'Talking to camera',
    idea: 'Share one belief you used to have about music, consistency, creativity, or growth that you no longer agree with.',
    suggested_caption: 'One thing I had to stop believing if I wanted to grow.',
    angle: 'Opinion-led content creates stronger hooks and gives people something to react to.',
    cta: 'Agree or disagree?',
  },
  {
    title: 'If this song was a scene',
    short_label: 'Visual metaphor',
    pillar: 'Other',
    format: 'Voiceover + visual clip',
    idea: 'Describe or show what kind of room, weather, street, or late-night moment your song feels like.',
    suggested_caption: 'Some songs feel less like songs and more like places.',
    angle: 'Creates atmosphere and identity without needing a complicated shoot.',
    cta: 'What scene do you see?',
  },
  {
    title: 'What this song came out of',
    short_label: 'Song origin',
    pillar: 'Story',
    format: 'Talking to camera',
    idea: 'Tell the story of the feeling, event, or internal shift that made the song happen.',
    suggested_caption: 'This song didn’t come from nowhere.',
    angle: 'People connect more deeply when they understand the emotional origin of the work.',
    cta: 'Want more behind-the-song stories?',
  },
  {
    title: 'Tiny lesson from making music',
    short_label: 'Mini lesson',
    pillar: 'Education',
    format: 'Talking to camera',
    idea: 'Share one short lesson from your recent creative process that could help another artist or listener understand your mindset.',
    suggested_caption: 'A small thing music has been teaching me lately.',
    angle: 'Adds value while still building artist identity.',
    cta: 'Should I do more posts like this?',
  },
]

for (let i = 0; i < missing; i++) {
  const absoluteIndex = items.length + i
  const date = addDaysIso(startDate, absoluteIndex)
  const platform = safePlatforms[absoluteIndex % safePlatforms.length]
  const fallback =
  fallbackIdeaBank[(absoluteIndex + Math.floor(Math.random() * fallbackIdeaBank.length)) % fallbackIdeaBank.length]

  items.push({
    date,
    platform,
    title: fallback.title,
    short_label: fallback.short_label,
    pillar: fallback.pillar,
    format: fallback.format,
    idea: fallback.idea,
    suggested_caption: fallback.suggested_caption,
    angle: fallback.angle,
    cta: fallback.cta,
  })
}

}

// ---------- STEP 3: Clean empty ideas ----------
items = items.map((item, index) => ({
  ...item,
  date: item.date || addDaysIso(startDate, index),
  platform: safePlatforms.includes(item.platform) ? item.platform : safePlatforms[0],
  title: item.title || 'Content idea',
  short_label: item.short_label || 'Post',
  pillar: item.pillar || 'Other',
  format: item.format || 'Vertical video',
  idea:
    item.idea ||
    `Share a short moment from your music process today — something real that fans don't usually see.`,
  suggested_caption:
    item.suggested_caption ||
    `Random thought while making music today.`,
  angle: item.angle || 'Keeps the content human and relatable.',
  cta: item.cta || 'Let me know if this resonates.',
}))

// ---------- STEP 4: Remove repeated ideas ----------
const deduped: CalendarItem[] = []

for (let i = 0; i < items.length; i++) {
  const item = items[i]
  const duplicate = deduped.some(existing => isTooSimilarIdea(existing, item))

  if (!duplicate) {
    deduped.push(item)
    continue
  }

  const fallback = fallbackIdeaBank[i % fallbackIdeaBank.length]

  deduped.push({
    date: item.date || addDaysIso(startDate, i),
    platform: safePlatforms.includes(item.platform) ? item.platform : safePlatforms[0],
    title: `${fallback.title}`,
    short_label: fallback.short_label,
    pillar: fallback.pillar,
    format: fallback.format,
    idea: fallback.idea,
    suggested_caption: fallback.suggested_caption,
    angle: fallback.angle,
    cta: fallback.cta,
  })
}

items = deduped

// ---------- STEP 5: Final exact length safety ----------
if (items.length > totalSlots) {
  items = items.slice(0, totalSlots)
}

while (items.length < totalSlots) {
  const i = items.length
  const fallback = fallbackIdeaBank[i % fallbackIdeaBank.length]

  items.push({
    date: addDaysIso(startDate, i),
    platform: safePlatforms[i % safePlatforms.length],
    title: fallback.title,
    short_label: fallback.short_label,
    pillar: fallback.pillar,
    format: fallback.format,
    idea: fallback.idea,
    suggested_caption: fallback.suggested_caption,
    angle: fallback.angle,
    cta: fallback.cta,
  })
}

return NextResponse.json({ items }, { status: 200 })


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
