// src/app/api/calendar/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey }) : null

type CalendarRequest = {
  artistName?: string
  genre?: string
  artistType?: string
  performanceStyle?: string
  audience?: string
  goal?: string
  startDate?: string
  weeks?: number
  postsPerWeek?: number
  platforms?: string[]
  lyrics?: string
  lyricsFocus?: string
  avoidTitles?: string[]
  focusMode?: string
  releaseContext?: string
  tone?: string
  ideaDepth?: 'simple' | 'balanced' | 'detailed'
  mix?: { promo: number; brand: number; community: number; bts: number; lifestyle: number }
  energyPattern?: Array<'low' | 'medium' | 'high'>
  noveltySeed?: string

  contextSource?: 'manual' | 'campaign' | 'release_strategy'
  selectedCampaignId?: string | null
  selectedReleaseStrategyId?: string | null
  campaignContext?: {
    id?: string
    title?: string | null
    notes?: string | null
    created_at?: string
    inputs?: any
    concepts?: any
  } | null
  releaseStrategyContext?: {
    id?: string
    title?: string | null
    notes?: string | null
    created_at?: string
    inputs?: any
    result?: any
  } | null
}

export type CalendarItem = {
  date: string
  platform: string
  title: string
  short_label: string
  pillar: string
  format: string
  idea: string
  suggested_caption: string
  angle: string
  cta: string
  structured?: {
    title: string
    platform: string
    contentType: string
    hook: string
    concept: string
    execution: string
    cta: string
    why: string[]
  }
}

type AiCalendarItem = {
  date?: string
  platform?: string
  title?: string
  short_label?: string
  pillar?: string
  content_type?: string
  hook?: string
  concept?: string
  execution?: string
  suggested_caption?: string
  cta?: string
  why?: string[]
}

type CalendarResponse = {
  items: AiCalendarItem[]
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
  genre?: string
  focusMode?: string
  releaseContext?: string
  ideaDepth?: 'simple' | 'balanced' | 'detailed'
  contextSource?: 'manual' | 'campaign' | 'release_strategy'
  campaignContext?: CalendarRequest['campaignContext']
  releaseStrategyContext?: CalendarRequest['releaseStrategyContext']
}) {
  const {
    startDate,
    totalSlots,
    platforms,
    artistName,
    goal,
    genre = '',
    focusMode = 'general',
    releaseContext = '',
    ideaDepth = 'balanced',
    contextSource = 'manual',
    campaignContext = null,
    releaseStrategyContext = null,
  } = args

  const items: CalendarItem[] = []

  for (let i = 0; i < totalSlots; i++) {
    items.push(
      buildFallbackItem({
        startDate,
        index: i,
        platforms,
        artistName,
        goal,
        genre,
        focusMode,
        releaseContext,
        ideaDepth,
        contextSource,
        campaignContext,
        releaseStrategyContext,
      })
    )
  }

  return { items }
}

