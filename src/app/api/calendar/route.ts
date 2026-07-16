// src/app/api/calendar/route.ts
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { formatAttentionGenomeForPrompt } from '@/lib/attentionGenome'
import { CONTENT_FORMAT_GENOME } from '@/lib/ideaFactory/contentFormatGenome'
import { formatIdeaFactoryReasoningPipelineForPrompt } from '@/lib/ideaFactory/reasoningPipeline'
import { formatInterferenceEngineForPrompt } from '@/lib/ideaFactory/interferenceEngine'
import { formatConceptEngineForPrompt } from '@/lib/ideaFactory/conceptEngine'
import { formatExecutionEngineForPrompt } from '@/lib/ideaFactory/executionEngine'
import { formatPresentationEngineForPrompt } from '@/lib/ideaFactory/presentationEngine'
import { formatDecisionEngineForPrompt } from "@/lib/ideaFactory/decisionEngine"
import { formatBatchIntelligenceEngineForPrompt } from '@/lib/ideaFactory/batchIntelligenceEngine'
import {
  formatCreatorGenomeForPrompt,
  formatCreatorInferenceEngineForPrompt,
} from '@/lib/ideaFactory/creatorGenome'
import {
  TEXT_ON_SCREEN_HOOKS,
} from '@/lib/ideaFactoryHookLibrary'
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

const LYRIC_ONLY_FRAMEWORKS = new Set([
  'Lyric performance',
  'Chorus preview',
  'Verse spotlight',
  'Punchline / bar breakdown',
  'Lyric slideshow',
  'One lyric, one visual',
  'Lyrics on screen',
  'Lyric acting',
  'Lip sync performance',
  'One lyric repeated visually',
])

const TEXT_ON_SCREEN_LIBRARY = {

  fanCulture: [
  "The crowd knew this part before the drop arrived.",
  "This section gets louder every week.",
  "The reactions keep getting bigger.",
  "The room knew exactly what was coming.",
  "The fans turned this into their moment.",
  "I wasn't expecting this response.",
  "The comments understood this immediately.",
  "This became bigger than I planned.",
  "The crowd always waits for this bit.",
  "Some songs create their own community."
],
liveEnergy: [
  "The silence before the drop is always my favourite part.",
  "The room changed when this started.",
  "Everyone felt it at the same time.",
  "This sounds different when the crowd joins in.",
  "The build-up hits harder live.",
  "This is why live music still wins.",
  "The anticipation is half the experience.",
  "The energy changed instantly.",
  "You can feel the room holding its breath.",
  "Some moments only make sense live."
],
celebration: [
  "Some songs are made for forgetting tomorrow.",
  "This is what freedom sounds like.",
  "The best nights usually start like this.",
  "This belongs on loud speakers.",
  "The goal was simple: make people move.",
  "Nobody stands still for this one.",
  "The energy speaks for itself.",
  "This was never meant to be listened to quietly.",
  "The night starts here.",
  "Sometimes music should just feel good."
],
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

viewerFocusedText: [
  "If this reaches the right person, it's worth posting.",
  "Maybe this song finds who it's supposed to find.",
  "For anyone feeling this right now.",
  "One listener > a thousand empty views.",
  "Some songs take time to find their people.",
  "Not everything needs to go viral.",
  "Music before marketing.",
  "This one's for the overthinkers.",
  "If this resonates, stay a while.",
  "Let's see if the algorithm understands this one."
],

debateStarters: [
  "What's the most overrated music advice?",
  "What's a song everyone loves that you don't?",
  "Be honest, is this the best part of the song?",
  "What makes you replay a song?",
  "Lyrics or production?",
],

fanPsychology: [
  "The replay button says more than the comments.",
  "Music fans decide in seconds but stay for years.",
  "Most favourite songs start as growers.",
  "The songs you replay become part of your identity.",
],

unexpectedObservations: [
  "The caption took longer than the song.",
  "Nobody else knows it's release day.",
  "The best line nearly got deleted.",
  "Most listeners never hear version one.",
],

artistReality: [
  "Making music and promoting music are two different jobs.",
  "The song was easier than the caption.",
  "Most artists spend more time worrying than creating.",
  "Release day lasts 24 hours. The overthinking lasts weeks.",
]

}

