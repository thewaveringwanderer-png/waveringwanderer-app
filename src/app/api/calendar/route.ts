// src/app/api/calendar/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const apiKey = process.env.OPENAI_API_KEY
const openai = apiKey ? new OpenAI({ apiKey }) : null

const CONTENT_FRAMEWORKS = [
  "Performance clip",
  "Lyric performance",
  "Hook preview",
  "Chorus preview",
  "Verse spotlight",
  "Punchline / bar breakdown",
  "Studio playback",
  "Car speaker test",
  "Headphone listening moment",
  "Silent acting to the song",
  "Discovery slideshow",
  "Lyric slideshow",
  "Camera roll visualiser",
  "Visual metaphor for the song",
  "Before vs after with the song",
  "Text-on-screen over song audio",
  "Music video style shot",
  "Live performance moment",
  "Acoustic / stripped-back moment",
  "Fan discovery hook",
  "Sound comparison",
  "Mood-board visual",
  "Behind the sound",
  "Song challenge",
  "Duet / stitch bait",
  "Playlist placement angle",
  "Release countdown",
  "Old song rediscovery",
  "One lyric, one visual",
  "First listen reaction",
  "POV with song audio",
"Lyrics on screen",
"Lip sync performance",
"Rap/sing to camera",
"Direct performance to camera",
"Performance with text overlay",
"Lyric acting",
"Facial expression performance",
"Body language performance",
"Walk-and-perform clip",
"Mirror performance",
"Car performance",
"Blue sky / outdoor performance",
"One lyric repeated visually",
]

const TEXT_ON_SCREEN_FRAMEWORKS = [
  // Underdog artist

  "I'm a small artist so if you're seeing this your algorithm is built different",

  "Not trending yet. Let's see if the algorithm made a mistake.",

  "Before this song blows up, I want to know who found it first.",

  // Music-first POV

  "POV: you finally found music that says what you're too proud to admit",

  "POV: this song found you exactly when you needed it",

  "POV: you're tired of fake motivational music",

  // Emotional POV

  "POV: you're exhausted but life keeps asking for more",

  "POV: you're finally winning but the person you wanted to tell isn't here",

  "POV: you're trying to move forward but your mind keeps looking back",

  // Relatable thoughts

  "Some people confuse motion with progress",

  "Being busy and moving forward are not the same thing",

  "Nobody talks about how lonely growth can be",

  // Curiosity

  "The lyric everyone ignores is actually the whole song",

  "This line changes the meaning of everything",

  "The second bar hits harder than the first",

  // Found early

  "You'll either hear this now or six months from now",

  "The algorithm sent you here early",

  "Future fans are hearing this late",

  // Identity

  "Hip-hop for people who overthink everything",

  "Music for people who feel too much",

  "For the people carrying more than they tell anyone",

  "POV: you're building a life nobody can see yet",
"POV: you keep acting calm but your mind never stops",
"POV: you needed music that sounded like pressure",
"POV: you're tired but quitting would hurt more",
"POV: you're trying to become someone your old self needed",

"Small artist. Real song. Right algorithm.",
"Not famous yet, so finding this means something.",
"This song has no label push, just a reason to exist.",
"If this reached you, maybe the algorithm finally did its job.",
"Before this has numbers, tell me if it feels real.",

"Music for people who overthink in silence.",
"Rap for people who feel everything but say little.",
"For anyone carrying pressure like it's normal.",
"For people who are healing and hungry at the same time.",
"For the ones trying to make pain useful.",

"This is what pressure sounds like.",
"This is what growth feels like when nobody claps yet.",
"This is what trying not to quit sounds like.",
"This sounds like being tired but still dangerous.",
"This one is for the part of you that refuses to fold.",

"Nobody talks about the lonely part of levelling up.",
"Sometimes the dream costs more than you expected.",
"Being busy is not the same as becoming better.",
"Some wins feel empty when certain people are missing.",
"Some songs are really survival notes.",

"Go ahead and scroll, this is just music for people who needed a reason.",
"Keep scrolling, this is only for people who think too much.",
"Keep scrolling unless you needed this exact feeling today.",
"This probably will not trend, but it might find the right person.",
"Not viral. Just honest.",

"The hook is cool, but the second line tells the truth.",
"This lyric sounded normal until life got real.",
"The line I almost deleted says the most.",
"This bar is for anyone pretending they are fine.",
"This lyric aged better than I expected."
]