function buildFallbackItem(args: {
  startDate: string
  index: number
  platforms: string[]
  artistName: string
  goal: string
  genre?: string
  focusMode?: string
  releaseContext?: string
  ideaDepth: 'simple' | 'balanced' | 'detailed'
  contextSource?: 'manual' | 'campaign' | 'release_strategy'
  campaignContext?: CalendarRequest['campaignContext']
  releaseStrategyContext?: CalendarRequest['releaseStrategyContext']
  usedTitles?: string[]
usedConcepts?: string[]
}): CalendarItem {
  const {
    startDate,
    index,
    platforms,
    artistName,
    goal,
    genre = '',
    focusMode = 'general',
    releaseContext = '',
    ideaDepth,
    contextSource = 'manual',
    campaignContext = null,
    releaseStrategyContext = null,
    usedTitles = [],
usedConcepts = [],
  } = args

  const date = addDaysIso(startDate, index)
  const platform = platforms[index % platforms.length] || 'instagram'

  const conceptsRoot = campaignContext?.concepts?.concepts || campaignContext?.concepts || []
  const firstConcept = Array.isArray(conceptsRoot) ? conceptsRoot[0] : null

  const campaignTitle = safeString(campaignContext?.title || firstConcept?.name || '').trim()
  const campaignHook = safeString(firstConcept?.hook || '').trim()
  const campaignSynopsis = safeString(firstConcept?.synopsis || '').trim()

  const releaseStrategyTitle = safeString(releaseStrategyContext?.title || '').trim()

  const simple = ideaDepth === 'simple'
  const detailed = ideaDepth === 'detailed'

  const usedPool = [...usedTitles, ...usedConcepts].map(normalizeForComparison)
    

  const fallbackVariants = [
    {
      title: 'Lyric spotlight for a line people missed',
      pillar: 'Education',
      format: 'education',
      idea: 'Take one lyric, bar, or phrase and unpack why it matters, what it means, or why people may have missed it.',
      hook: 'Did you catch what I really meant here?',
      execution: 'Perform or show the line, then explain the meaning or subtext in a short follow-up.',
      cta: 'What line should I break down next?',
    },
    {
      title: 'Story behind a specific moment',
      pillar: 'Story',
      format: 'story',
      idea: 'Tell the real-life moment, memory, or emotional situation that sits behind one lyric or theme.',
      hook: 'This part came from something real.',
      execution: 'Talk to camera and connect one lyric, verse, or theme to a specific lived moment.',
      cta: 'Want more stories behind the songs?',
    },
    {
      title: 'Fan reaction or community prompt',
      pillar: 'Community',
      format: 'community',
      idea: 'Use a question, comment prompt, or audience-facing angle to pull people into the song world.',
      hook: 'I want to know what this one means to you.',
      execution: 'Frame the post around a question, fan prompt, or reaction invitation tied to the music.',
      cta: 'Drop your take below.',
    },
    {
      title: 'Behind-the-scenes creative insight',
      pillar: 'BTS',
      format: 'bts',
      idea: 'Show a small creative process detail, writing insight, or behind-the-scenes thought that gives the idea more depth.',
      hook: 'Here’s something from behind the scenes.',
      execution: 'Share one real creative detail, process note, or writing moment in a simple direct clip.',
      cta: 'Want more behind-the-scenes moments?',
    },
    {
      title: 'Visual or lifestyle-led angle',
      pillar: 'Visual',
      format: 'visual',
      idea: 'Build one low-lift visual or lifestyle-led post that still connects back to the music or its emotional world.',
      hook: 'This is the kind of feeling the track lives in.',
      execution: 'Capture a simple visual, environment, or daily-life moment that connects back to the song mood or message.',
      cta: 'Does this world fit the song for you?',
    },
  ]
const variantIndex = (index + usedTitles.length + usedConcepts.length) % fallbackVariants.length
  const variant = fallbackVariants[variantIndex]
  

    let title = variant.title
  let pillar = variant.pillar
  let format = variant.format
  let idea = variant.idea
  let hook = variant.hook
  let execution = variant.execution
  let cta = variant.cta
  let why = [
    'Low-friction ideas are easier to execute consistently.',
    'Keeps momentum going without needing a complex setup.',
  ]

  if (focusMode === 'old_release') {
    title = 'Bring an older track back into focus'
    pillar = 'Story'
    format = 'story'
    idea = simple
      ? `Revisit one older song and give people a fresh reason to care about it now.`
      : `Create a post that reintroduces an older release through reflection, meaning, memory, or a fresh angle that makes it feel relevant again.`
    hook = 'This track still has something to say.'
    execution = detailed
      ? `Record a direct-to-camera clip or lyric-led visual that connects one older song to who you are now. Reference a specific line, moment, or feeling, and keep the framing personal rather than promotional.`
      : `Film a short direct-to-camera or lyric-led clip that revisits an older release and explains why it still matters.`
    cta = 'Which older track should I revisit next?'
    why = [
      'Older songs can gain new life when reframed with meaning or hindsight.',
      'Catalogue content builds value without needing a new release.',
    ]
  } else if (focusMode === 'release') {
    title = 'Support the current release with a clear angle'
    pillar = 'Story'
    format = 'story'
    idea = simple
      ? `Make one short post that gives people a reason to care about the current release.`
      : `Create a focused post that supports the current release by highlighting one emotional, lyrical, or personal angle behind it.`
    hook = 'Here’s the part of this release that matters most to me.'
    execution = detailed
      ? `Record a short clip that isolates one part of the release story — a lyric meaning, emotional shift, visual theme, or creative decision — and build the post around that single angle. Context should be specific and concise.`
      : `Film one short clip explaining or showing a key angle behind the release in a way that feels natural and easy to post.`
    cta = 'What part of the release stands out most to you?'
    why = [
      'Single-angle release content is easier to understand and engage with.',
      'Helps the release feel more human and memorable.',
    ]
  } else if (focusMode === 'gig') {
    title = 'Turn live momentum into content'
    pillar = 'BTS'
    format = 'bts'
    idea = simple
      ? `Post one simple piece of content that builds anticipation around the live moment.`
      : `Create a practical live-focused post that builds anticipation, captures preparation, or reflects the energy around an upcoming show.`
    hook = 'This is the energy I’m taking into the next show.'
    execution = detailed
      ? `Film a short preparation or reflection clip around rehearsal, setlist thinking, nerves, or performance energy. Keep it grounded in what the live moment actually means rather than generic promo.`
      : `Film a short clip that shows preparation, anticipation, or reflection around the show.`
    cta = 'Who’s pulling up?'
    why = [
      'Live context creates urgency and natural story tension.',
      'Turns performance moments into content without overcomplicating them.',
    ]
  } else if (focusMode === 'growth') {
    title = 'Make one highly relatable growth post'
    pillar = 'Community'
    format = 'community'
    idea = simple
      ? `Post a short relatable idea designed to start conversation and bring new people in.`
      : `Create a relatable, audience-facing post that encourages response, sharing, or conversation while still sounding like the artist.`
    hook = 'You ever feel like this too?'
    execution = detailed
      ? `Record a short thought, feeling, or observation that your audience is likely to recognise in themselves. Keep the framing specific enough to feel personal, but open enough for people to project onto.`
      : `Film a short direct-to-camera post with a relatable thought or question that encourages response.`
    cta = 'Tell me if this hits for you.'
    why = [
      'Relatable posts are easier for new people to respond to.',
      'Strong audience recognition helps growth content travel further.',
    ]
  }

  if (contextSource === 'campaign' && firstConcept) {
    title = simple
      ? (campaignTitle || 'Campaign-led content idea')
      : campaignTitle
      ? `Bring the ${campaignTitle} campaign world into content`
      : 'Campaign-led content idea'

    pillar = 'Visual'
    format = 'visual'
    idea = campaignSynopsis
      ? `Create one content idea that feels like a natural execution of the campaign world: ${campaignSynopsis}`
      : `Create one post that clearly belongs to the campaign world and extends its concept into content.`

    hook = campaignHook && campaignHook.toLowerCase() !== title.toLowerCase()
      ? campaignHook
      : 'This is another piece of the world I’m building.'

    execution = detailed
      ? `Use the campaign’s tone, world, and visual logic to make one focused content execution. Keep it simple enough to shoot, but specific enough that it feels like part of the same rollout — not a random standalone post.`
      : `Make one simple post that feels visually and emotionally connected to the campaign. Keep it clear, branded, and easy to execute.`

    cta = 'Which part of this campaign world hits you most?'
    why = [
      'Campaign-led ideas make the rollout feel coherent.',
      'Keeps content aligned with the bigger creative direction.',
    ]
  } else if (contextSource === 'release_strategy' && releaseStrategyContext) {
    title = releaseStrategyTitle
      ? `Execution idea from ${releaseStrategyTitle}`
      : 'Release-strategy-led content idea'

    pillar = 'Story'
    format = 'story'
    idea = `Create one post that turns the current release strategy into an actual piece of content your audience can understand and engage with.`
    hook = 'Let me show you one part of this rollout in a real way.'
    execution = detailed
      ? `Take one strategic angle from the rollout and turn it into a simple, clear content execution. Prioritise clarity, timing, and relevance over complexity.`
      : `Turn one rollout idea into a short, practical post that feels easy to make and easy to understand.`
    cta = 'Want more from this rollout?'
    why = [
      'Strategy becomes more valuable when it turns into actual content.',
      'Makes the rollout easier to execute consistently.',
    ]
  }

  if (releaseContext && focusMode !== 'old_release' && contextSource === 'manual') {
    idea = `${idea} Use this context where helpful: ${releaseContext}.`
  }

  if (genre && format === 'story') {
    why = why.map((line, idx) =>
      idx === 0 ? `${line} Fits the artist’s ${genre} lane.` : line
    )
  }

  const fallbackCaption =
  contextSource === 'campaign' && campaignTitle
    ? simple
      ? `Another piece of the ${campaignTitle} world.`
      : `Building out the ${campaignTitle} campaign world one post at a time.`
    : focusMode === 'old_release'
    ? simple
      ? `This older track still deserves a moment.`
      : `Bringing an older release back into focus with a new angle.`
    : focusMode === 'release'
    ? simple
      ? `One more angle around this release.`
      : `Keeping the release moving with a more human, specific angle.`
    : focusMode === 'gig'
    ? simple
      ? `Turning live energy into content.`
      : `Taking the energy around the show and turning it into something worth posting.`
    : focusMode === 'growth'
    ? simple
      ? `A simple post designed to connect.`
      : `A stronger audience-facing post that still feels natural to the artist.`
    : simple
    ? `One post to keep the momentum moving.`
    : `A clear, usable post that keeps momentum moving without overcomplicating the content.`

  return {
    date,
    platform,
    title,
    short_label: title,
    pillar,
    format,
    idea,
    suggested_caption: fallbackCaption,
    angle: execution,
    cta,
    structured: {
      title,
      platform,
      contentType: format,
      hook,
      concept: idea,
      execution,
      cta,
      why: simple ? why.slice(0, 1) : why.slice(0, 2),
    },
  }
}