type CalendarRequest = {
  artistName?: string
  genre?: string
  artistType?: string
  performanceStyle?: string
  creativeReality?: string
  audience?: string
  identityKitContext?: any | null
selectedIdentityKitId?: string | null
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

  contextSource?: 'manual' | 'identity' | 'campaign' | 'release_strategy'
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
  attentionStrategy: string
attentionReason: string
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
  attentionStrategy?: string
attentionReason?: string
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


function normalizeContentType(type: unknown): string {
  if (typeof type !== 'string') {
    return ''
  }

  const value = type.toLowerCase().trim()

  if (value === 'behind the scenes') return 'bts'
  if (value === 'behind-the-scenes') return 'bts'
  if (value === 'bts') return 'bts'

  if (value === 'text on screen') return 'text-on-screen'
  if (value === 'text-on-screen') return 'text-on-screen'
  if (value === 'text_on_screen') return 'text-on-screen'

  if (value === 'direct performance') return 'direct-performance'
  if (value === 'direct-performance') return 'direct-performance'
  if (value === 'performance') return 'direct-performance'

  if (value === 'camera roll') return 'slideshow'
  if (value === 'camera roll / slideshow') return 'slideshow'
  if (value === 'camera-roll-slideshow') return 'slideshow'
  if (value === 'slideshow') return 'slideshow'

  if (value === 'talking to camera') return 'talking-to-camera'
  if (value === 'talking-to-camera') return 'talking-to-camera'

  if (value === 'visual / cinematic') return 'visual-cinematic'
  if (value === 'visual cinematic') return 'visual-cinematic'
  if (value === 'visual-cinematic') return 'visual-cinematic'
  if (value === 'cinematic') return 'visual-cinematic'

  if (value === 'live footage') return 'live-footage'
  if (value === 'live-footage') return 'live-footage'

  if (value === 'storytelling') return 'storytelling'

  return value
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
  contextSource?: 'manual' | 'identity' | 'campaign' | 'release_strategy'
  campaignContext?: CalendarRequest['campaignContext']
  releaseStrategyContext?: CalendarRequest['releaseStrategyContext']
  contentTypes?: string[]
  hasLyrics: boolean
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
    contentTypes = [],
    hasLyrics,
    
  } = args

  

  const items: CalendarItem[] = []

  for (let i = 0; i < totalSlots; i++) {
    items.push(
      buildFallbackItem({
        startDate,
        contentTypes,
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
        hasLyrics
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
  contextSource?: 'manual' | 'identity' | 'campaign' | 'release_strategy'
  campaignContext?: CalendarRequest['campaignContext']
  releaseStrategyContext?: CalendarRequest['releaseStrategyContext']
  contentTypes?: string[]
  
  usedTitles?: string[]
usedConcepts?: string[]
hasLyrics: boolean
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
contentTypes = [],
hasLyrics,
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
 
 type FallbackVariant = {
  title: string
  pillar: string
  format: string
  idea: string
  hook: string
  onScreenText: string
  execution: string
  cta: string
  why: string[]
  requiresLyrics?: boolean
  supportedTypes: string[]
} 

 const fallbackVariants: FallbackVariant[] = [
  {
    title: 'POV performance with lyrics on screen',
    requiresLyrics: true,
supportedTypes: ['direct-performance', 'text-on-screen'],
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
    supportedTypes: ['slideshow'],
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
    requiresLyrics: true,
supportedTypes: ['text-on-screen', 'visual-cinematic'],
    pillar: 'Text-on-screen',
    format: 'Text-on-screen',
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
    supportedTypes: ['direct-performance', 'text-on-screen'],
    requiresLyrics: true,
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
    supportedTypes: ['visual-cinematic'],
    pillar: 'Visual',
    format: 'visual-cinematic',
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
    requiresLyrics: true,
supportedTypes: ['direct-performance'],
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
    supportedTypes: ['slideshow', 'visual-cinematic'],
    pillar: 'visual-cinematic',
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
      supportedTypes: ['text-on-screen'],

    pillar: 'text-on-screen',
    format: 'text-on-screen',
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


const eligibleFallbackVariants = fallbackVariants.filter(variant => {
  if (variant.requiresLyrics && !hasLyrics) {
    return false
  }

  return variant.supportedTypes.some(type =>
    contentTypes.includes(type)
  )
})

const fallbackPool = eligibleFallbackVariants.length
  ? eligibleFallbackVariants
  : fallbackVariants.filter(
      variant => !variant.requiresLyrics || hasLyrics
    )

const variantIndex =
  (index + usedTitles.length + usedConcepts.length) %
  fallbackPool.length

const variant = fallbackPool[variantIndex]
  

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

  const selectedFallbackBadges = contentTypes
  .map(normalizeContentType)
  .filter(Boolean)

const fallbackBadge =
  selectedFallbackBadges[index % selectedFallbackBadges.length] || 'text-on-screen'



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
      attentionStrategy: '',
attentionReason: '',
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

function extractIdentityKitContextBlock(identityKitContext: any) {
  if (!identityKitContext) return 'No Identity Kit context provided.'

  const inputs = identityKitContext.inputs || {}
  const result = identityKitContext.result || identityKitContext.kit || identityKitContext || {}

  const lines: string[] = []

  if (identityKitContext.artist_name || identityKitContext.artistName || inputs.artistName) {
    lines.push(`Artist name: ${identityKitContext.artist_name || identityKitContext.artistName || inputs.artistName}`)
  }

  if (inputs.artistPhilosophy) lines.push(`Artist philosophy: ${inputs.artistPhilosophy}`)
  if (inputs.recurringThemes) lines.push(`Recurring themes: ${inputs.recurringThemes}`)
  if (inputs.listenerEffect) lines.push(`Desired listener effect: ${inputs.listenerEffect}`)
  if (inputs.uniqueQualities) lines.push(`Unique qualities: ${inputs.uniqueQualities}`)
  if (inputs.influences) lines.push(`Influences: ${inputs.influences}`)

  lines.push(`Strategic foundations: ${JSON.stringify(result.strategicFoundations || {}).slice(0, 1200)}`)
  lines.push(`Artist snapshot: ${JSON.stringify(result.artistSnapshot || {}).slice(0, 1200)}`)
  lines.push(`Core identity: ${JSON.stringify(result.coreIdentity || {}).slice(0, 1200)}`)
  lines.push(`Brand strategy: ${JSON.stringify(result.brandStrategy || {}).slice(0, 1200)}`)
  lines.push(`Audience profile: ${JSON.stringify(result.audienceProfile || {}).slice(0, 1200)}`)
  lines.push(`Tone of voice: ${JSON.stringify(result.toneOfVoice || {}).slice(0, 1200)}`)
  lines.push(`Visual system: ${JSON.stringify(result.visualSystem || {}).slice(0, 1200)}`)
  lines.push(`Content system: ${JSON.stringify(result.contentSystem || {}).slice(0, 1200)}`)
  lines.push(`Brand guardrails: ${JSON.stringify(result.brandGuardrails || []).slice(0, 1200)}`)

  return lines.filter(Boolean).join('\n')
}

function shuffleArray<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

function getTextOnScreenBuckets(args: {
  totalSlots: number
  genre: string
  artistType: string
  audience: string
}) {
  const { totalSlots, genre, artistType, audience } = args

  const bucketNames = Object.keys(TEXT_ON_SCREEN_HOOKS)
  let weightedBuckets = [...bucketNames]

  const genreText = genre.toLowerCase()
  const artistTypeText = artistType.toLowerCase()
  const audienceText = audience.toLowerCase()

  const isDanceOrDj =
    artistTypeText.includes('dj') ||
    genreText.includes('house') ||
    genreText.includes('edm') ||
    genreText.includes('dance') ||
    audienceText.includes('party') ||
    audienceText.includes('club') ||
    audienceText.includes('festival') ||
    audienceText.includes('nightlife')

  if (isDanceOrDj) {
    weightedBuckets = weightedBuckets.filter(
      bucket =>
        ![
          'foundEarly',
          'underdogArtist',
          'emotionalPov',
          'mentalNoise',
          'successCost',
        ].includes(bucket)
    )

    weightedBuckets.push(
      'fanCulture',
      'fanCulture',
      'liveEnergy',
      'liveEnergy',
      'celebration',
      'celebration'
    )
  }

  const buckets: string[] = []

  while (buckets.length < totalSlots) {
    buckets.push(...shuffleArray(weightedBuckets))
  }

  return buckets.slice(0, totalSlots)
}

function allTextOnScreenHooks() {
  return Object.values(TEXT_ON_SCREEN_HOOKS).flat()
}

function pickReplacementOnScreenText(args: {
  hook: string
  title: string
  concept: string
  index: number
}) {
  const { hook, title, concept, index } = args

  const pool = allTextOnScreenHooks()

  const blocked = [
    normalizeForComparison(hook),
    normalizeForComparison(title),
    normalizeForComparison(concept),
  ].filter(Boolean)

  const candidates = pool.filter(line => {
    const normalised = normalizeForComparison(line)

    if (!normalised) return false
    if (blocked.includes(normalised)) return false

    const hookSimilarity = jaccardSimilarity(
      significantWords(line),
      significantWords(hook)
    )

    return hookSimilarity < 0.45
  })

  return candidates[index % candidates.length] || pool[index % pool.length] || title
}

function violatesArtistType(item: AiCalendarItem, artistType: string, genre: string) {
  const text = [
    item.title,
    item.hook,
    item.concept,
    item.execution,
    item.onScreenText,
    item.on_screen_text,
  ]
    .map(safeString)
    .join(' ')
    .toLowerCase()

  const artist = artistType.toLowerCase()
  const lane = genre.toLowerCase()

  const isDjOrDance =
    artist.includes('dj') ||
    artist.includes('producer') ||
    lane.includes('house') ||
    lane.includes('edm') ||
    lane.includes('dance') ||
    lane.includes('electronic')


  if (!isDjOrDance) return false

  const artistTypeLower = artistType.toLowerCase()

  const banned = [
    'rap',
    'rapping',
    'verse',
    'bar',
    'bars',
    'sing',
    'singing',
    'vocal take',
    'chorus',
    'acoustic',
    'lyric sheet',
    'handwritten lyric',
    'bedroom mirror',
    'verse',
'rap',
'rapper',
'sing',
'singing',
'vocal',
'chorus',
'lyrics',
'lyric',
'bars',
'acoustic',
'bedroom',
'street walk',
'walking alone',
'perform the verse',
'perform a verse',
  ]

  const djRequiredTerms = [
  'dj',
  'set',
  'crowd',
  'drop',
  'transition',
  'booth',
  'soundcheck',
  'remix',
  'beat',
  'festival',
  'club',
  'dance',
  'bass',
  'build-up',
  'buildup',
]

if (artistTypeLower.includes('dj')) {
  const hasDjContext = djRequiredTerms.some(term => text.includes(term))
  if (!hasDjContext) return true
}

  return banned.some(word => text.includes(word))

  
}

function isWeakOnScreenText(args: {
  onScreenText: string
  hook: string
  title: string
}) {
  const { onScreenText, hook, title } = args

  const normalisedText = normalizeForComparison(onScreenText)
  const normalisedHook = normalizeForComparison(hook)
  const normalisedTitle = normalizeForComparison(title)

  if (!normalisedText) return true
  if (normalisedText === normalisedHook) return true
  if (normalisedText === normalisedTitle) return true

  const weakPhrases = [
    'new song',
    'studio session',
    'performance clip',
    'watch until the end',
    'listen now',
    'out now',
    'rap performance',
    'lyrics on screen',
    'music video',
    'key lyric',
'raw verse',
'city backdrop',
'street session',
'verse flow',
'chorus hook',
'lyric highlight',
'focus on',
'perform a',
'rap a',
'showcase',
'behind the scenes',
  ]

  if (weakPhrases.some(phrase => normalisedText.includes(phrase))) {
    return true
  }

  const similarity = jaccardSimilarity(
    significantWords(onScreenText),
    significantWords(hook)
  )

  return similarity >= 0.55
}

function improveOnScreenText(args: {
  onScreenText: string
  hook: string
  title: string
  concept: string
  index: number
}) {
  const { onScreenText, hook, title, concept, index } = args

  if (
    isWeakOnScreenText({
      onScreenText,
      hook,
      title,
    })
  ) {
    return pickReplacementOnScreenText({
      hook,
      title,
      concept,
      index,
    })
  }

  return onScreenText
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
    creativeReality = '',
    audience = '',
    goal = '',

    identityKitContext = null,
  selectedIdentityKitId = null,

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
   
contentTypes = [],    avoidTitles = [],
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
  console.log('[calendar-api] received contentTypes:', contentTypes)

  const VALID_CONTENT_TYPES = [
  'direct-performance',
  'bts',
  'live-footage',
  'storytelling',
  'text-on-screen',
  'slideshow',
  'talking-to-camera',
  'visual-cinematic',
]

const allowedBadgeTypes = contentTypes
  .map(normalizeContentType)
  .filter(type => VALID_CONTENT_TYPES.includes(type))

if (!allowedBadgeTypes.length) {
  return NextResponse.json(
    { error: 'No valid content types selected' },
    { status: 400 }
  )
}



const allowedBadgeSet = new Set(allowedBadgeTypes)

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
  contentTypes: allowedBadgeTypes,
  hasLyrics: lyrics.trim().length > 0,
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
  if (creativeReality) contextLines.push(`Creative reality: ${creativeReality}`)
  if (audience) contextLines.push(`Audience: ${audience}`)
  if (goal) contextLines.push(`Primary goal: ${goal}`)

  const contextBlock = contextLines.length
    ? contextLines.join('\n')
    : 'No extra context was given. Infer a reasonable plan for an independent artist.'
  const campaignContextBlock = extractCampaignContextBlock(campaignContext)
  const releaseStrategyContextBlock = extractReleaseStrategyContextBlock(releaseStrategyContext)
const identityKitContextBlock = extractIdentityKitContextBlock(identityKitContext)

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

const hasLyrics = lyrics.trim().length > 0  

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
  
  const contentFormatKnowledge = CONTENT_FORMAT_GENOME.map((format) => {
  return `
FORMAT ID: ${format.id}
FORMAT NAME: ${format.name}

BEST FOR:
${format.bestFor.map((item) => `- ${item}`).join('\n')}

WHY THIS FORMAT WORKS:
${format.psychology}

STRUCTURE:
${format.structure.map((item) => `- ${item}`).join('\n')}

AVOID:
${format.avoid.map((item) => `- ${item}`).join('\n')}

EXAMPLE DIRECTION:
${format.exampleDirection}
`.trim()
}).join('\n\n')

const creatorGenomeKnowledge = formatCreatorGenomeForPrompt()
const creatorInferenceEngine = formatCreatorInferenceEngineForPrompt()
const reasoningPipeline = formatIdeaFactoryReasoningPipelineForPrompt()
const interferenceEngine = formatInterferenceEngineForPrompt()
const conceptEngine = formatConceptEngineForPrompt()
const decisionEngine = formatDecisionEngineForPrompt()
const batchIntelligenceEngine = formatBatchIntelligenceEngineForPrompt()
const executionEngine = formatExecutionEngineForPrompt()
const presentationEngine = formatPresentationEngineForPrompt()

  const attentionGenome = formatAttentionGenomeForPrompt()
  const systemPrompt = `
You are an expert music marketing strategist and content calendar architect.
You design practical, shootable content plans that respect an artist's reality
(time, energy, budget) while still pushing growth.

${reasoningPipeline}

CREATOR GENOME KNOWLEDGE

${creatorGenomeKnowledge}

${creatorInferenceEngine}

INTERFERENCE ENGINE

${interferenceEngine}

ATTENTION ENGINE

The chosen Attention Gene must shape:

- the concept
- the hook
- the on-screen text
- the execution
- the CTA

The following Attention Genome defines the psychological building blocks available when generating ideas.

Do not copy it.

Reason from it.

${attentionGenome}

Do not simply reuse patterns.

Understand why they work, then create something original for this specific artist.

CONTENT FORMAT ENGINE

The following Content Format Genome explains how different content formats work, who they suit, and how they should be structured.

Do not copy its example directions word for word.

Use it as strategic knowledge for choosing the right vessel for each idea.

${contentFormatKnowledge}

Use the inferred Creative Fingerprint before choosing a Content Format Gene.

The selected format must:
- fit the artist's Primary Creator Gene
- benefit from the Secondary Creator Gene where useful
- respect filming habits
- respect performance comfort
- fit likely editing style
- use available recurring assets
- avoid behaviours listed in the fingerprint

For every idea:

1. Choose the most suitable Content Format Gene.
2. Base the choice on the artist's selected content styles, performance style, Creative Reality, confidence, resources, audience, goal, and identity.
3. Respect the content styles explicitly selected by the artist.
4. Do not choose formats randomly merely to create variety.
5. Treat Creative Reality as useful design information, not as a weakness.
6. Avoid forcing talking-to-camera, outdoor filming, live footage, performance, or complicated production when the artist's circumstances make them unsuitable.
7. Use the selected format's psychology and structure to shape the actual concept.
8. The output contentType must still use one of the artist's allowed selected content types.
9. The format named in the output must accurately describe the execution.
10. Do not repeat the same format too heavily unless the artist's preferences strongly justify it.

${conceptEngine}

${decisionEngine}

${batchIntelligenceEngine}

${executionEngine}

${presentationEngine}


IDENTITY KIT AUTHORITY

When Identity Kit context exists, treat it as the primary source of artist-specific
creative truth.

Internally identify:

- defining identity anchors;
- recurring themes;
- core audience desire and frustration;
- listener transformation;
- distinctive belief or philosophy;
- visual world;
- content pillars;
- brand guardrails.

Each idea must use at least one verified identity source such as:

- lived experience;
- belief;
- contradiction;
- recurring theme;
- listener transformation;
- audience psychology;
- visual motif;
- content pillar;
- brand guardrail.

The identity source must materially change the premise, mechanic, emotional angle,
execution or audience relevance.

Do not merely mention Identity Kit language in the caption.

If the concept could be reused for many unrelated artists, personalise or replace it.

Rules:
${ideaDepthGuidance}

- Keep the batch music-centred and connected to the artist's sound, performance, release or creative world.
- Avoid near-duplicates. Each slot should feel distinct but on-brand.
- If an "Avoid list" is provided, do NOT reuse or closely paraphrase those titles/hooks/ideas.
- Make ideas feel like real platform-native content, not generic marketing suggestions.
- For DETAILED mode, increase specificity, not complexity.
- Do not make detailed ideas bloated, multi-scene, or overproduced unless the user's brief clearly supports that.
- Respect AUDIENCE language and interests.
- Respect the artist's actual creative and performance setup.
- Do NOT suggest instruments, band performance ideas, DJ actions, or music-making workflows unless they clearly fit the stated artist type or performance style.
- If the artist is a rapper or says they do not play instruments, avoid instrument-based suggestions entirely.
- Do not make title, hook, or concept much longer in DETAILED mode than in BALANCED mode.
- If contextSource is "campaign", use campaign concept, rollout, tone, deliverables, and visual direction to shape the ideas.
- If contextSource is "release_strategy", use that strategic direction to shape the ideas.
- If focusMode is "old_release", generate ideas for catalogue revival and renewed attention rather than new-release hype.
- When campaign context is present, the ideas should feel like they belong to the campaign world, not like generic standalone ideas.
- When release strategy context is present, the ideas should reflect the broader rollout logic and priorities.
- When lyrics or release context are provided, extract the deeper human experiences behind the song before creating ideas.
- Turn themes into audience-relatable experiences that point back to the song, lyric, performance, or release.
- Build POV ideas around those experiences, not just around the song title.
- POV content does not have to mean lip-syncing.
- POV execution can use facial expression, body language, hand gestures, walking shots, stillness, environment, contrast, or visual metaphor.
- Avoid defaulting every music idea to lip-sync performance.
- Personal storytelling should support the song, lyric, sound, performance, release, or artist world — not replace it.
- Avoid generating too many generic life-story posts that could work without the music.
- A good idea should make someone more likely to listen, save the song, remember the lyric, or understand the artist world.



- Each "why" should explain the specific psychology of that exact idea.
- If lyrics are provided, analyse them before generating ideas.
- Identify the strongest emotional lines, phrases, themes, or moments in the lyrics.
- Do NOT tell the user to "choose a verse" or "select a lyric" if usable lyrics were already provided.
- Instead, recommend specific lyrical moments or emotional sections to build content around.
- The idea should name or reference the chosen lyric moment clearly.
- Prioritise lyric moments that are relatable, emotionally specific, quotable, or visually easy to turn into content.
- Never say "select a line", "pick a lyric", "choose a verse", or "use a lyric from your song" when lyrics have been provided.
- If lyrics are provided, YOU must choose the strongest lyric moment yourself.


Output STRICTLY valid JSON with this shape:

{
  "items": [
    {
      "date": "YYYY-MM-DD",
      "platform": "instagram" | "tiktok" | "youtube" | "facebook" | "x",
            "title": "Short internal card title that labels the idea clearly",
      "short_label": "Very short label",
      "pillar": "Performance" | "POV" | "Lyrics" | "Slideshow" | "Cinematic" | "BTS" | "Discovery" | "Community" | "Humour",
      "content_type": "Must be exactly one of these selected badge values only: ${allowedBadgeTypes.join(', ')}",
      "hook": "A first spoken line or scroll-stopping opening phrase. It must NOT repeat the title wording.",
"onScreenText": "Short text overlay for the video. Must be different from the hook and must express the approved Attention Gene and concept psychology.",
"idea": "Describe the creative proposition in 2–4 sentences. Explain what the viewer experiences, what changes, reveals or pays off, and why the music is essential. Do not include camera placement, lighting, shot lists, editing instructions or text placement here.",
      "execution": "Translate the approved concept into exact filming instructions. Include only relevant details such as framing, camera movement, location use, pacing, editing rhythm, lighting, B-roll, transitions and text placement.",
      "suggested_caption": "A short human caption",
      "cta": "A natural CTA",
      "why": ["1 short reason", "optional second short reason"]
    }
  ]
}
Never use "Idea" as the pillar or content_type.

AUDIENCE OVERRIDE RULE

The audience description should heavily influence emotional direction.

If audience includes:

- party
- nightlife
- dance
- club
- festival
- energy
- workout
- hype

Prefer:

- excitement
- anticipation
- celebration
- movement
- confidence
- freedom
- escapism

Avoid:

- sadness
- healing
- loneliness
- nostalgia
- regret
- emotional recovery

unless explicitly supplied by lyrics or artist context.
`.trim()

const LYRIC_ONLY_FRAMEWORKS = new Set([
  'Lyric performance',
  'Lyric slideshow',
  'One lyric, one visual',
  'Lyrics on screen',
  'Lyric acting',
  'Lyric reveal',
  'Punchline / bar breakdown',
  'Verse spotlight',
  'Chorus preview',
])  

const eligibleFrameworks = CONTENT_FRAMEWORKS.filter(framework => {
  if (!hasLyrics && LYRIC_ONLY_FRAMEWORKS.has(framework)) {
    return false
  }

  return true
})

const availableFrameworks = hasLyrics
  ? CONTENT_FRAMEWORKS
  : CONTENT_FRAMEWORKS.filter(
      framework => !LYRIC_ONLY_FRAMEWORKS.has(framework)
    )
  

const pickRandomExamples = (
  category: string,
  count: number
) => {
  const examples =
    TEXT_ON_SCREEN_LIBRARY[
      category as keyof typeof TEXT_ON_SCREEN_LIBRARY
    ] || []

  return [...examples]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map(example => ({
      category,
      example,
    }))
}

const nonEmotionalCategories = [
  'musicCulture',
  'artistHumour',
  'fanCulture',
  'hotTakes',
  'musicObservations',
  'debateStarters',
  'fanPsychology',
  'unexpectedObservations',
  'artistReality',
]



const selectedTextOnScreenExamples = [
  ...nonEmotionalCategories
    .sort(() => Math.random() - 0.5)
    .slice(0, 5)
    .flatMap(category => pickRandomExamples(category, 2)),
  ...pickRandomExamples('identity', 1),
  ...pickRandomExamples('relatableTruths', 1),
].slice(0, 12)


const artistTypeRules = `
Artist type rules:
- Selected artist type: ${artistType || 'Not specified'}
- Selected genre/lane: ${genre || 'Not specified'}
- Selected audience: ${audience || 'Not specified'}
- Selected content types: ${contentTypes.join(', ')}

Hard rules:
- Artist type is a hard compatibility rule, but it must operate inside Creative Reality and the artist's explicitly selected content styles.
- Do not generate ideas that conflict with the selected artist type.
- Do not mention lyrics, verses, bars, choruses, handwritten lyrics or lyric explanations unless actual lyrics were supplied.
- Do not borrow rapper/singer formats for DJs, producers, or instrumentalists.

Rapper:
- Use verified performance, flow, delivery, identity, visual world and location-based expression.
- Use bars, verses or lyrical meaning only when actual lyrics were supplied.

Singer:
- Use verified vocal performance, melody, demos, visual world and emotional delivery.
- Use chorus or lyric-specific concepts only when actual lyrics were supplied.

Producer:
- Use verified beat-making, sound design, arrangement, transitions, process,
  before-and-after sound moments and production decisions.

DJ:
- Use verified drops, transitions, track selection, preparation, energy shifts,
  atmosphere and listening context.
- Use crowds, live footage, soundchecks, backstage or booth footage only when explicitly available.
- Do not use lyrics, singing, rapping, acoustic performance or vocal storytelling
  without explicit supporting context.

Band:
- Use rehearsals, instruments, arrangement and group performance only when the
  required members and footage are available.

Instrumentalist:
- Use playing technique, tone, practice, performance and arrangement details.

Songwriter:
- Use writing process, voice notes, demos and song development.
- Use specific lyrical meaning only when actual lyrics were supplied.
`

  const userPrompt = `
Artist: ${artistName}
${contextBlock}
${artistTypeRules}
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
Selected identity kit ID: ${selectedIdentityKitId || 'None'}



Campaign context:
${campaignContextBlock}

Release strategy context:
${releaseStrategyContextBlock}

Identity Kit context:
${identityKitContextBlock}

CREATIVE REALITY FOR THIS GENERATION

Treat the artist's stated Creative Reality as hard production requirements.

Do not assume access to:

- other people
- extra equipment
- outdoor locations
- studio access
- money
- travel
- advanced editing
- confidence speaking or performing

unless the artist explicitly provides it.

Every idea must be realistically achievable within the supplied time, confidence, location, equipment, energy and budget.

When uncertain, choose the simpler execution.

CONSTRAINT TRANSFORMATION

Whenever the artist describes a limitation:

1. Identify the limitation.
2. Identify the hidden creative advantage.
3. Choose a suitable format and concept mechanic.
4. Build the idea around that advantage.
5. Keep the final execution inside the original limitation.

Examples:

Small bedroom
→ intimacy, closeness, repetition, recognisable setting

No face
→ mystery, hands, objects, environments, silhouette, text, voiceover

Phone camera only
→ immediacy, authenticity, handheld energy

No budget
→ resourcefulness, simplicity, repeatable formats

Low confidence on camera
→ voiceover, text overlays, slideshow, process footage, partial framing

Only 10–20 minutes
→ single-take videos, recurring series, one-location ideas, reusable setups

No tripod
→ handheld footage, fixed phone placement, natural movement

No helpers
→ solo storytelling, screen recordings, self-filmed close-ups, existing footage

Cannot film outside
→ bedroom, desk, doorway, mirror, window, wall, floor, notebook, phone screen

Never remove the original limitation while transforming it.

For example, do not respond to "I cannot film outside" by suggesting an easier outdoor location.

The strongest ideas make the artist's creative reality feel intentional rather than limiting.

Good ideas should feel realistic for the artist to make this week.

Bad:
"Film a cinematic outdoor sequence."

Good:
"Film a close-up phone video at your desk using text on screen, hands, notebook shots, or room details."

Every idea should respect the artist's available time, confidence, location, equipment and energy.

${oldReleaseGuidance || ''}

LYRIC AVAILABILITY FOR THIS GENERATION

Has supplied lyrics: ${hasLyrics ? 'Yes' : 'No'}

${hasLyrics
  ? `Use only the supplied lyrics and verified lyric-analysis moments below.

Lyrics focus:
${lyricsFocus || 'general'}

Supplied lyrics:
${lyrics.slice(0, 4000)}

Verified lyric-analysis moments:
${lyricMomentsBlock}`
  : `No lyrics were supplied.

Do not reference, quote or assume:
- lyrics
- lines
- verses
- bars
- choruses
- lyrical hooks
- lyric screenshots
- lyric meanings
- behind-the-lyric history

Build ideas from verified sound, mood, identity, audience psychology, process,
performance, visual world and release context instead.`}


ARTIST-TYPE AND AUDIENCE ADAPTATION

Use the supplied artist type, genre, audience and Creative Reality together.

For producers, DJs and electronic artists:

- focus on verified sound, arrangement, transitions, build-up, release, movement,
  atmosphere, process and listening context;
- do not assume vocals, lyrics, singing, rapping or acoustic performance;
- do not assume crowds, gigs, booths, backstage access, live footage or fan reactions;
- use live or crowd material only when explicitly available;
- for nightlife, dance, festival or high-energy audiences, favour supported
  territories such as anticipation, movement, freedom, confidence, atmosphere,
  celebration, tension and release;
- do not default to therapy, loneliness, hidden pain, pressure or perseverance
  unless explicitly supported.

Artist type never overrides Creative Reality.

Audience mood never authorises invented assets.

Plan parameters:
- Start date: ${startDate}
- Number of weeks: ${weeks}
- Approx posts per week: ${postsPerWeek}
- Allowed platforms: ${platforms.join(', ')}
- Selected content types: ${contentTypes.join(', ')}
- Treat selected content types as hard constraints, not suggestions.
- Do not generate content outside these selected types.
- Avoid list (do not repeat or closely paraphrase):
${(avoidTitles || []).slice(0, 40).map(t => `- ${t}`).join('\n') || 'None'}

Creative formats available for this generation:
${availableFrameworks.map(x => `- ${x}`).join('\n')}

Text-on-screen inspiration library:
${selectedTextOnScreenExamples
  .map(item => `- ${item.category}: ${item.example}`)
  .join('\n')}

Use this library only as optional presentation inspiration.

Do not copy, lightly rewrite or allow an example to determine the concept.

Ignore any example that conflicts with artist type, lyric availability,
Identity Kit, Creative Reality, the approved concept or the Decision Engine.

Design a content calendar that:
- Spreads posts across the weeks.
- Uses a mix of the allowed platforms.
- Feels coherent with one artist identity.
- Can be realistically executed by a busy independent artist.


You MUST:
- Return at least ${targetCandidateCount} items.
- Every requested candidate must meet the same quality standard.
- Additional candidates are a private validation reserve, not weaker backup ideas.
- Never repeat an earlier concept merely to reach the candidate count.
- Ensure dates are valid calendar dates after the start date.
- Keep the ideas genuinely usable.
- Every item must feel clearly different from the others.
- Do not repeat the same concept with minor wording changes.
- If the requested number is high, increase variety across hook, post structure, audience angle, execution style, and content pillar.
- When a candidate would repeat an earlier idea, replace its underlying creative route.
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
  contentTypes: allowedBadgeTypes,
  hasLyrics,
}),
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
          ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal, hasLyrics }),
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
          ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal, hasLyrics }),
          _fallback: true,
          _fallbackReason: 'items_not_array',
        },
        { status: 200 }
      )
    }

    

const allowedBadgeSet = new Set(allowedBadgeTypes)

parsed.items = parsed.items.map((item: any, index: number) => {
  const rawContentType =
    typeof item?.content_type === 'string'
      ? item.content_type
      : typeof item?.format === 'string'
      ? item.format
      : ''

  const normalised = normalizeContentType(rawContentType)

  return {
    ...item,
    content_type: allowedBadgeSet.has(normalised)
      ? normalised
      : allowedBadgeTypes[index % allowedBadgeTypes.length],
  }
})


    const safePlatforms = Array.isArray(platforms) && platforms.length ? platforms : ['instagram']


const safeContentTypes = allowedBadgeTypes.length
  ? allowedBadgeTypes
  : ['text-on-screen']
   const candidateItems = (parsed.items as CalendarItem[])
  .map((item, index) => {
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

  const normalisedContentType = normalizeContentType(rawContentType)

      const blockedContentTypes = ['idea']

const contentType =
  safeContentTypes.includes(normalisedContentType) &&
  !blockedContentTypes.includes(normalisedContentType)
    ? normalisedContentType
    : safeContentTypes[index % safeContentTypes.length]


    const why = Array.isArray(rawItem.why)
      ? rawItem.why.filter(Boolean).slice(0, 2)
      : []

    const title = rawItem.title?.trim() || `Idea ${index + 1}`
    const concept = rawItem.concept?.trim() || rawItem.execution?.trim() || ''
    const execution = rawItem.execution?.trim() || rawItem.concept?.trim() || ''

    const onScreenText =
      rawItem.on_screen_text?.trim() ||
      rawItem.onScreenText?.trim() ||
      ''

    const rawHook = rawItem.hook?.trim() || ''

    const hook =
      rawHook &&
      normalizeForComparison(rawHook) !== normalizeForComparison(title) &&
      normalizeForComparison(rawHook) !== normalizeForComparison(concept) &&
      normalizeForComparison(rawHook) !== normalizeForComparison(execution)
        ? rawHook
        : pickReplacementOnScreenText({
            hook: title,
            title,
            concept,
            index,
          })

    const safeOnScreenText = improveOnScreenText({
      onScreenText,
      hook,
      title,
      concept,
      index,
    })

    const cta = rawItem.cta?.trim() || 'What do you think?'
    const pillar = contentType

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

    if (!hasTitle || !hasSomeUsableContent) return false

    if (violatesArtistType(item as any, artistType, genre)) return false

    return true
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

Each idea must feel like a real content post an artist would actually film.

Do not describe topics.

Do not describe themes.

Do not describe categories.

Instead describe a specific piece of content.

Bad:
"Highlight a lyric about success."

Good:
"Rap the line that made you realise success can feel lonely."

Avoid repeating or closely copying these existing ideas:
${existingIdeasForAvoidList || 'None'}

Creative formats available:
${availableFrameworks.map(x => `- ${x}`).join('\n')}

Text-on-screen inspiration by missing idea slot:

Lyrics context:
${lyrics
  ? `Focus: ${lyricsFocus || 'general'}

Use these lyrics as source material.

Lyrics:
${lyrics.slice(0, 4000)}

Pre-analysed strongest lyric moments:
${lyricMomentsBlock}`
  : 'No lyrics provided.'}

When generating onScreenText:

- Do NOT describe the video.
- Do NOT summarise the content.
- Do NOT simply repeat the lyric.

Create on-screen text from the approved concept, Attention Gene, audience
psychology and artist identity.

Do not use underdog or found-early framing unless strongly justified by the
original context and Decision Engine.

The best onScreenText should feel like something a viewer would repost.


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
- onScreenText should be shorter, sharper, and more repostable than the hook.
- Use only formats compatible with the selected content types, artist type,
  lyric availability, Creative Reality and existing batch.
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

const normalisedContentType = normalizeContentType(rawContentType)

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

            const safeOnScreenText = improveOnScreenText({
  onScreenText,
  hook: rawHook,
  title,
  concept,
  index,
})

            const titleLower = title.trim().toLowerCase()
            const hookLower = rawHook.trim().toLowerCase()

            const hook =
              rawHook && rawHook !== title && hookLower !== titleLower
                ? rawHook
                : concept && concept.trim().toLowerCase() !== titleLower
                ? concept
                : ''

            const cta = rawItem.cta?.trim() || 'Listen if this found you at the right time.'
            const pillar = contentType

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

            return (
  hasTitle &&
  hasSomeUsableContent &&
  !violatesArtistType(item, artistType, genre)
)
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
      hasLyrics,
    })
  )
}

console.log('candidateItems', candidateItems.length)
console.log('completedItems', completedItems.length)
console.log('totalSlots', totalSlots)

    const finalItems = completedItems.slice(0, totalSlots).map((item, index) => {
  const contentType =
    safeContentTypes[index % safeContentTypes.length] || 'text-on-screen'

  return {
    ...item,
    content_type: contentType,
    pillar: contentType,
    format: contentType,
    structured: {
      ...item.structured,
      contentType,
    },
  }
})

return NextResponse.json(
  { items: finalItems },
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
        hasLyrics,
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