const TEXT_ON_SCREEN_LIBRARY = {
  foundEarly: [
    "If you're seeing this before I blow up, you're officially early.",
    "My music isn't trending yet, so your algorithm might know something I don't.",
    "This isn't a hit yet, but neither was every song you currently love.",
    "The algorithm only showed this to the cool kids.",
    "Most people will scroll. The right people won't.",
    "I haven't made it yet, so this one's still ours.",
  ],
  identity: [
    "Go ahead and keep scrolling. This is just rap for people who overthink everything.",
    "This is for the people carrying more pressure than they talk about.",
    "Music for people building something nobody believes in yet.",
    "Music for people who are tired but not finished.",
    "This is for anyone who refuses to quit.",
  ],
  contrarian: [
    "Them: drill and meaningful lyrics don't go together.",
    "Them: nobody listens to lyrics anymore.",
    "Them: you can't make emotional music and still be hard.",
    "Them: small artists can't break through anymore.",
    "Them: people only care about trends now.",
  ],
  emotionalPov: [
    "POV: You know exactly what you need to do, but you're scared to do it.",
    "POV: Life is finally improving but you're still carrying old pain.",
    "POV: Everybody thinks you're okay because you never complain.",
    "POV: You're exhausted but quitting isn't an option.",
    "POV: You're becoming the person younger you needed.",
  ],
  musicPov: [
    "POV: You wrote the song you needed to hear yourself.",
    "POV: This song sounds exactly like how that memory feels.",
    "POV: You didn't realise how much this lyric meant until now.",
    "POV: You finally recorded the version you heard in your head.",
    "POV: The chorus hits harder every time you hear it.",
  ],
  underdogArtist: [
    "My parents gave me one year to make music work.",
    "Every stream helps me delay getting a real job.",
    "Trying to become an artist while working full-time is a wild experience.",
    "Building a music career one lunch break at a time.",
    "Still not famous, still posting.",
  ],
}

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
  contentTypes?: string[]
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
  structured: {
  title: string
  platform: string
  contentType: string
  hook: string
  onScreenText: string
  concept: string
  execution: string
  caption: string
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
onScreenText?: string
on_screen_text?: string
concept?: string
  execution?: string
  suggested_caption?: string
  cta?: string
  why?: string[]
}

type CalendarResponse = {
  items: AiCalendarItem[]
}

type LyricMoment = {
  lyric: string
  theme: string
  pov: string
  textOnScreen: string
  why: string
}

type LyricAnalysisResponse = {
  moments: LyricMoment[]
}