function safeString(x: unknown) {
  return typeof x === 'string' ? x : x == null ? '' : String(x)
}

function bulletList(items: string[]) {
  return items.filter(Boolean).map(x => `- ${x}`).join('\n') || 'None'
}

function extractCampaignContextBlock(campaignContext: CalendarRequest['campaignContext']) {
  if (!campaignContext) return 'No campaign context provided.'

  const inputs = campaignContext.inputs || {}
  const conceptsRoot = campaignContext.concepts?.concepts || campaignContext.concepts || []
  const concepts = Array.isArray(conceptsRoot) ? conceptsRoot : []
  const first = concepts[0] || {}

  const visual = first.visual_direction || {}
  const timeline = first.timeline || {}

  const lines: string[] = []

  if (campaignContext.title) lines.push(`Campaign title: ${campaignContext.title}`)
  if (campaignContext.notes) lines.push(`Campaign notes: ${campaignContext.notes}`)

  if (inputs.artistName) lines.push(`Campaign artist name: ${inputs.artistName}`)
  if (inputs.genre) lines.push(`Campaign genre: ${inputs.genre}`)
  if (inputs.audience) lines.push(`Campaign audience: ${inputs.audience}`)
  if (inputs.goal) lines.push(`Campaign goal: ${inputs.goal}`)

  if (first.name) lines.push(`Primary concept name: ${first.name}`)
  if (first.hook) lines.push(`Primary concept hook: ${first.hook}`)
  if (first.synopsis) lines.push(`Primary concept synopsis: ${first.synopsis}`)

  const deliverables = Array.isArray(first.deliverables) ? first.deliverables.map(safeString).filter(Boolean) : []
  const tones = Array.isArray(first.caption_tones) ? first.caption_tones.map(safeString).filter(Boolean) : []
  const shotlist = Array.isArray(visual.shotlist) ? visual.shotlist.map(safeString).filter(Boolean) : []
  const palette = Array.isArray(visual.palette) ? visual.palette.map(safeString).filter(Boolean) : []
  const props = Array.isArray(visual.props) ? visual.props.map(safeString).filter(Boolean) : []
  const teasers = Array.isArray(timeline.teasers) ? timeline.teasers.map(safeString).filter(Boolean) : []
  const dropDay = Array.isArray(timeline.drop_day) ? timeline.drop_day.map(safeString).filter(Boolean) : []
  const postDrop = Array.isArray(timeline.post_drop) ? timeline.post_drop.map(safeString).filter(Boolean) : []

  lines.push(`Deliverables:\n${bulletList(deliverables)}`)
  lines.push(`Caption tones:\n${bulletList(tones)}`)
  lines.push(`Visual shotlist:\n${bulletList(shotlist)}`)
  lines.push(`Visual palette:\n${bulletList(palette)}`)
  lines.push(`Visual props:\n${bulletList(props)}`)
  lines.push(`Teaser timeline ideas:\n${bulletList(teasers)}`)
  lines.push(`Drop-day ideas:\n${bulletList(dropDay)}`)
  lines.push(`Post-drop ideas:\n${bulletList(postDrop)}`)

  return lines.join('\n')
}

function extractReleaseStrategyContextBlock(
  releaseStrategyContext: CalendarRequest['releaseStrategyContext']
) {
  if (!releaseStrategyContext) return 'No release strategy context provided.'

  const inputs = releaseStrategyContext.inputs || {}
  const result = releaseStrategyContext.result || {}

  const lines: string[] = []

  if (releaseStrategyContext.title) lines.push(`Release strategy title: ${releaseStrategyContext.title}`)
  if (releaseStrategyContext.notes) lines.push(`Release strategy notes: ${releaseStrategyContext.notes}`)

  if (inputs.artistName) lines.push(`Release strategy artist name: ${inputs.artistName}`)
  if (inputs.genre) lines.push(`Release strategy genre: ${inputs.genre}`)
  if (inputs.audience) lines.push(`Release strategy audience: ${inputs.audience}`)
  if (inputs.goal) lines.push(`Release strategy goal: ${inputs.goal}`)

  // Keep this generic and safe because the exact schema may vary.
  lines.push(`Release strategy result summary:`)
  lines.push(JSON.stringify(result).slice(0, 2500))

  return lines.join('\n')
}

function normalizeForComparison(value: string) {
  return safeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function significantWords(value: string) {
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'for', 'on', 'in', 'at', 'by', 'with',
    'is', 'it', 'this', 'that', 'these', 'those', 'my', 'your', 'our', 'their',
    'i', 'you', 'we', 'they', 'me', 'us',
    'post', 'video', 'content', 'idea', 'clip', 'show', 'make'
  ])

  return normalizeForComparison(value)
    .split(' ')
    .filter(Boolean)
    .filter(word => word.length > 2 && !stop.has(word))
}

function jaccardSimilarity(a: string[], b: string[]) {
  const aSet = new Set(a)
  const bSet = new Set(b)
  const intersection = [...aSet].filter(x => bSet.has(x)).length
  const union = new Set([...aSet, ...bSet]).size
  return union === 0 ? 0 : intersection / union
}

function buildIdeaFingerprint(item: {
  title?: string
  hook?: string
  concept?: string
  execution?: string
}) {
  const titleWords = significantWords(item.title || '')
  const hookWords = significantWords(item.hook || '')
  const conceptWords = significantWords(item.concept || '')
  const executionWords = significantWords(item.execution || '')

  return {
    title: normalizeForComparison(item.title || ''),
    hook: normalizeForComparison(item.hook || ''),
    concept: normalizeForComparison(item.concept || ''),
    execution: normalizeForComparison(item.execution || ''),
    pooledWords: [...titleWords, ...hookWords, ...conceptWords, ...executionWords],
  }
}