async function analyseLyricsForContent(args: {
  lyrics: string
  lyricsFocus?: string
  artistName: string
  genre: string
  audience: string
}) {
  const { lyrics, lyricsFocus, artistName, genre, audience } = args

  if (!openai || !lyrics.trim()) {
    return []
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `
You are a music-content strategist.

Analyse lyrics and identify the strongest moments for short-form social content.

Return ONLY valid JSON:

{
  "moments": [
    {
      "lyric": "specific lyric or phrase from the song",
      "theme": "emotional theme",
      "pov": "relatable POV angle",
      "textOnScreen": "strong TikTok/Reels text overlay",
      "why": "why this lyric moment works for content"
    }
  ]
}

Rules:
- Choose the lyric moments yourself.
- Do not say "pick a lyric", "choose a verse", "select a line", or "use a lyric from the song".
- Prioritise lyrics that are emotional, quotable, relatable, visually interesting, or easy to perform.
- Focus on moments that could make someone want to listen to the full song.
- Keep each field concise and useful.
`.trim(),
        },
        {
          role: 'user',
          content: `
Artist: ${artistName}
Genre / lane: ${genre || 'Not specified'}
Audience: ${audience || 'Not specified'}
Lyric focus: ${lyricsFocus || 'general'}

Lyrics:
${lyrics.slice(0, 4000)}

Identify 8-12 strong lyric moments for social media content.
`.trim(),
        },
      ],
      temperature: 0.8,
      presence_penalty: 0.4,
      frequency_penalty: 0.2,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) return []

    const parsed = JSON.parse(raw) as LyricAnalysisResponse

    if (!Array.isArray(parsed.moments)) {
      return []
    }

    return parsed.moments
      .filter(moment =>
        moment?.lyric &&
        moment?.theme &&
        moment?.pov &&
        moment?.textOnScreen
      )
      .slice(0, 12)
  } catch (e) {
    console.error('[calendar-api] lyric analysis failed', e)
    return []
  }
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
    title: 'POV performance with lyrics on screen',
    pillar: 'Performance',
    format: 'performance',
    idea: 'Perform one emotionally strong lyric directly to camera while the text appears on screen.',
    hook: 'POV: this lyric hits harder than you expected.',
    onScreenText: 'This line was written for the overthinkers.',
   execution: 'Film a simple close-up performance with the song playing. Use the highest-scoring lyric moment from the lyric analysis as large readable text on screen.',
    cta: 'Save this if the lyric hit you.',
    why: [
      'Combines direct performance with a lyric people can instantly understand.',
      'Text on screen helps new listeners connect before they know the song.',
    ],
  },
  {
    title: 'Discovery slideshow for new listeners',
    pillar: 'Discovery',
    format: 'slideshow',
    idea: 'Use a two-slide post to introduce the emotion of the song to people discovering you for the first time.',
    hook: "My music isn't trending yet, so your algorithm might know something.",
    onScreenText: "If this found you, you're early.",
    execution: 'Slide 1: serious selfie with a curiosity line. Slide 2: lyric, song title, or emotional payoff.',
    cta: 'Listen if this found you at the right time.',
    why: [
      'Makes the viewer feel like they discovered the artist early.',
      'Slideshows are low-effort but still emotionally clear.',
    ],
  },
  {
    title: 'One lyric, one visual',
    pillar: 'Lyrics',
    format: 'lyrics',
    idea: 'Pair one lyric with a simple visual that makes the emotion easier to feel.',
    hook: 'This one line explains the whole song.',
    onScreenText: 'One lyric. The whole feeling.',
    execution: 'Use one lyric moment from the lyric analysis and pair it with a quiet visual like walking outside, sitting by a window, or looking away from camera.',
    cta: 'Which line should I post next?',
    why: [
      'Gives the audience one clear lyric to remember.',
      'A simple visual keeps attention on the emotion of the song.',
    ],
  },
  {
    title: 'Found early hook preview',
    pillar: 'Discovery',
    format: 'performance',
    idea: 'Preview the hook using a found-early text overlay that makes viewers feel like they discovered the song before everyone else.',
    hook: "If you're seeing this before the song takes off, you're early.",
    onScreenText: 'The algorithm showed you this before everyone else.',
    execution: 'Use the strongest 7–12 seconds of the hook with a simple performance or visual clip.',
    cta: 'Save this before it finds everyone else.',
    why: [
      'Turns small-artist status into a discovery advantage.',
      'The hook preview gives people a quick reason to save or revisit.',
    ],
  },
  {
    title: 'Silent acting to the song',
    pillar: 'Visual',
    format: 'visual',
    idea: 'Act out the feeling of the lyric without lip syncing, using facial expression and body language.',
    hook: 'POV: you felt the lyric before you understood it.',
    onScreenText: 'When the song says what you could not.',
    execution: 'Play the song audio while showing the emotion through expression, stillness, walking, or hand gestures.',
    cta: 'Send this to someone who would feel it.',
    why: [
      'Lets the song carry the emotion without over-explaining it.',
      'Facial expression and body language make the post relatable fast.',
    ],
  },
  {
    title: 'Lip sync lyric moment',
    pillar: 'Performance',
    format: 'performance',
    idea: 'Lip sync the most relatable lyric with strong eye contact and a simple text overlay.',
    hook: 'This lyric is for anyone pretending they are fine.',
    onScreenText: 'For everyone acting like they are okay.',
    execution: 'Film one clean take facing the camera. Keep the background simple and let the lyric carry the post.',
    cta: 'If this line hit, the full song is for you.',
    why: [
      'Strong eye contact makes the lyric feel personal to the viewer.',
      'Lip syncing keeps the music central while still feeling emotional.',
    ],
  },
  {
    title: 'Camera roll music visualiser',
    pillar: 'Visual',
    format: 'visual',
    idea: 'Use camera roll clips that match the mood of the song and turn them into a simple visualiser.',
    hook: 'This is what the song feels like in my head.',
    onScreenText: 'The world this song lives in.',
    execution: 'Use 5–7 clips from your phone: sky, streets, studio, night walk, mirror, train, or room details.',
    cta: 'Would you listen to the full version?',
    why: [
      'Creates a visual world around the song without needing a full music video.',
      'Camera roll footage makes the post feel personal and easy to produce.',
    ],
  },
  {
    title: 'Small artist underdog post',
    pillar: 'Discovery',
    format: 'discovery',
    idea: 'Use the small-artist angle to make viewers feel like their support actually matters.',
    hook: "I'm a small artist, so if this reached you, your algorithm is built different.",
    onScreenText: 'Small artist. Real song. Right algorithm.',
    execution: 'Use the song audio with a simple performance, slideshow, or lyric overlay.',
    cta: 'A save would genuinely help this reach the right people.',
    why: [
      'Flatters the viewer while making the artist feel discoverable.',
      'Turns support into a small meaningful action instead of a hard sell.',
    ],
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
let onScreenText = variant.onScreenText
let why = variant.why

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
      onScreenText,
      caption: fallbackCaption,
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
    contentTypes = ['performance', 'pov', 'lyrics'],
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

const targetCandidateCount = Math.max(totalSlots + 10, Math.ceil(totalSlots * 2.5))
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

 const lyricMoments = lyrics.trim()
  ? await analyseLyricsForContent({
      lyrics,
      lyricsFocus,
      artistName,
      genre,
      audience,
    })
  : []

const lyricMomentsBlock = lyricMoments.length
  ? lyricMoments
      .map((moment, index) => {
        return `
${index + 1}.
Lyric:
"${moment.lyric}"

Theme:
${moment.theme}

POV angle:
${moment.pov}

Suggested text on screen:
${moment.textOnScreen}

Why it works:
${moment.why}
`.trim()
      })
      .join('\n\n')
  : 'No lyric moments identified.'     

  
  const systemPrompt = `
You are an expert music marketing strategist and content calendar architect.
You design practical, shootable content plans that respect an artist's reality
(time, energy, budget) while still pushing growth.

Rules:
${ideaDepthGuidance}
- Mix music-first content pillars: performance, lyrics, sound, visual world, behind-the-scenes, discovery, community.- Avoid near-duplicates. Each slot should feel distinct but on-brand.
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
- When lyrics or release context are provided, extract the deeper human experiences behind the song before creating ideas.
- Turn themes into audience-relatable experiences that point back to the song, lyric, performance, or release.
- Example: a song about success after losing someone is not just "success" or "grief"; it contains experiences like wanting to share a win with someone who is gone, feeling proud and empty at the same time, or reaching a goal that cost you something.
- Build POV ideas around those experiences, not just around the song title.
- POV content does not have to mean lip-syncing.
- POV execution can use facial expression, body language, hand gestures, walking shots, stillness, environment, contrast, or visual metaphor.
- Suggest simple visual settings where useful, such as blue sky, trees, bedroom mirror, train window, street lights, car park, studio corner, or quiet outdoor spaces.
- Avoid defaulting every music idea to lip-sync performance.
- For early-stage artists, especially 0-3k followers, include some low-lift slideshow ideas.
- Slideshow ideas can use selfies, still images, text overlays, lyric screenshots, camera roll moments, or simple contrast posts.
- A useful structure is: Slide 1 = stoic face / tension / relatable problem. Slide 2 = smile, shift, lyric, realisation, or emotional payoff.
- These should feel easy to make without filming a full video.
- When suggesting captions or post framing, think in terms of 2 broad hashtags and 3 specific hashtags.
- Broad hashtags should describe the general lane, such as music, rap, singer songwriter, indie artist.
- Specific hashtags should match the actual emotional/content angle, such as grief journey, healing through music, missing someone, chasing dreams, new artist discovery.
- The music must remain the centre of the content strategy.
- Personal storytelling should support the song, lyric, sound, performance, release, or artist world — not replace it.
- Avoid generating too many generic life-story posts that could work without the music.
- Most ideas should include the track, lyric, performance, sound, visual world, release moment, or listening experience directly.
- A good idea should make someone more likely to listen, save the song, remember the lyric, or understand the artist world.
- Do not make the artist famous for personality alone; use personality as a bridge into the music.
- "hook" and "onScreenText" must never be identical.
- The hook should feel like the first spoken line, caption lead, or opening thought.
- The onScreenText should feel like short overlay text that visually frames the video.
- If hook and onScreenText would be similar, make the onScreenText shorter, more visual, or more curiosity-driven.
- Do not repeat the same "why" explanation across multiple ideas.
- Each "why" should explain the specific psychology of that exact idea.
- If lyrics are provided, analyse them before generating ideas.
- Identify the strongest emotional lines, phrases, themes, or moments in the lyrics.
- Do NOT tell the user to "choose a verse" or "select a lyric" if usable lyrics were already provided.
- Instead, recommend specific lyrical moments or emotional sections to build content around.
- The idea should name or reference the chosen lyric moment clearly.
- Prioritise lyric moments that are relatable, emotionally specific, quotable, or visually easy to turn into content.
- Never say "select a line", "pick a lyric", "choose a verse", or "use a lyric from your song" when lyrics have been provided.
- If lyrics are provided, YOU must choose the strongest lyric moment yourself.
TEXT ON SCREEN PRIORITY RULES

For at least 70% of generated ideas:

The on-screen text MUST be built from one of these categories:

- POV
- Found Early
- Underdog Artist
- Identity Statement
- Emotional Experience
- Relatable Observation
- Contrarian Take

Bad examples:
- "New song out now"
- "Watch until the end"
- "Studio session"
- "Rap performance"
- Descriptions of the video

Good examples:
- "I'm a small artist so if you're seeing this your algorithm is built different"
- "POV: you're finally winning but the person you wanted to tell isn't here"
- "Nobody talks about how lonely growth can be"
- "You'll either hear this now or six months from now"
- "Hip-hop for people who overthink everything"

The text-on-screen should feel more important than the hook.

A viewer should stop scrolling because of the on-screen text even with the audio muted.

Avoid generic summaries of the content.
Avoid simply describing the video.
The text on screen should be capable of stopping a scroll by itself.
At least 70% of ideas should use one of these text-on-screen categories:

- POV
- Found early
- Underdog artist
- Identity statement
- Emotional experience
If lyrics are provided:

- Never tell the artist to pick a lyric.
- Never tell the artist to choose a verse.
- Never tell the artist to select a line.
- You must identify the lyric yourself.
- Quote the lyric directly in the idea.
- Build the hook, on-screen text and execution around that specific lyric.
- Quote or paraphrase the specific lyric moment in the idea, hook, on-screen text, or execution.
- Lyric-based ideas should say exactly what part of the lyrics to use, not ask the user to decide.
Every generated idea must include:

- A scroll-stopping hook.
- A CTA that matches the artist’s audience stage.
- On-screen text appropriate for short-form platforms.
- A clear emotional or curiosity trigger.
- Hooks should feel modern, conversational, and platform-native.
- Avoid generic engagement bait.
- Avoid repetitive CTAs.
Strong hooks often use:
- curiosity
- identity
- relatability
- emotional honesty
- tension
- vulnerability
- unexpected statements
- “found early” psychology
- transformation
- social proof framing
Avoid:
- generic engagement bait
- vague CTAs
- corporate wording
- repetitive “comment below” structures
- hooks that assume a large fanbase
- ideas requiring an already engaged audience

Every generated content idea MUST include the following sections in this exact order:

CONTENT ANGLE:
HOOK:
ON-SCREEN TEXT:
VIDEO EXECUTION:
CAPTION:
CTA:
WHY THIS WORKS:
BEST FOR:

Guidelines:
- Hooks must feel scroll-stopping, modern, emotionally intelligent, and platform-native.
- On-screen text should feel short-form optimised and easy to overlay onto TikTok/Instagram videos.
- Video execution should explain HOW the content should be filmed or presented.
- CTAs must align with the artist’s audience stage.
- Avoid generic engagement bait.
- Avoid repetitive “comment below” structures.
- Avoid assuming the artist already has a large audience.
- WHY THIS WORKS should briefly explain the psychology behind the idea.
- BEST FOR should explain what type of artist or growth stage the idea suits best.

Format every section clearly using labels and spacing.

Example format:

CONTENT ANGLE:
...

HOOK:
...

ON-SCREEN TEXT:
...
Output STRICTLY valid JSON with this shape:

{
  "items": [
    {
      "date": "YYYY-MM-DD",
      "platform": "instagram" | "tiktok" | "youtube" | "facebook" | "x",
            "title": "Short internal card title that labels the idea clearly",
      "short_label": "Very short label",
      "pillar": "Performance" | "POV" | "Lyrics" | "Slideshow" | "Cinematic" | "BTS" | "Discovery" | "Community" | "Humour",
      "content_type": "performance" | "pov" | "lyrics" | "slideshow" | "cinematic" | "bts" | "discovery" | "community" | "humour",
      "hook": "A first spoken line or scroll-stopping opening phrase. It must NOT repeat the title wording.",
"onScreenText": "Short text overlay for the video. Must be different from the hook. Should use curiosity, identity, tension, relatability, POV, or found-early psychology.","concept": "A short summary of the idea itself, distinct from the hook",
      "execution": "What the artist actually films or shows, step by step if needed",
      "suggested_caption": "A short human caption",
      "cta": "A natural CTA",
      "why": ["1 short reason", "optional second short reason"]
    }
  ]
}

Audience stage guidance:

If the artist is early-stage (under 250, 250–1k, or 1k–3k):
- Avoid CTAs that assume an existing fanbase.
- Avoid ideas that rely on audience participation or existing community engagement.
- Focus on discovery-based hooks, song moments, lyrics, sound, visual identity, curiosity, and "found early" framing.- Include stronger on-screen text ideas and cold-audience hooks.
- Prioritise content that earns first attention rather than deep engagement.

If the artist is 3k+:
- Introduce more engagement-focused CTAs.
- Include community participation ideas.
- Encourage repeatable audience interaction formats.

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
- Do not overuse the "story" pillar. Unless the user specifically asks for storytelling, no more than 20% of ideas should use pillar: "Story".
- If the user has selected specific content formats, respect those selected formats over generic storytelling.
- Every idea should answer: "How does this make someone want to hear, save, remember, or understand the music?"
At least 80% of generated ideas must use different content frameworks from one another.

Do not create multiple versions of:
- story behind the song
- lyric explanation
- POV meaning
- generic BTS

If two ideas use the same framework, they must be substantially different.
`.trim()

const selectedTextOnScreenFrameworks = [...TEXT_ON_SCREEN_FRAMEWORKS]
  .sort(() => Math.random() - 0.5)
  .slice(0, 15)

const selectedFrameworks = [...CONTENT_FRAMEWORKS]
  .sort(() => Math.random() - 0.5)
  .slice(0, 12)
  

const selectedTextOnScreenExamples = Object.entries(TEXT_ON_SCREEN_LIBRARY)
  .flatMap(([category, examples]) =>
    examples.map(example => ({ category, example }))
  )
  .sort(() => Math.random() - 0.5)
  .slice(0, 12)  

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

Lyrics context:
${lyrics
  ? `Focus: ${lyricsFocus || 'general'}

Use these lyrics as source material.

Lyrics:
${lyrics.slice(0, 4000)}

Pre-analysed strongest lyric moments:
${lyricMomentsBlock}`
  : 'No lyrics provided.'}

Text-on-screen inspiration:

${selectedTextOnScreenFrameworks.join('\n')}

Plan parameters:
- Start date: ${startDate}
- Number of weeks: ${weeks}
- Approx posts per week: ${postsPerWeek}
- Allowed platforms: ${platforms.join(', ')}
- Selected content types: ${contentTypes.join(', ')}
- Avoid list (do not repeat or closely paraphrase):
${(avoidTitles || []).slice(0, 40).map(t => `- ${t}`).join('\n') || 'None'}

Creative formats available for this generation:
${selectedFrameworks.map(x => `- ${x}`).join('\n')}

Text-on-screen inspiration library:
${selectedTextOnScreenExamples
  .map(item => `- ${item.category}: ${item.example}`)
  .join('\n')}

Use these as inspiration for style, psychology, and structure.
Do not copy them word-for-word unless the wording perfectly fits.
Create fresh text-on-screen lines that feel native to TikTok/Reels.
Text-on-screen should usually create curiosity, identity, tension, relatability, or "found early" energy.

Rules for using creative formats:
- Use these formats as the main creative menu for this batch.
- Do not default to generic storytelling unless the selected format clearly needs it.
- Most ideas should be built around the song audio, lyrics, performance, hook, chorus, verse, release, or listening experience.
- If a format is not story-based, do not turn it into a story-based idea.
- At least 80% of ideas should use a different creative format.
Selected content type rules:
- The user selected these content types: ${contentTypes.join(', ')}
- Prioritise these selected content types strongly.
- Do not generate BTS, visual, community, humour, or discovery ideas unless they are selected.
- If the user selected performance, POV, and lyrics, every idea should mainly be performance, POV, lyric-led, or a direct combination of those.
- The "pillar" and "content_type" should match one of the selected content types whenever possible.
- Use ONLY these exact content_type values: ${contentTypes.join(', ')}
- Do not invent new content_type values.
- Do not use "idea", "other", "visual", "education", or "story" unless selected.
- If an idea is lyric-led, use content_type: "lyrics".
- If an idea is POV-led, use content_type: "pov".

Before creating the calendar, internally identify:
- the main theme of the song or campaign
- the emotional experiences inside that theme
- the audience situations those experiences connect to
- the best content formats for a small independent artist

Then turn those into practical content ideas.

- Keep the calendar music-first.
- At least 70% of ideas should directly feature the song, lyric, performance, sound, visual world, release, or listening experience.
- Storytelling angles are allowed, but they must connect clearly back to the music.
- Avoid standalone motivational, lifestyle, or personality posts unless they clearly lead back to the song or artist world.
Lyric analysis instruction:
If pre-analysed lyric moments are available, use them as the main source for lyric-based ideas.
Do not ask the user to choose a verse, pick a line, select a lyric, or choose a bar.
For each lyric-based idea, clearly name or quote the lyric moment being used.
The result should feel like WW has analysed the song and found strong content angles for the artist.

Text-on-screen rules:

- Treat text on screen as the primary scroll-stopper.
- Text on screen should usually be stronger than the spoken hook.
- Prefer:
  - POV
  - Found early
  - Underdog artist
  - Identity statements
  - Emotional experiences
  - Relatable observations
- Avoid simply describing the video.
- Avoid generic summaries.
- Good text on screen should make someone stop scrolling even without audio.
- At least 70% of ideas should use one of the text-on-screen inspiration examples as a starting point and improve upon it.
When generating onScreenText:

- Do NOT describe the video.
- Do NOT summarise the content.
- Do NOT simply repeat the lyric.

Instead create:

- a belief
- a POV
- a thought
- an observation
- an identity statement
- an underdog angle
- a found-early angle

The best onScreenText should feel like something a viewer would repost, save, or send to a friend.

Bad:
- "Studio session"
- "New song"
- "Performance clip"
- "Watch until the end"

Good:
- "Nobody talks about how lonely growth can be"
- "You'll either hear this now or six months from now"
- "Music for people who feel too much"
- "POV: you're exhausted but life keeps asking for more"

The onScreenText should usually be stronger than the hook.

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
const safeContentTypes =
  Array.isArray(contentTypes) && contentTypes.length
    ? contentTypes
    : ['performance', 'pov', 'lyrics']
   const candidateItems = (parsed.items as CalendarItem[]).map((item, index) => {
    const rawItem = item as any
    const fallbackPlatform = safePlatforms[0] || 'instagram'
    const platform =
      rawItem.platform && safePlatforms.includes(rawItem.platform)
        ? rawItem.platform
        : fallbackPlatform

    const date = rawItem.date || addDaysIso(startDate, index)
    const rawContentType =
  typeof rawItem.content_type === 'string'
    ? rawItem.content_type.toLowerCase().trim()
    : typeof rawItem.format === 'string'
    ? rawItem.format.toLowerCase().trim()
    : ''

const normalisedContentType =
  rawContentType === 'lyric' ? 'lyrics' :
  rawContentType === 'lyrical' ? 'lyrics' :
  rawContentType === 'lyric-led' ? 'lyrics' :
  rawContentType === 'lyric_led' ? 'lyrics' :
  rawContentType === 'p.o.v' ? 'pov' :
  rawContentType === 'p.o.v.' ? 'pov' :
  rawContentType === 'point-of-view' ? 'pov' :
  rawContentType === 'point_of_view' ? 'pov' :
  rawContentType

const contentType = safeContentTypes.includes(normalisedContentType)
  ? normalisedContentType
  : safeContentTypes[index % safeContentTypes.length]
    const why = Array.isArray(rawItem.why) ? rawItem.why.filter(Boolean).slice(0, 2) : []

    const title = rawItem.title?.trim() || `Idea ${index + 1}`
    const concept = rawItem.concept?.trim() || rawItem.execution?.trim() || ''
    const execution = rawItem.execution?.trim() || rawItem.concept?.trim() || ''
    const onScreenText =
  (rawItem as any).on_screen_text?.trim() ||
  (rawItem as any).onScreenText?.trim() ||
  ''
    const rawHook = rawItem.hook?.trim() || ''
    const titleLower = title.trim().toLowerCase()
    const hookLower = rawHook.trim().toLowerCase()
const safeOnScreenText =
  onScreenText && onScreenText.toLowerCase() !== rawHook.toLowerCase()
    ? onScreenText
    : title
    const hook =
      rawHook && rawHook !== title && hookLower !== titleLower
        ? rawHook
        : concept && concept.trim().toLowerCase() !== titleLower
        ? concept
        : ''

    const cta = rawItem.cta?.trim() || 'What do you think?'
    const pillar = rawItem.pillar?.trim() || 'Other'

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
        onScreenText: safeOnScreenText,
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





const trimmedItems = candidateItems.slice(0, totalSlots)


let completedItems = [...trimmedItems]

if (completedItems.length < totalSlots) {
  const missingCount = totalSlots - completedItems.length

  const existingIdeasForAvoidList = completedItems
    .map((item, index) => {
      return `${index + 1}. ${item.title} — ${item.structured?.hook || item.idea}`
    })
    .join('\n')

  try {
    const replacementCompletion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `
The previous generation only returned ${completedItems.length} usable ideas, but the user requested ${totalSlots}.

Generate exactly ${missingCount} additional ideas.

Avoid repeating or closely copying these existing ideas:
${existingIdeasForAvoidList || 'None'}

Creative formats available:
${selectedFrameworks.map(x => `- ${x}`).join('\n')}

Text-on-screen inspiration:
${selectedTextOnScreenExamples
  .map(item => `- ${item.category}: ${item.example}`)
  .join('\n')}
Pre-analysed lyric moments:
${lyricMomentsBlock}
When generating onScreenText:

- Do NOT describe the video.
- Do NOT summarise the content.
- Do NOT simply repeat the lyric.

Instead create:

- a belief
- a POV
- a thought
- an observation
- an identity statement
- an underdog angle
- a found-early angle

The best onScreenText should feel like something a viewer would repost.

Prioritise:

- POV
- Found Early
- Underdog Artist
- Identity Statement
- Emotional Experience

Avoid generic overlays such as:

- "New song"
- "Studio session"
- "Performance clip"
- "Watch until the end"
Rules:
- Return exactly ${missingCount} items.
- The user selected these content types: ${contentTypes.join(', ')}
- Stay inside the selected content types.
- Do not generate BTS, visual, community, humour, or discovery ideas unless selected.
- If selected types are performance, POV, and lyrics, generate only performance, POV, lyric-led, or hybrid ideas.
- If lyric moments are available, use specific lyric moments from the analysis.
- Do not say "pick a lyric", "choose a verse", "select a line", or "use a lyric from your song".
- Quote or clearly reference the lyric moment used.
- Keep the music central.
- Do not use generic fallback ideas.
- Do not repeat the same hook, on-screen text, concept, execution, or why.
- Hook and onScreenText must be different.
- Use music-first formats like performance, lyrics, POV, lip sync, slideshow, visual metaphor, discovery, hook preview, or song audio moments.
- Return only valid JSON with the same shape: { "items": [...] }.
`.trim(),
        },
      ],
      temperature: 1.05,
      presence_penalty: 0.8,
      frequency_penalty: 0.5,
    })

    const replacementRaw = replacementCompletion.choices[0]?.message?.content?.trim()

    if (replacementRaw) {
      const replacementParsed = JSON.parse(replacementRaw) as CalendarResponse

      if (Array.isArray(replacementParsed.items)) {
        const replacementItems = (replacementParsed.items as CalendarItem[])
          .map((item, index) => {
            const rawItem = item as any
            const fallbackPlatform = safePlatforms[0] || 'instagram'
            const platform =
              rawItem.platform && safePlatforms.includes(rawItem.platform)
                ? rawItem.platform
                : fallbackPlatform

            const date = rawItem.date || addDaysIso(startDate, completedItems.length + index)
            const rawContentType =
  typeof rawItem.content_type === 'string'
    ? rawItem.content_type.toLowerCase().trim()
    : typeof rawItem.format === 'string'
    ? rawItem.format.toLowerCase().trim()
    : ''

const normalisedContentType =
  rawContentType === 'lyric' ? 'lyrics' :
  rawContentType === 'lyrical' ? 'lyrics' :
  rawContentType === 'lyric-led' ? 'lyrics' :
  rawContentType === 'lyric_led' ? 'lyrics' :
  rawContentType === 'p.o.v' ? 'pov' :
  rawContentType === 'p.o.v.' ? 'pov' :
  rawContentType === 'point-of-view' ? 'pov' :
  rawContentType === 'point_of_view' ? 'pov' :
  rawContentType

const contentType = safeContentTypes.includes(normalisedContentType)
  ? normalisedContentType
  : safeContentTypes[index % safeContentTypes.length]
            const why = Array.isArray(rawItem.why)
              ? rawItem.why.filter(Boolean).slice(0, 2)
              : []

            const title = rawItem.title?.trim() || `Idea ${completedItems.length + index + 1}`
            const concept = rawItem.concept?.trim() || rawItem.execution?.trim() || ''
            const execution = rawItem.execution?.trim() || rawItem.concept?.trim() || ''

            const rawHook = rawItem.hook?.trim() || ''
            const onScreenText =
              (rawItem as any).on_screen_text?.trim() ||
              (rawItem as any).onScreenText?.trim() ||
              ''

            const safeOnScreenText =
              onScreenText && onScreenText.toLowerCase() !== rawHook.toLowerCase()
                ? onScreenText
                : title

            const titleLower = title.trim().toLowerCase()
            const hookLower = rawHook.trim().toLowerCase()

            const hook =
              rawHook && rawHook !== title && hookLower !== titleLower
                ? rawHook
                : concept && concept.trim().toLowerCase() !== titleLower
                ? concept
                : ''

            const cta = rawItem.cta?.trim() || 'Listen if this found you at the right time.'
            const pillar = rawItem.pillar?.trim() || 'Other'

            return {
              date,
              platform,
              title,
              short_label: rawItem.short_label?.trim() || title,
              pillar,
              format: contentType,
              idea: concept,
              suggested_caption: rawItem.suggested_caption?.trim() || '',
              angle: execution,
              cta,
              structured: {
                title,
                platform,
                contentType,
                onScreenText: safeOnScreenText,
                hook,
                concept,
                execution,
                cta,
                why: why.length
                  ? why
                  : ['This gives new listeners a clear reason to connect with the song.'],
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

        completedItems = [...completedItems, ...replacementItems].slice(0, totalSlots)
      }
    }
  } catch (e) {
    console.error('[calendar-api] replacement generation failed', e)
  }
}

while (completedItems.length < totalSlots) {
  completedItems.push(
    buildFallbackItem({
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
      usedTitles: completedItems.map(i => i.title),
      usedConcepts: completedItems.map(i => i.idea),
    })
  )
}

console.log('candidateItems', candidateItems.length)
console.log('completedItems', completedItems.length)
console.log('totalSlots', totalSlots)

    return NextResponse.json(
  { items: completedItems.slice(0, totalSlots) },
  { status: 200 }
)
  } catch (e: unknown) {
  console.error('[calendar-api] unexpected error', e)


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
      _fallbackReason:
        e instanceof Error ? e.message : 'unknown_error',
    },
    { status: 200 }
  )
}
}
export function GET() {
  return NextResponse.json({ ok: true, route: 'calendar' })
}