function isNearDuplicateIdea(
  candidate: {
    title?: string
    hook?: string
    concept?: string
    execution?: string
  },
  accepted: Array<{
    title?: string
    hook?: string
    concept?: string
    execution?: string
  }>
) {
  const next = buildIdeaFingerprint(candidate)


  return accepted.some(prev => {
    const old = buildIdeaFingerprint(prev)

    const exactTitle = next.title && next.title === old.title
    const exactHook = next.hook && next.hook === old.hook
    const exactConcept = next.concept && next.concept === old.concept
    const exactExecution = next.execution && next.execution === old.execution

    if (exactTitle || exactHook || exactConcept || exactExecution) return true

    const sameTitleAndHookFamily =
  next.title &&
  old.title &&
  next.hook &&
  old.hook &&
  jaccardSimilarity(significantWords(next.title), significantWords(old.title)) >= 0.75 &&
  jaccardSimilarity(significantWords(next.hook), significantWords(old.hook)) >= 0.55

if (sameTitleAndHookFamily) return true

const sameConceptAndExecutionFamily =
  jaccardSimilarity(significantWords(next.concept), significantWords(old.concept)) >= 0.65 &&
  jaccardSimilarity(significantWords(next.execution), significantWords(old.execution)) >= 0.5

if (sameConceptAndExecutionFamily) return true

    const wordSimilarity = jaccardSimilarity(next.pooledWords, old.pooledWords)

    return wordSimilarity >= 0.58
  })
}

function tooManySameFormat(
  candidate: { format?: string; pillar?: string },
  accepted: Array<{ format?: string; pillar?: string }>,
  totalSlots: number
) {
  const sameFormatCount = accepted.filter(
    item => normalizeForComparison(item.format || '') === normalizeForComparison(candidate.format || '')
  ).length

  const samePillarCount = accepted.filter(
    item => normalizeForComparison(item.pillar || '') === normalizeForComparison(candidate.pillar || '')
  ).length

  // Prevent overloading one format/pillar too heavily in a batch.
  const maxPerBucket = totalSlots >= 10 ? 3 : totalSlots >= 7 ? 2 : 2

  return sameFormatCount >= maxPerBucket && samePillarCount >= maxPerBucket
}

export async function POST(req: Request) {
  let body: CalendarRequest = {}
  try {
    body = (await req.json()) as CalendarRequest
  } catch {}

    const {
    artistName = 'the artist',
    genre = '',
    artistType = '',
    performanceStyle = '',
    audience = '',
    goal = '',
    tone = 'brand-consistent, concise, human, engaging',
    ideaDepth = 'balanced',
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
    contextSource = 'manual',
    selectedCampaignId = null,
    selectedReleaseStrategyId = null,
    campaignContext = null,
    releaseStrategyContext = null,
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

const targetCandidateCount = Math.max(totalSlots + 4, Math.ceil(totalSlots * 1.6))

  const ideaDepthGuidance =
  ideaDepth === 'simple'
    ? `
Idea depth mode: SIMPLE
- Give very easy, low-pressure ideas that can be posted today.
- Prefer single-beat concepts.
- Keep concept to 1 short sentence.
- Keep execution to 1 short sentence.
- Keep hook short and direct.
- Avoid layered storytelling, explanation-heavy framing, or breakdown-style content.
- Prefer ideas that feel immediate, natural, and low effort.
- Keep "why" to exactly 1 short line.
- Keep each field compact so the response stays fast and lightweight.
`.trim()
    : ideaDepth === 'detailed'
    ? `
Idea depth mode: DETAILED
- Give richer ideas with more substance, specificity, and emotional or creative framing.
- Keep concept close to Balanced in length and clarity.
- Put the main difference in execution.
- Execution can include small but valuable filming details such as camera framing, angle, location, movement, lighting, or time of day.
- These details should make the idea feel more intentional, not more overwhelming.
- Do not make detailed ideas bloated, overproduced, or difficult to shoot.
- Keep "why" to exactly 2 short lines.
`.trim()
    : `
Idea depth mode: BALANCED
- Give clear, strong, usable ideas with moderate depth.
- Concept should usually be 1 sentence.
- Execution should usually be 1-2 sentences.
- Balanced should feel more developed than simple, but easier and lighter than detailed.
- Prefer ideas with a clear angle and just enough filming direction to act on quickly.
- Keep "why" to 1-2 short lines.
`.trim()

  if (!openai) {
    return NextResponse.json(
      {
        ...fallbackCalendar({
  startDate,
  totalSlots,
  platforms,
  artistName,
  goal,
  genre,
  focusMode,
  releaseContext,
  ideaDepth,
  contextSource,
  campaignContext,
  releaseStrategyContext,
}),
        _fallback: true,
        _fallbackReason: 'missing_openai_key',
      },
      { status: 200 }
    )
  }

  const contextLines: string[] = []
  if (genre) contextLines.push(`Genre / lane: ${genre}`)
  if (artistType) contextLines.push(`Artist type: ${artistType}`)
  if (performanceStyle) contextLines.push(`Performance / creation style: ${performanceStyle}`)
  if (audience) contextLines.push(`Audience: ${audience}`)
  if (goal) contextLines.push(`Primary goal: ${goal}`)

  const contextBlock = contextLines.length
    ? contextLines.join('\n')
    : 'No extra context was given. Infer a reasonable plan for an independent artist.'
  const campaignContextBlock = extractCampaignContextBlock(campaignContext)
  const releaseStrategyContextBlock = extractReleaseStrategyContextBlock(releaseStrategyContext)

  const oldReleaseGuidance =
    focusMode === 'old_release'
      ? `
Old release focus:
- The user wants ideas for an older existing release, not a new drop.
- Prioritize rediscovery, recontextualising, nostalgia, overlooked bars/lyrics, “you missed this” framing, fan memory, story-behind-the-song, and fresh angles that revive catalogue momentum.
- Avoid language that assumes the song is brand new unless the supplied context explicitly says so.
- Good old-release ideas can include: lyric reframes, meaning/story posts, performance revisits, alternate visual cuts, acoustic/live reintroductions, fan-comment reactions, “still relevant” angles, and personal reflections on the song after time has passed.
`.trim()
      : ''
  const systemPrompt = `
You are an expert music marketing strategist and content calendar architect.
You design practical, shootable content plans that respect an artist's reality
(time, energy, budget) while still pushing growth.

Rules:
${ideaDepthGuidance}
- Mix content pillars: performance, storytelling, behind-the-scenes, education, community.
- Avoid near-duplicates. Each slot should feel distinct but on-brand.
- If an "Avoid list" is provided, do NOT reuse or closely paraphrase those titles/hooks/ideas.
- Make ideas feel like real platform-native content, not generic marketing suggestions.
- Prefer strong hooks built on POV, contrast, curiosity, vulnerability, specificity, tension, or relatability.
- For DETAILED mode, increase specificity, not complexity.
- Do not make detailed ideas bloated, multi-scene, or overproduced unless the user's brief clearly supports that.
- Titles should feel scroll-stopping, not bland or corporate.
- Execution should be shootable by a solo independent artist.
- Respect AUDIENCE language and interests.
- Respect the artist's actual creative and performance setup.
- Do NOT suggest instruments, band performance ideas, DJ actions, or music-making workflows unless they clearly fit the stated artist type or performance style.
- If the artist is a rapper or says they do not play instruments, avoid instrument-based suggestions entirely.
- Assume a realistic solo/DIY artist workload: don't make every slot insanely complex.
- In DETAILED mode, the extra value should come mainly from the "execution" field, using light-touch filming direction such as framing, angle, location, lighting, pacing, or time of day.
- Do not make title, hook, or concept much longer in DETAILED mode than in BALANCED mode.
- If contextSource is "campaign", use campaign concept, rollout, tone, deliverables, and visual direction to shape the ideas.
- If contextSource is "release_strategy", use that strategic direction to shape the ideas.
- If focusMode is "old_release", generate ideas for catalogue revival and renewed attention rather than new-release hype.
- When campaign context is present, the ideas should feel like they belong to the campaign world, not like generic standalone ideas.
- When release strategy context is present, the ideas should reflect the broader rollout logic and priorities.
- Every item must be meaningfully distinct from the others in hook, concept, and execution.
- Do not produce the same idea with small wording changes.
- If two ideas could be mistaken for the same post, make one of them more distinct or replace it entirely.
- Across the batch, vary the content angle, not just the wording.
Output STRICTLY valid JSON with this shape:

{
  "items": [
    {
      "date": "YYYY-MM-DD",
      "platform": "instagram" | "tiktok" | "youtube" | "facebook" | "x",
            "title": "Short internal card title that labels the idea clearly",
      "short_label": "Very short label",
      "pillar": "Performance" | "Story" | "BTS" | "Education" | "Community" | "Visual" | "Humour" | "Other",
      "content_type": "performance" | "story" | "bts" | "education" | "community" | "visual" | "humour" | "other",
      "hook": "A first spoken line, on-screen opener, or opening phrase. It must NOT repeat the title wording.",
      "concept": "A short summary of the idea itself, distinct from the hook",
      "execution": "What the artist actually films or shows, step by step if needed",
      "suggested_caption": "A short human caption",
      "cta": "A natural CTA",
      "why": ["1 short reason", "optional second short reason"]
    }
  ]
}

Rules:
- Return ONLY JSON
- No markdown
- No commentary
- No trailing commas
- Every item must include all required fields
- Keep content_type short and controlled
- Keep why as an array of 1 to 2 short strings
- "title" is a card label, not the spoken hook.
- "hook" must be different from "title" in wording and purpose.
- The title should name the idea clearly; the hook should sound like the first line said, shown, or implied in the content.
- Do not repeat the exact same phrase across title, hook, and concept.
- "concept" should explain the idea, not restate the title.
- Titles should read like clear card labels, not like full spoken sentences unless that is genuinely the best fit.
`.trim()

  const userPrompt = `
Artist: ${artistName}
${contextBlock}
Tone: ${tone}
Idea depth: ${ideaDepth}
Depth interpretation:
${
  ideaDepth === 'simple'
    ? '- The user wants lower-pressure, easier, more immediate ideas.'
    : ideaDepth === 'detailed'
    ? '- The user wants ideas that feel a bit more directed and intentional, especially in how the content is filmed or staged, without becoming overwhelming.'
    : '- The user wants a middle ground: clear, usable, and moderately developed ideas.'
}

Focus mode: ${focusMode}
Release/gig context: ${releaseContext || 'None'}

Context source: ${contextSource}
Selected campaign ID: ${selectedCampaignId || 'None'}
Selected release strategy ID: ${selectedReleaseStrategyId || 'None'}

Campaign context:
${campaignContextBlock}

Release strategy context:
${releaseStrategyContextBlock}

${oldReleaseGuidance || ''}

Artist setup guardrails:
- Artist type: ${artistType || 'Not specified'}
- Performance / creation style: ${performanceStyle || 'Not specified'}
- Only suggest ideas that fit this setup.
- If the artist does not play instruments or is clearly a rapper, do not suggest instrument-playing content.

Content mix targets (approx %):
${mix ? `promo:${mix.promo} brand:${mix.brand} community:${mix.community} bts:${mix.bts} lifestyle:${mix.lifestyle}` : 'Not provided'}

Energy pattern (Mon..Sun):
${Array.isArray(energyPattern) && energyPattern.length ? energyPattern.join(', ') : 'Not provided'}
Session novelty key: ${noveltySeed || 'default'}

Lyrics context (optional):
${lyrics ? `Focus: ${lyricsFocus || 'general'}\nLyrics:\n${lyrics.slice(0, 4000)}` : 'No lyrics provided.'}

Plan parameters:
- Start date: ${startDate}
- Number of weeks: ${weeks}
- Approx posts per week: ${postsPerWeek}
- Allowed platforms: ${platforms.join(', ')}
- Avoid list (do not repeat or closely paraphrase):
${(avoidTitles || []).slice(0, 40).map(t => `- ${t}`).join('\n') || 'None'}

Design a content calendar that:
- Spreads posts across the weeks.
- Uses a mix of the allowed platforms.
- Feels coherent with one artist identity.
- Can be realistically executed by a busy independent artist.

You MUST:
- Return at least ${targetCandidateCount} items.
- It is better to return more candidates than to repeat yourself.
- Ensure dates are valid calendar dates after the start date.
- Keep the ideas genuinely usable.
- Every item must feel clearly different from the others.
- Do not repeat the same concept with minor wording changes.
- If the requested number is high, increase variety across hook, post structure, audience angle, execution style, and content pillar.
- When in doubt, generate extra distinct options rather than repeating an earlier idea.
- If campaign context is present, make the ideas feel like content executions of that campaign.
- If release strategy context is present, make the ideas feel guided by that rollout plan.
- If focusMode is "old_release", make the ideas feel like revival content for an existing song/project.

${
  ideaDepth === 'simple'
    ? '- For SIMPLE mode, prioritize speed and clarity over richness. Keep outputs compact and low-friction.'
    : ''
}
`.trim()

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 1.0,
      presence_penalty: 0.6,
      frequency_penalty: 0.3,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    console.log('[calendar-api] raw model response:\n', raw)

    if (!raw) {
      console.error('[calendar-api] empty model response')
      return NextResponse.json(
        {
          ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal }),
          _fallback: true,
          _fallbackReason: 'empty_model_response',
        },
        { status: 200 }
      )
    }

    let parsed: CalendarResponse
    try {
      parsed = JSON.parse(raw) as CalendarResponse
    } catch (e) {
      console.error('[calendar-api] JSON parse error', e)
      console.error('[calendar-api] raw response:\n', raw)

      return NextResponse.json(
        {
          ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal }),
          _fallback: true,
          _fallbackReason: 'json_parse_error',
        },
        { status: 200 }
      )
    }

    if (!Array.isArray(parsed.items)) {
      console.error('[calendar-api] parsed.items is not an array')
      console.error('[calendar-api] parsed object:\n', parsed)

      return NextResponse.json(
        {
          ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal }),
          _fallback: true,
          _fallbackReason: 'items_not_array',
        },
        { status: 200 }
      )
    }

    const safePlatforms = Array.isArray(platforms) && platforms.length ? platforms : ['instagram']

    const candidateItems: CalendarItem[] = parsed.items
  .map((item, index) => {
    const fallbackPlatform = safePlatforms[0] || 'instagram'
    const platform =
      item.platform && safePlatforms.includes(item.platform)
        ? item.platform
        : fallbackPlatform

    const date = item.date || addDaysIso(startDate, index)
    const contentType = (item.content_type || 'other').toLowerCase().trim()
    const why = Array.isArray(item.why) ? item.why.filter(Boolean).slice(0, 2) : []

    const title = item.title?.trim() || `Idea ${index + 1}`
    const concept = item.concept?.trim() || item.execution?.trim() || ''
    const execution = item.execution?.trim() || item.concept?.trim() || ''
    const rawHook = item.hook?.trim() || ''
    const titleLower = title.trim().toLowerCase()
    const hookLower = rawHook.trim().toLowerCase()

    const hook =
      rawHook && rawHook !== title && hookLower !== titleLower
        ? rawHook
        : concept && concept.trim().toLowerCase() !== titleLower
        ? concept
        : ''

    const cta = item.cta?.trim() || 'What do you think?'
    const pillar = item.pillar?.trim() || 'Other'

    return {
      date,
      platform,
      title,
      short_label: item.short_label?.trim() || title,
      pillar,
      format: contentType,
      idea: concept,
      suggested_caption: item.suggested_caption?.trim() || '',
      angle: execution,
      cta,
      structured: {
        title,
        platform,
        contentType,
        hook,
        concept,
        execution,
        cta,
        why: why.length ? why : ['Built to be clear, usable, and easy to post.'],
      },
    }
  })
  .filter(item => {
    const hasTitle = !!item.title?.trim()

    const hasSomeUsableContent =
      !!item.structured?.concept?.trim() ||
      !!item.structured?.execution?.trim() ||
      !!item.idea?.trim()

    return hasTitle && hasSomeUsableContent
  })

const dedupedItems: CalendarItem[] = []
for (const item of candidateItems) {
  const candidateShape = {
    title: item.title,
    hook: item.structured?.hook || '',
    concept: item.structured?.concept || item.idea,
    execution: item.structured?.execution || item.angle,
  }

  const acceptedShapes = dedupedItems.map(existing => ({
    title: existing.title,
    hook: existing.structured?.hook || '',
    concept: existing.structured?.concept || existing.idea,
    execution: existing.structured?.execution || existing.angle,
  }))

  const acceptedBuckets = dedupedItems.map(existing => ({
  format: existing.format,
  pillar: existing.pillar,
}))

if (
  !isNearDuplicateIdea(candidateShape, acceptedShapes) &&
  !tooManySameFormat(
    { format: item.format, pillar: item.pillar },
    acceptedBuckets,
    totalSlots
  )
) {
  dedupedItems.push(item)
}
}
console.log('[calendar-api] requested slots:', totalSlots)
console.log('[calendar-api] target candidate count:', targetCandidateCount)
console.log('[calendar-api] model returned items:', parsed.items.length)
console.log('[calendar-api] candidate valid items:', candidateItems.length)
console.log('[calendar-api] deduped valid items:', dedupedItems.length)


const trimmedItems = dedupedItems.slice(0, totalSlots)

    const completedItems = [...trimmedItems]

let safety = 0
while (completedItems.length < totalSlots && safety < 30) {
  const fallbackCandidate = buildFallbackItem({
    startDate,
    index: completedItems.length,
    platforms: safePlatforms,
    artistName,
    goal,
    genre,
    focusMode,
    releaseContext,
    ideaDepth,
    contextSource,
    campaignContext,
    releaseStrategyContext,
    usedTitles: completedItems.map(item => item.title),
    usedConcepts: completedItems.map(item => item.structured?.concept || item.idea),
  })

  const candidateShape = {
    title: fallbackCandidate.title,
    hook: fallbackCandidate.structured?.hook || '',
    concept: fallbackCandidate.structured?.concept || fallbackCandidate.idea,
    execution: fallbackCandidate.structured?.execution || fallbackCandidate.angle,
  }

  const acceptedShapes = completedItems.map(existing => ({
    title: existing.title,
    hook: existing.structured?.hook || '',
    concept: existing.structured?.concept || existing.idea,
    execution: existing.structured?.execution || existing.angle,
  }))

  if (!isNearDuplicateIdea(candidateShape, acceptedShapes)) {
    completedItems.push(fallbackCandidate)
  } else {
    const variedFallback = buildFallbackItem({
      startDate,
      index: completedItems.length + safety + 3,
      platforms: safePlatforms,
      artistName,
      goal,
      genre,
      focusMode,
      releaseContext,
      ideaDepth,
      contextSource,
      campaignContext,
      releaseStrategyContext,
      usedTitles: completedItems.map(item => item.title),
      usedConcepts: completedItems.map(item => item.structured?.concept || item.idea),
    })

    const variedShape = {
      title: variedFallback.title,
      hook: variedFallback.structured?.hook || '',
      concept: variedFallback.structured?.concept || variedFallback.idea,
      execution: variedFallback.structured?.execution || variedFallback.angle,
    }

    if (!isNearDuplicateIdea(variedShape, acceptedShapes)) {
      completedItems.push(variedFallback)
    }
  }

  safety += 1
}

    return NextResponse.json({ items: completedItems }, { status: 200 })
  } catch (e: unknown) {
    console.error('[calendar-api] unexpected error', e)

    return NextResponse.json(
      {
        ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal }),
        _fallback: true,
        _fallbackReason: e instanceof Error ? e.message : 'unknown_error',
      },
      { status: 200 }
    )
  }
}

export function GET() {
  return NextResponse.json({ ok: true, route: 'calendar' })
}