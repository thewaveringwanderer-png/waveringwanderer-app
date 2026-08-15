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
import { formatCreativeCompassForPrompt } from '@/lib/ideaFactory/creativeCompass'
import { formatHookEngineForPrompt } from '@/lib/ideaFactory/hookEngine'
import { formatCtaEngineForPrompt } from '@/lib/ideaFactory/ctaEngine'
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
    audienceStage?:
    | 'discovery'
    | 'awareness'
    | 'connection'
    | 'community'
    | 'release-support'
    | 'conversion'

  cameraConfidence?:
    | 'love-camera'
    | 'comfortable'
    | 'neutral'
    | 'prefer-not'
    | 'faceless'

  speakingConfidence?:
    | 'love-speaking'
    | 'comfortable'
    | 'short-scripted'
    | 'voiceover-only'
    | 'never-speak'

  performanceConfidence?:
    | 'love-performing'
    | 'comfortable'
    | 'sometimes'
    | 'rarely'
    | 'avoid-performance'

  editingConfidence?:
    | 'very-simple'
    | 'moderate'
    | 'advanced'

  productionStyles?: string[]
  availableTime?: string
  equipment?: string[]
  locations?: string[]
  budget?: string
  worksAlone?: string
  existingFootage?: string
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

  summary: string
  viewerExperience: string

  hook: string
  onScreenText: string
  concept: string
  execution: string
  caption: string
  cta: string
  why: string[]

  whyChosenForArtist: string
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
 summary?: string
  viewerExperience?: string
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
  releaseContext?: string
  ideaDepth?: 'simple' | 'balanced' | 'detailed'
  contextSource?: 'manual' | 'identity' | 'campaign' | 'release_strategy'
  campaignContext?: CalendarRequest['campaignContext']
  releaseStrategyContext?: CalendarRequest['releaseStrategyContext']
  contentTypes?: string[]
  hasLyrics: boolean
  cameraConfidence:
  | 'love-camera'
  | 'comfortable'
  | 'neutral'
  | 'prefer-not'
  | 'faceless'

speakingConfidence:
  | 'love-speaking'
  | 'comfortable'
  | 'short-scripted'
  | 'voiceover-only'
  | 'never-speak'

performanceConfidence:
  | 'love-performing'
  | 'comfortable'
  | 'sometimes'
  | 'rarely'
  | 'avoid-performance'

existingFootage: string
worksAlone: string
locations: string[]
}) {
  const {
    startDate,
    totalSlots,
    platforms,
    artistName,
    goal,
    genre = '',
    releaseContext = '',
    ideaDepth = 'balanced',
    contextSource = 'manual',
    campaignContext = null,
    releaseStrategyContext = null,
    contentTypes = [],
    hasLyrics,
    cameraConfidence,
speakingConfidence,
performanceConfidence,
existingFootage,
worksAlone,
locations,
    
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
        releaseContext,
        ideaDepth,
        contextSource,
        campaignContext,
        releaseStrategyContext,
        hasLyrics,
        cameraConfidence,
speakingConfidence,
performanceConfidence,
existingFootage,
worksAlone,
locations,
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
  
  releaseContext?: string
  ideaDepth: 'simple' | 'balanced' | 'detailed'
  contextSource?: 'manual' | 'identity' | 'campaign' | 'release_strategy'
  campaignContext?: CalendarRequest['campaignContext']
  releaseStrategyContext?: CalendarRequest['releaseStrategyContext']
  contentTypes?: string[]
  cameraConfidence: CalendarRequest['cameraConfidence']
speakingConfidence: CalendarRequest['speakingConfidence']
performanceConfidence: CalendarRequest['performanceConfidence']

existingFootage: string
worksAlone: string
locations: string[]
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
  releaseContext = '',
  ideaDepth,
  contextSource = 'manual',
  campaignContext = null,
  releaseStrategyContext = null,
  usedTitles = [],
  usedConcepts = [],
  contentTypes = [],
  hasLyrics,
  cameraConfidence,
  speakingConfidence,
  performanceConfidence,
  existingFootage,
  worksAlone,
  locations,
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
  requiresExistingFootage?: boolean
  requiresFace?: boolean
  requiresSpeaking?: boolean
  requiresPerformance?: boolean
  requiresAnotherPerson?: boolean
  requiresOutdoorAccess?: boolean
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

const isFaceless = cameraConfidence === 'faceless'
const avoidsFace =
  cameraConfidence === 'faceless' ||
  cameraConfidence === 'prefer-not'

const cannotSpeak =
  speakingConfidence === 'never-speak' ||
  speakingConfidence === 'voiceover-only'

const cannotPerform =
  performanceConfidence === 'avoid-performance'

const hasExistingFootage =
  normalizeForComparison(existingFootage) === 'yes'

const worksSolo =
  normalizeForComparison(worksAlone) === 'yes'

const confirmedLocationText = locations
  .map(normalizeForComparison)
  .join(' ')

const hasConfirmedOutdoorAccess =
  confirmedLocationText.includes('outdoor') ||
  confirmedLocationText.includes('street') ||
  confirmedLocationText.includes('park') ||
  confirmedLocationText.includes('garden') ||
  confirmedLocationText.includes('outside')

const eligibleFallbackVariants = fallbackVariants.filter(variant => {
  if (variant.requiresLyrics && !hasLyrics) {
    return false
  }

  if (variant.requiresExistingFootage && !hasExistingFootage) {
    return false
  }

  if (variant.requiresFace && isFaceless) {
    return false
  }

  if (variant.requiresSpeaking && cannotSpeak) {
    return false
  }

  if (variant.requiresPerformance && cannotPerform) {
    return false
  }

  if (variant.requiresAnotherPerson && worksSolo) {
    return false
  }

  if (variant.requiresOutdoorAccess && !hasConfirmedOutdoorAccess) {
    return false
  }

  return variant.supportedTypes.some(type =>
    contentTypes.includes(type)
  )
})

const universalSafeFallback: FallbackVariant = {
  title: 'Music-first text post',
  supportedTypes: ['text-on-screen'],
  pillar: 'Discovery',
  format: 'text-on-screen',
  idea:
    'Pair the song audio with one clear audience-facing thought that communicates the feeling or purpose of the music.',
  hook:
    'Some songs find you before you know why you need them.',
  onScreenText:
    'For the person this song is meant to find.',
  execution:
    'Place the phone in a stable position using only confirmed equipment or a safe available surface. Film a simple detail from a confirmed location, or use a plain background with native text over the song audio. Keep it to one take or two simple cuts.',
  cta:
    'Save this if the feeling makes sense to you.',
  why: [
    'It keeps the music central without requiring speech, facial performance, lyrics or existing footage.',
    'It can be made alone with minimal editing and no assumed props.',
  ],
}

const fallbackPool = eligibleFallbackVariants.length
  ? eligibleFallbackVariants
  : [universalSafeFallback]

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

  const normalizedGoal = normalizeForComparison(goal)

if (normalizedGoal === 'reach new listeners') {
  title = `Discovery-focused: ${variant.title}`

  idea = simple
    ? `Use this idea to introduce the music clearly to someone discovering the artist for the first time.`
    : `Use this idea to reach new listeners through immediate context, curiosity and a clear music-first reason to stay.`

  hook = variant.hook

  cta = 'Stay if this sounds like something you would listen to.'

  why = [
    'The idea is understandable without requiring prior knowledge of the artist.',
    'It gives new listeners an immediate reason to connect with the music.',
  ]
} else if (normalizedGoal === 'deepen fan connection') {
  title = `Connection-focused: ${variant.title}`

  idea = simple
    ? `Use this idea to help existing listeners understand the artist or music more deeply.`
    : `Use this idea to deepen fan connection by revealing more personality, meaning, process or emotional context around the music.`

  cta = 'What does this bring to mind for you?'

  why = [
    'Personal or creative context helps listeners form a stronger relationship with the artist.',
    'The content adds meaning beyond simply promoting the song.',
  ]
} else if (normalizedGoal === 'promote a release') {
  title = `Release-focused: ${variant.title}`

  idea = simple
    ? `Use this idea to give people one clear reason to care about the current release.`
    : `Use this idea to support the current release through one focused emotional, musical or creative angle.`

  cta = 'Listen to the full release when you are ready.'

  why = [
    'One focused release angle is easier to understand than a generic announcement.',
    'It keeps the release visible while offering the audience fresh value.',
  ]
} else if (normalizedGoal === 'increase streams') {
  title = `Listening-focused: ${variant.title}`

  idea = simple
    ? `Use this idea to make the song memorable enough for viewers to listen again.`
    : `Use this idea to highlight a memorable feeling, sound or moment that gives viewers a reason to hear the full song.`

  cta = 'Listen to the full track if this moment stayed with you.'

  why = [
    'A memorable music-first moment can encourage listeners to hear more.',
    'The CTA asks for one clear listening action.',
  ]
} else if (normalizedGoal === 'build consistency') {
  title = `Repeatable format: ${variant.title}`

  idea = simple
    ? `Use this as a low-pressure post that can be repeated regularly.`
    : `Use this idea as a repeatable content format that is realistic to produce consistently within the artist's available time and resources.`

  cta = 'Follow to see the next one.'

  why = [
    'Repeatable formats reduce the pressure of inventing a new structure every time.',
    'A realistic production burden makes consistent posting more sustainable.',
  ]
} else if (normalizedGoal === 'grow my mailing list') {
  title = `Mailing-list-focused: ${variant.title}`

  idea = simple
    ? `Use this idea to give listeners a clear reason to stay connected beyond social media.`
    : `Use this idea to build trust and offer a meaningful reason for interested listeners to join the artist's mailing list.`

  cta = 'Join the mailing list for the next update.'

  why = [
    'The content builds interest before asking for contact information.',
    'The CTA creates one clear route into the artist’s owned audience.',
  ]
} else if (normalizedGoal === 'sell tickets') {
  title = `Live-show-focused: ${variant.title}`

  idea = simple
    ? `Use this idea to make the upcoming live experience feel worth attending.`
    : `Use this idea to build anticipation around the upcoming show through genuine energy, context or a clear reason to attend.`

  cta = 'Get your ticket if you want to experience this live.'

  why = [
    'The idea connects the content to the value of the live experience.',
    'The CTA gives interested viewers one clear next action.',
  ]
} else if (normalizedGoal === 'build community') {
  title = `Community-focused: ${variant.title}`

  idea = simple
    ? `Use this idea to invite listeners into a shared conversation around the music.`
    : `Use this idea to encourage participation, shared recognition or recurring interaction while keeping the music central.`

  cta = 'Add your answer in the comments.'

  why = [
    'Participation helps listeners feel included in the artist’s world.',
    'The prompt encourages interaction without replacing the music.',
  ]
} else if (normalizedGoal === 'test new content ideas') {
  title = `Creative test: ${variant.title}`

  idea = simple
    ? `Use this as a simple experiment and observe how the audience responds.`
    : `Use this idea to test a distinct creative direction, viewer experience or presentation style without overcommitting resources.`

  cta = 'Should I make more content like this?'

  why = [
    'The post tests a clear creative variable rather than changing everything at once.',
    'Audience response can guide future content decisions.',
  ]
} else if (normalizedGoal === 'other') {
  title = variant.title
  idea = variant.idea
  hook = variant.hook
  cta = variant.cta
  why = variant.why
}

  if (releaseContext && contextSource === 'manual') {
  idea = `${idea} Use this supplied context where relevant: ${releaseContext}.`
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

  const fallbackCaption = (() => {
  if (contextSource === 'campaign' && campaignTitle) {
    return simple
      ? `Another piece of the ${campaignTitle} world.`
      : `Building out the ${campaignTitle} campaign world one post at a time.`
  }

  if (
    contextSource === 'release_strategy' &&
    releaseStrategyContext
  ) {
    return simple
      ? `Turning the release plan into something real.`
      : `Taking one part of the release strategy and turning it into clear, usable content.`
  }

  switch (normalizedGoal) {
    case 'reach new listeners':
      return simple
        ? `Maybe this finds the right new listener.`
        : `Making it easier for the right new listeners to discover the music.`

    case 'deepen fan connection':
      return simple
        ? `A little more of the story behind the music.`
        : `Sharing more of the meaning, personality and process behind the music.`

    case 'promote a release':
      return simple
        ? `One more reason to hear the release.`
        : `Giving the current release another meaningful angle instead of repeating the same announcement.`

    case 'increase streams':
      return simple
        ? `Hear the full track when you are ready.`
        : `Highlighting one moment that might make the full track worth another listen.`

    case 'build consistency':
      return simple
        ? `Keeping the momentum moving.`
        : `Building consistency through content that is realistic enough to repeat.`

    case 'grow my mailing list':
      return simple
        ? `Stay connected beyond the feed.`
        : `Creating a stronger way for listeners to stay connected beyond social media.`

    case 'sell tickets':
      return simple
        ? `This one is meant to be experienced live.`
        : `Building anticipation for the energy and experience of the upcoming show.`

    case 'build community':
      return simple
        ? `This one is for the people who understand.`
        : `Creating more space for listeners to participate in the artist’s world.`

    case 'test new content ideas':
      return simple
        ? `Trying something different with this one.`
        : `Testing a new creative direction and seeing how the audience responds.`

    default:
      return simple
        ? `One post to keep the momentum moving.`
        : `A clear, usable post that keeps momentum moving without overcomplicating the content.`
  }
})()
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

  summary: idea,

  viewerExperience:
    'The viewer follows one clear visual, emotional or musical progression before the idea reaches its payoff.',

  hook,
  onScreenText,
  concept: idea,
  execution,
  caption: fallbackCaption,
  cta,

  why: simple ? why.slice(0, 1) : why.slice(0, 2),

  whyChosenForArtist:
    'This idea fits the artist’s selected content style and can be produced within their confirmed Creative Reality.',
},
  }
}

function safeString(x: unknown) {
  return typeof x === 'string' ? x : x == null ? '' : String(x)
}

function wordCount(value: unknown) {
  return safeString(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length
}

function conceptContainsExecutionLanguage(value: unknown) {
  const text = safeString(value).toLowerCase()

  const executionPhrases = [
    'film ',
    'record ',
    'place the phone',
    'position the phone',
    'position the camera',
    'set the phone',
    'set camera',
    'use a close-up',
    'shoot ',
    'capture ',
    'overlay text',
    'add text',
    'place text',
    'edit ',
    'frame ',
    'framing ',
    'lighting ',
    'camera angle',
    'single take',
    'continuous shot',
  ]

  return executionPhrases.some(phrase => text.includes(phrase))
}

function isValidConcept(value: unknown) {
  const concept = safeString(value).trim()
  const words = wordCount(concept)

  if (!concept) return false
  if (words < 6) return false
  if (words > 30) return false
  if (conceptContainsExecutionLanguage(concept)) return false

  return true
}

function looksLikeLeakedJson(value: unknown) {
  const text = safeString(value).trim()

  if (!text) return false

  const jsonMarkers = [
    '"items"',
    '"date"',
    '"platform"',
    '"title"',
    '"short_label"',
    '"pillar"',
    '"content_type"',
    '"hook"',
    '"onScreenText"',
    '"concept"',
    '"execution"',
    '"suggested_caption"',
    '"cta"',
    '"why"',
  ]

  const markerCount = jsonMarkers.filter(marker =>
    text.includes(marker)
  ).length

  const containsObjectSequence =
    text.includes('},{') ||
    text.includes('}, {') ||
    text.includes('],"date"') ||
    text.includes('],"title"')

  const looksLikeWholeJson =
    (text.startsWith('{') || text.startsWith('[')) &&
    markerCount >= 3

  return markerCount >= 4 || containsObjectSequence || looksLikeWholeJson
}

function itemContainsLeakedJson(item: AiCalendarItem) {
  const fields = [
    item.title,
    item.short_label,
    item.hook,
    item.onScreenText,
    item.on_screen_text,
    item.concept,
    item.execution,
    item.suggested_caption,
    item.cta,
  ]

  return fields.some(looksLikeLeakedJson)
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
  audienceStage = 'discovery',

  cameraConfidence = 'comfortable',
  speakingConfidence = 'comfortable',
  performanceConfidence = 'comfortable',
  editingConfidence = 'very-simple',

  productionStyles = [],
  availableTime = '30 minutes',
  equipment = [],
  locations = [],
  budget = 'No budget',
  worksAlone = 'Yes',
  existingFootage = 'No',

  goal = '',

    identityKitContext = null,
  selectedIdentityKitId = null,

    tone = 'brand-consistent, concise, human, engaging',
    ideaDepth = 'balanced',
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

  const safeProductionStyles = Array.isArray(productionStyles)
  ? productionStyles.map(safeString).filter(Boolean)
  : []

const safeEquipment = Array.isArray(equipment)
  ? equipment.map(safeString).filter(Boolean)
  : []

const safeLocations = Array.isArray(locations)
  ? locations.map(safeString).filter(Boolean)
  : []

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

const targetCandidateCount = Math.max(
  totalSlots + 3,
  Math.ceil(totalSlots * 1.6)
)
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
  releaseContext,
  ideaDepth,
  contextSource,
  campaignContext,
  releaseStrategyContext,
  contentTypes: allowedBadgeTypes,
  hasLyrics: lyrics.trim().length > 0,
  cameraConfidence,
speakingConfidence,
performanceConfidence,
locations: safeLocations,
worksAlone,
existingFootage,
}),
        _fallback: true,
        _fallbackReason: 'missing_openai_key',
      },
      { status: 200 }
    )
  }

  const audienceStageGuidance = (() => {
  switch (audienceStage) {
    case 'discovery':
      return `
AUDIENCE STAGE: DISCOVERY

Most viewers do not know the artist yet.

Prioritise:
- immediate context;
- curiosity;
- music-first proof;
- clear emotional recognition;
- low-friction CTAs;
- concepts that work without prior fan knowledge.

Avoid:
- unexplained artist lore;
- inside jokes;
- long introductions;
- assuming viewers already care;
- high-commitment CTAs.
`.trim()

    case 'awareness':
      return `
AUDIENCE STAGE: AWARENESS

Some viewers recognise the artist or music but are not regular listeners yet.

Prioritise:
- recognisable recurring identity;
- stronger familiarity;
- repeat exposure;
- memorable creative motifs;
- clear reasons to return;
- turning recognition into interest.

Avoid:
- acting as though recognition already equals loyalty;
- asking for major commitment too early.
`.trim()

    case 'connection':
      return `
AUDIENCE STAGE: CONNECTION

The audience knows the music, but the relationship is still shallow.

Prioritise:
- personality;
- beliefs;
- process;
- lived experience;
- emotional recognition;
- the relationship between the artist and the music.

Avoid:
- reducing every idea to streams, links or release promotion.
`.trim()

    case 'community':
      return `
AUDIENCE STAGE: COMMUNITY

The artist has genuine listeners who regularly engage.

Prioritise:
- participation;
- shared language;
- recurring rituals;
- fan recognition;
- choices;
- comment-led mechanics;
- contribution to the artist world.

Do not let audience interaction replace the music entirely.
`.trim()

    case 'release-support':
      return `
AUDIENCE STAGE: RELEASE SUPPORT

The artist is activating existing listeners around a current release.

Prioritise:
- anticipation;
- reminders with fresh value;
- release momentum;
- context;
- repeated exposure without repetition;
- clear release-related actions.

Avoid treating every post as a generic announcement.
`.trim()

    case 'conversion':
      return `
AUDIENCE STAGE: CONVERSION

The goal is to encourage one meaningful next action.

Prioritise:
- one clear CTA;
- trust;
- relevance;
- urgency only when genuine;
- reducing friction;
- a strong reason to act now.

Never combine several competing CTAs in the same idea.
`.trim()

    default:
      return ''
  }
})()

const creatorBehaviourGuidance = `
CREATOR BEHAVIOUR FOR THIS GENERATION

Camera confidence: ${cameraConfidence}
Speaking confidence: ${speakingConfidence}
Performance confidence: ${performanceConfidence}
Editing confidence: ${editingConfidence}
Preferred production styles: ${
  safeProductionStyles.length
    ? safeProductionStyles.join(', ')
    : 'Not specified'
}

Interpret these as follows:

CAMERA CONFIDENCE

love-camera:
- direct facial framing is welcome;
- allow eye contact, reaction, expression and direct presence.

comfortable:
- normal camera-led concepts are acceptable.

neutral:
- do not over-rely on facial performance;
- balance face-led and non-face-led execution.

prefer-not:
- avoid close, sustained facial framing;
- prefer side profile, cropped framing, partial framing, hands, objects,
  environment or brief appearances.

faceless:
- never show the face;
- use hands, silhouette, back-of-head framing, objects, screens,
  environments, clothing details, shadows or first-person framing.

SPEAKING CONFIDENCE

love-speaking:
- direct address, improvisation and conversational delivery are welcome.

comfortable:
- normal spoken concepts are acceptable.

short-scripted:
- use one or two concise scripted sentences;
- avoid long monologues.

voiceover-only:
- do not require direct speaking to camera;
- use voiceover supported by visuals.

never-speak:
- prohibit spoken delivery and voiceover;
- use music, text, visuals, objects and performance where suitable.

PERFORMANCE CONFIDENCE

love-performing:
- performance-led concepts are welcome when compatible with selected styles.

comfortable:
- normal performance concepts are acceptable.

sometimes:
- use performance selectively rather than across the entire batch.

rarely:
- keep performance brief, partial, distant or low-pressure.

avoid-performance:
- do not require singing, rapping, lip-syncing, instrumental playing
  or staged musical performance.

EDITING CONFIDENCE

very-simple:
- prefer one take, native text, slideshows, static framing or two to three cuts;
- prohibit complex transitions, masking, compositing and layered editing.

moderate:
- allow simple pacing, clean cuts, basic transitions and light sound syncing.

advanced:
- more ambitious editing is allowed when time and format support it.

Production style describes how the finished content should feel.
It does not authorise unavailable equipment, locations, people or editing skills.
`.trim()

const structuredCreativeRealityGuidance = `
STRUCTURED CREATIVE REALITY

Available time: ${availableTime}

Available equipment:
${
  safeEquipment.length
    ? safeEquipment.map(item => `- ${item}`).join('\n')
    : '- No equipment explicitly confirmed'
}

Available locations:
${
  safeLocations.length
    ? safeLocations.map(item => `- ${item}`).join('\n')
    : '- No locations explicitly confirmed'
}

Budget: ${budget}
Usually works alone: ${worksAlone}
Existing footage: ${existingFootage}

Additional restrictions:
${creativeReality || 'None supplied'}

HARD INTERPRETATION RULES

- Only require equipment explicitly confirmed by the artist.
- You may naturally use ordinary features of any confirmed environment.
Examples include walls, ceilings, floors, furniture, doors, windows, mirrors, shelves, tables, everyday objects, natural light, existing shadows or architectural features.
- Do not build an idea around one specific object unless the artist confirmed it exists.
- Prefer flexible wording such as:

"a nearby object"

"something on your desk"

"a textured surface"

"a reflective object"

"a source of natural light"

"a corner of the room"

instead of assuming one exact item.
- Ideas should still work even if one expected object is missing.
- Do not infer a tripod from the presence of a phone.
- Do not infer studio access from artist type.
- Do not infer outdoor access from a cinematic production preference.
- Do not infer camera-roll material when existing footage is unavailable.
- Do not infer another person when the artist works alone.
- Do not prescribe footage captured earlier unless existing footage is confirmed.
- Available time controls the total production burden, not only the filming length.
`.trim()

  const contextLines: string[] = []

if (genre) {
  contextLines.push(`Genre / lane: ${genre}`)
}

if (artistType) {
  contextLines.push(`Artist type: ${artistType}`)
}

if (audienceStage) {
  contextLines.push(`Audience relationship stage: ${audienceStage}`)
}

if (audience) {
  contextLines.push(`Target audience: ${audience}`)
}

if (goal) {
  contextLines.push(`Primary goal: ${goal}`)
}

if (performanceStyle) {
  contextLines.push(
    `How the artist normally creates content: ${performanceStyle}`
  )
}

contextLines.push(`
CREATOR BEHAVIOUR

Camera confidence: ${cameraConfidence}
Speaking confidence: ${speakingConfidence}
Performance confidence: ${performanceConfidence}
Editing confidence: ${editingConfidence}
Preferred production style: ${
  safeProductionStyles.length
    ? safeProductionStyles.join(', ')
    : 'Not specified'
}
`.trim())

contextLines.push(`
STRUCTURED CREATIVE REALITY

Available time: ${availableTime}
Available equipment: ${
  safeEquipment.length ? safeEquipment.join(', ') : 'Not specified'
}
Available locations: ${
  safeLocations.length ? safeLocations.join(', ') : 'Not specified'
}
Budget: ${budget}
Usually works alone: ${worksAlone}
Existing footage: ${existingFootage}
Additional restrictions:
${creativeReality || 'None supplied'}
`.trim())

  const contextBlock = contextLines.length
    ? contextLines.join('\n')
    : 'No extra context was given. Infer a reasonable plan for an independent artist.'
  const campaignContextBlock = extractCampaignContextBlock(campaignContext)
  const releaseStrategyContextBlock = extractReleaseStrategyContextBlock(releaseStrategyContext)
const identityKitContextBlock = extractIdentityKitContextBlock(identityKitContext)


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
const validationBlock = format.validation?.length
  ? `
FORMAT VALIDATION:

${format.validation.map(item => `- ${item}`).join('\n')}
`
  : ''

const commonMistakesBlock = format.commonMistakes?.length
  ? `
COMMON FORMAT MISTAKES:

${format.commonMistakes.map(item => `- ${item}`).join('\n')}
`
  : ''

const batchVarietyBlock = format.batchVariety?.length
  ? `
BATCH VARIETY RULES:

${format.batchVariety.map(item => `- ${item}`).join('\n')}
`
  : ''

const performanceUseBlock = format.performanceUse
  ? `
PERFORMANCE USE:

${format.performanceUse}
`
  : ''
const mechanicsBlock = format.mechanics?.length
  ? `
AVAILABLE FORMAT MECHANICS:

${format.mechanics
  .map((mechanic) => {
    const slideBlueprintBlock = mechanic.slideBlueprint?.length
      ? `
SLIDE BLUEPRINT:

${mechanic.slideBlueprint
  .map((step) => {
    return `
SLIDE ${step.slide}

PURPOSE:
${step.purpose}

VISUAL DIRECTION:
${step.visualDirection}

EXAMPLE TEXT:
${step.exampleText}

TRANSITION / PACING:
${step.transitionDirection || 'Choose a simple transition that supports the progression.'}
`.trim()
  })
  .join('\n\n')}
`.trim()
      : ''

      const spokenOutlineBlock = mechanic.spokenOutline
  ? `
SPOKEN OUTLINE:

OPENING LINE:
${mechanic.spokenOutline.openingLine}

TALKING POINTS:
${mechanic.spokenOutline.talkingPoints
  .map((point) => `- ${point}`)
  .join('\n')}

CLOSING LINE:
${mechanic.spokenOutline.closingLine}
`.trim()
  : ''

    return `
MECHANIC ID: ${mechanic.id}
MECHANIC NAME: ${mechanic.name}

VIEWER EXPERIENCE:
${mechanic.viewerExperience}

STRUCTURE:
${mechanic.structure.map((item) => `- ${item}`).join('\n')}

BEST WHEN:
${mechanic.bestWhen.map((item) => `- ${item}`).join('\n')}

AVOID WHEN:
${mechanic.avoidWhen.map((item) => `- ${item}`).join('\n')}

REPEAT / SERIES POTENTIAL:
${mechanic.repeatPotential || 'Not specified'}

${slideBlueprintBlock}
${spokenOutlineBlock}

`.trim()
  })
  .join('\n\n')}
`.trim()
  : 'No predefined mechanics. Develop one that fits the format and verified Creative Reality.'
  return `
FORMAT ID: ${format.id}
FORMAT NAME: ${format.name}

BEST FOR:
${format.bestFor.map((item) => `- ${item}`).join('\n')}

WHY THIS FORMAT WORKS:
${format.psychology}

CORE STRUCTURE:
${format.structure.map((item) => `- ${item}`).join('\n')}

AVOID:
${format.avoid.map((item) => `- ${item}`).join('\n')}

EXAMPLE DIRECTION:
${format.exampleDirection}

${performanceUseBlock}

${validationBlock}

${commonMistakesBlock}

${batchVarietyBlock}

${mechanicsBlock}
`.trim()
}).join('\n\n')




const creatorGenomeKnowledge = formatCreatorGenomeForPrompt()
const creatorInferenceEngine = formatCreatorInferenceEngineForPrompt()
const reasoningPipeline = formatIdeaFactoryReasoningPipelineForPrompt()
const interferenceEngine = formatInterferenceEngineForPrompt()
const conceptEngine = formatConceptEngineForPrompt()
const decisionEngine = formatDecisionEngineForPrompt()
const batchIntelligenceEngine = formatBatchIntelligenceEngineForPrompt()
const hookEngine = formatHookEngineForPrompt()
const executionEngine = formatExecutionEngineForPrompt()
const ctaEngine = formatCtaEngineForPrompt()
const presentationEngine = formatPresentationEngineForPrompt()
const creativeCompass = formatCreativeCompassForPrompt()

  const attentionGenome = formatAttentionGenomeForPrompt()
  const systemPrompt = `
You are an expert music marketing strategist and content calendar architect.
You design practical, shootable content plans that respect an artist's reality
(time, energy, budget) while still pushing growth.

${reasoningPipeline}

CREATOR GENOME KNOWLEDGE

${creatorGenomeKnowledge}

${creatorInferenceEngine}

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

## CREATIVE EXPANSION ENGINE

Before generating any concepts, deliberately expand the artist's perceived creative possibilities.

Artists often believe their constraints reduce their options. Your job is to prove the opposite.

Treat Creative Reality as a creative playground, not a limitation.

Do NOT immediately generate ideas.

Instead, first identify as many fundamentally different creative directions as realistically exist inside the artist's available reality.

Possible creative territories include (when appropriate):

• Environment
• Objects already available in the space
• Existing light and shadow
• Camera movement
• Camera stillness
• Perspective
• Framing
• Focus
• Editing mechanics
• Visual progression
• Symbolism
• Curiosity
• Narrative
• Transformation
• Contrast
• Repetition
• Pattern recognition
• Scale
• Viewer interaction
• Music synchronisation
• Emotional tension
• Unexpected reveals
• Physical movement
• Visual rhythm
• Texture
• Colour
• Negative space
• Time
• Routine
• Reflection
• Everyday moments
• Sound interaction

Do NOT attempt to use every territory.

Instead, discover which territories naturally exist for THIS artist.

The goal is to maximise creative possibility while remaining realistic.

Think:

"What different kinds of videos could this artist make?"

NOT

"What different versions of the same video could this artist make?"

Before generating concepts, create an internal Diversity Plan.

Assign every generated idea a different primary creative territory.

Example:

Idea 1 → Environmental storytelling

Idea 2 → Camera movement

Idea 3 → Symbolism

Idea 4 → Curiosity mechanic

Idea 5 → Music interaction

Do not reveal this plan.

Use it only to maximise variety.

## CREATIVE OPPORTUNITY ENGINE

After identifying the artist's constraints, deliberately search for creative opportunities already hidden inside their reality.

Do not only ask:

"What can't this artist do?"

Also ask:

"What does this artist already have that could become interesting?"

Look for opportunities inside:

• their genre
• their environment
• their routine
• their available locations
• their available time
• their personality
• their confidence
• their identity
• their audience
• their music
• their creative process
• their limitations
• their visual world
• their existing habits
• their everyday surroundings

Treat ordinary life as raw creative material.

Every artist has opportunities that another artist does not.

Your job is to discover them.

Examples:

A small room can become intimacy.

Working alone can become intentional stillness.

Minimal editing can become authenticity.

Faceless filming can become mystery.

Limited time can become concise storytelling.

An everyday environment can become recognisable visual identity.

Do not expose this reasoning.

Quietly allow it to influence every generated concept.

CONTENT FORMAT ENGINE

Every concept must originate from a different creative territory identified by the Creative Expansion Engine.

Do not create multiple concepts that rely on the same primary mechanic.

Changing only the object, location, wording, camera angle or editing does NOT create a new concept.

The central creative experience must be different.

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

${interferenceEngine}

${decisionEngine}

${creativeCompass}

${batchIntelligenceEngine}

${hookEngine}

${executionEngine}

${ctaEngine}

POST-EXECUTION INTERFERENCE GATE

The concepts have now passed Concept Interference, the Decision Engine,
Creative Compass, Batch Intelligence and the Execution Engine.

Before presenting any idea, perform the final two Interference Engine passes.

LYRIC AND SONG-STRUCTURE GROUNDING

When no lyrics were supplied, the final hook, on-screen text, concept, execution
and CTA must not mention or require:

- lyrics;
- lines;
- bars;
- verses;
- choruses;
- bridges;
- drops;
- specific song sections;
- lyrical delivery;
- lyric meaning.

Generic performance wording is allowed:

- perform part of the track;
- perform a short section;
- begin when the music changes;
- move when the energy shifts.

If any prohibited song-structure reference appears without supplied evidence,
rewrite it before returning the item.

PASS B — EXECUTION INTERFERENCE

Re-check every completed execution against:

- explicit user instructions;
- hard Creative Reality;
- verified equipment and locations;
- whether the artist works alone;
- existing-footage availability;
- camera, speaking, performance and editing confidence;
- selected content style;
- artist type;
- lyric availability;
- the approved concept;
- every earlier prohibition and adaptation.
- the approved hook;
- the approved CTA;
- the Hook Engine validation;
- the CTA commitment ceiling;

The execution must not introduce an asset, behaviour, location, person, fact,
lyric dependency or production demand that was absent from the approved concept.

Confirm that:

- the hook still accurately promises the completed viewer experience;
- the CTA naturally follows the concept and execution;
- the CTA does not exceed the audience-stage commitment ceiling;
- neither the hook nor CTA introduces unsupported facts, lyrics, offers or context;
- the hook, concept, execution and CTA form one continuous psychological arc:

Stop → Stay → Experience → Act

If execution creates a conflict:

- adapt the execution first;
- preserve the approved concept where possible;
- replace the concept only when the concept itself caused the contradiction;
- rerun Concept Interference if replacement is necessary.

A conflict resolved earlier must not reappear through different wording.

PASS C — FINAL BATCH INTERFERENCE

Now inspect all completed ideas together.

Confirm that the batch does not repeatedly use:

- the same central concept mechanic;
- the same viewer experience;
- the same emotional entry point;
- the same creator behaviour;
- the same location or tangible anchor;
- substantially similar hooks;
- surface-level variations of one underlying idea.
- No unsupported lyric or song-structure language appears anywhere in the completed item.

Do not manufacture variety by violating artist fit, Creative Reality or selected
content styles.

Where repetition exists, replace the weakest duplicated creative route and run
that replacement through Concept Interference, the Decision Engine and Execution
Interference again.

Do not reveal this validation.

${presentationEngine}

IDEA CARD V2 OUTPUT FIELDS

Every completed idea must include the following additional fields.

SUMMARY

- Write one immediately understandable sentence.
- Explain the idea in plain language.
- Aim for 12–22 words.
- Help the artist picture the finished post quickly.
- Do not repeat the title word for word.
- Do not include detailed filming instructions.

VIEWER EXPERIENCE

- Explain what the audience sees, hears, notices or waits for.
- Focus on the experience created by the concept mechanic.
- Write one concise sentence.
- Describe the viewer journey rather than the artist's production process.
- Do not repeat the concept or execution.

WHY CHOSEN FOR THIS ARTIST

- Explain why this idea fits this specific artist.
- Reference verified information such as:
  - selected content style;
  - Creative Reality;
  - camera, speaking, performance or editing confidence;
  - available location or equipment;
  - Identity Kit;
  - audience stage;
  - primary goal.
- Mention only information actually supplied or inferred through an approved engine.
- Write one or two concise sentences.
- Do not give generic praise.
- Do not claim the idea fits the artist merely because it is easy.

FIELD DIFFERENTIATION

Summary explains the finished post at a glance.

Viewer Experience explains what the audience experiences.

Concept explains the central creative mechanism.

Execution explains how the artist produces it.

Why Chosen for This Artist explains why WW selected it for this person.

These fields must not repeat or lightly paraphrase one another.

CONCEPT AND EXECUTION OUTPUT CONTRACT

The concept and execution fields must contain different information.

CONCEPT

- Write exactly one concise sentence.
- Aim for 12–24 words.
- Never exceed 30 words.
- Express only the central creative premise.
- Explain what changes, reveals, contrasts or pays off.
- Make the role of the music understandable.
- Be direct rather than poetic or explanatory.

Do not include:

- camera placement;
- framing;
- lighting;
- editing;
- text positioning;
- shot lists;
- timing instructions;
- equipment setup;
- filming measurements;
- production steps.

Do not use production verbs such as:

- film;
- record;
- position;
- place;
- frame;
- shoot;
- edit;
- overlay;
- capture.

Do not explain:

- why the idea fits the artist;
- why the audience will respond;
- the entire visual atmosphere;
- the filming process.

EXECUTION

- Explain how to create the approved concept.
- Use only verified equipment, locations, people, time, skills and footage.
- Give the minimum practical sequence needed.
- Include only useful framing, movement, pacing, music timing, text placement
  and simple editing instructions.
- Keep execution direct and usable.
- Avoid unnecessarily precise measurements unless genuinely required.

FINAL SEPARATION CHECK

Before returning each item:

1. Confirm concept is one sentence.
2. Confirm concept is no more than 30 words.
3. Confirm concept contains no filming instructions.
4. Confirm execution explains how to produce it.
5. Remove any sentence or explanation repeated across both fields.

Concept explains the idea.

Execution explains the process.

Never copy, paraphrase or expand one field into the other.


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

${audienceStageGuidance}

${creatorBehaviourGuidance}

${structuredCreativeRealityGuidance}

- The CTA must match the supplied audience stage.
- Discovery CTAs should be low friction.
- Awareness CTAs should encourage return, recognition or another listen.
- Connection CTAs may invite reflection or personal response.
- Community CTAs may invite participation, choice or shared language.
- Release-support CTAs should support one release-related action.
- Conversion CTAs must ask for exactly one meaningful next step.
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


==================================================
IDEA CARD V2 FIELD RULES
==================================================

Every completed idea must include summary, viewerExperience and
whyChosenForArtist.

SUMMARY

- Describe the finished post in one immediately understandable sentence.
- Use plain language.
- Aim for 12–22 words.
- Help the artist picture the post quickly.
- Do not repeat the title.
- Do not include filming instructions.

VIEWER EXPERIENCE

- Describe what the audience sees, hears, notices or waits for.
- Focus on the concept mechanic and payoff.
- Describe the viewer journey, not the production process.
- Use one concise sentence.
- Do not repeat the summary or concept.

WHY CHOSEN FOR ARTIST

Purpose:

Explain the DECISION WW made when selecting this concept for this artist.

This field must answer:

"Why was THIS creative direction a better decision than another plausible direction?"

Do not summarise the artist's inputs.

Do not simply state that the idea matches:
- their content style;
- their equipment;
- their location;
- their confidence;
- their audience stage;
- their goal;
- their genre.

Those facts may be referenced only when explaining how they changed the creative decision.

Every answer must contain two things:

1. DECISION
Explain what creative advantage this concept creates for this particular artist.

2. TRADE-OFF
Explain what weaker, less suitable, less efficient or less aligned direction this choice avoids.

Examples:

WEAK:
"This suits the artist's cinematic style and simple editing confidence."

STRONG:
"The repeated composition creates visual progression without requiring complicated editing, so the artist can make the performance feel cinematic through staging rather than production complexity."

WEAK:
"This works for Discovery and helps reach new listeners."

STRONG:
"The visual transformation gives a stranger something understandable to follow before they know the artist, avoiding an opening that depends on personal history or existing fan interest."

WEAK:
"This uses the artist's available bedroom and tripod."

STRONG:
"Keeping the camera fixed turns one ordinary room into part of the concept itself, giving the post a deliberate visual rule without requiring extra locations or another person to film."

WEAK:
"This fits an artist who enjoys performing."

STRONG:
"Because performance is already a strength, WW keeps the artist at the centre but adds a reflection mechanic so the post does not become interchangeable performance footage."

The explanation should reveal why WW chose the concept mechanic, structure or viewer experience.

Prefer:
- creative trade-offs;
- strategic reasoning;
- audience consequences;
- identity preservation;
- simplicity used deliberately;
- why one mechanic beats another;
- what the concept avoids.

Avoid:
- listing inputs;
- generic compatibility statements;
- generic praise;
- repeating "this fits";
- repeating "this aligns";
- repeating "this suits";
- repeating "because you selected";
- merely naming the audience stage.

The artist should learn one useful principle about creative strategy by reading this field.

Use 1–2 concise sentences.

WHY CHOSEN FOR ARTIST must be meaningfully different from WHY THIS WORKS.

WHY CHOSEN FOR ARTIST = why WW selected this direction for this artist.

WHY THIS WORKS = why the resulting content should work on the viewer.

FIELD DIFFERENTIATION

Summary explains the finished post at a glance.

Viewer Experience explains what the audience experiences.

Concept explains the central creative mechanism.

Execution explains how to produce it.

Why Chosen for Artist explains why WW selected it for this artist.

Do not return lightly reworded versions of the same sentence across these fields.

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
      "summary": "One plain-language sentence of 12–22 words that helps the artist picture the finished post immediately.",
"viewerExperience": "One concise sentence explaining what the viewer sees, anticipates or feels as the post unfolds.",
"whyChosenForArtist": "One or two concise sentences explaining why this idea fits this specific artist, their identity and verified Creative Reality.",
      "hook": "A first spoken line or scroll-stopping opening phrase. It must NOT repeat the title wording.",
"onScreenText": "Short text overlay for the video. Must be different from the hook and must express the approved Attention Gene and concept psychology.",
"concept": "Exactly one concise sentence of 12–24 words, with a hard maximum of 30 words. State only the central creative premise, transformation, contrast, reveal or payoff. Do not include filming, camera, lighting, editing, text-placement or production instructions.",
"execution": "Direct practical instructions for producing the approved concept with verified resources. Explain the minimum filming sequence, framing, movement, music timing, text placement and simple editing. Do not repeat, paraphrase or re-explain the concept. For Camera Roll / Slideshow, each execution array item must represent exactly
one slide and use this format:

"Slide 1 — Visual: [direction] | Text: [exact example text] | Purpose: [role] | Transition: [optional guidance]"

Do not return general slideshow instructions as execution items. ",
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
- Audience stage: ${audienceStage || 'Not specified'}
- Selected content types: ${allowedBadgeTypes.join(', ')}

Creator behaviour:

- Camera confidence: ${cameraConfidence}
- Speaking confidence: ${speakingConfidence}
- Performance confidence: ${performanceConfidence}
- Editing confidence: ${editingConfidence}
- Production style: ${
  safeProductionStyles.length
    ? safeProductionStyles.join(', ')
    : 'Not specified'
}

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

ARTIST CONTEXT

${contextBlock}

${artistTypeRules}

${audienceStageGuidance}

${creatorBehaviourGuidance}

${structuredCreativeRealityGuidance}

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

${structuredCreativeRealityGuidance}

CONSTRAINT TRANSFORMATION

Treat every verified constraint as a design ingredient.

Examples:

Limited time
→ one strong visual beat, one repeatable setup or one short sequence

Works alone
→ fixed phone, first-person framing, screen recording, controlled movement,
object-led execution or self-filmed shots

Low editing confidence
→ one take, slideshow, static composition, native text or two to three cuts

Faceless creator
→ hands, silhouette, back-of-head framing, screens, objects, environment,
shadows or first-person perspective

No existing footage
→ create something filmable now rather than referring to archive material

Do not remove, reinterpret or work around a hard constraint.

Transform the limitation without inventing a new resource.

Bad:
"Film a cinematic outdoor sequence."

Good:
"Film a close-up phone video at your desk using text on screen, hands, notebook shots, or room details."

Every idea should respect the artist's available time, confidence, location, equipment and energy.

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
  releaseContext,
  ideaDepth,
  contextSource,
  campaignContext,
  releaseStrategyContext,
  contentTypes: allowedBadgeTypes,
  hasLyrics,
  cameraConfidence,
  speakingConfidence,
  performanceConfidence,
  existingFootage,
  worksAlone,
  locations,
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
          ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal, hasLyrics, cameraConfidence, speakingConfidence, performanceConfidence, existingFootage, worksAlone, locations }),
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
          ...fallbackCalendar({ startDate, totalSlots, platforms, artistName, goal, hasLyrics, cameraConfidence, speakingConfidence, performanceConfidence, existingFootage, worksAlone, locations }),
          _fallback: true,
          _fallbackReason: 'items_not_array',
        },
        { status: 200 }
      )
    }

    

const allowedBadgeSet = new Set(allowedBadgeTypes)

parsed.items = parsed.items.filter(item => {
  const corrupted = itemContainsLeakedJson(item)

  if (corrupted) {
    console.error(
      '[calendar-api] rejected item containing leaked JSON:',
      item?.title || 'Untitled item'
    )
  }

  return !corrupted
})

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
   const candidateItems: CalendarItem[] = (parsed.items as CalendarItem[])
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

   const title = safeString(rawItem.title).trim() || `Idea ${index + 1}`

const concept =
  safeString(rawItem.concept).trim() ||
  safeString(rawItem.idea).trim()

const execution =
  safeString(rawItem.execution).trim()



  const summary =
  safeString(rawItem.summary).trim() ||
  concept

const viewerExperience =
  safeString(rawItem.viewerExperience).trim() ||
  'The viewer follows one clear progression before the concept reaches its payoff.'

const whyChosenForArtist =
  safeString(rawItem.whyChosenForArtist).trim() ||
  'This idea fits the selected content style and the artist’s confirmed Creative Reality.'

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

  attentionStrategy:
    safeString(rawItem.attentionStrategy).trim(),

  attentionReason:
    safeString(rawItem.attentionReason).trim(),

  summary,
  viewerExperience,

  onScreenText: safeOnScreenText,
  hook,
  concept,
  execution,

  caption:
    safeString(rawItem.suggested_caption).trim(),

  cta,

  why: why.length
    ? why
    : ['This gives new listeners a clear reason to connect with the song.'],

  whyChosenForArtist,
},
    }
  })
  .filter(item => {
    const hasTitle = !!item.title?.trim()

    const concept = item.structured?.concept
const execution = item.structured?.execution

const hasValidConcept = isValidConcept(concept)
const hasExecution = !!execution?.trim()

if (!hasTitle || !hasValidConcept || !hasExecution) {
  return false
}

    if (violatesArtistType(item as any, artistType, genre)) return false

    return true
  })





const trimmedItems = candidateItems.slice(0, totalSlots)


let completedItems: CalendarItem[] = [...trimmedItems]

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

CONCEPT AND EXECUTION

- concept must be exactly one concise sentence;
- concept should contain 12–24 words;
- concept must never exceed 30 words;
- concept should state only the central creative premise;
- concept must not contain filming or production instructions;
- concept must not use words such as film, record, place, position, frame,
  shoot, capture, overlay or edit;
- execution must explain the practical production process;
- execution must not repeat or paraphrase the concept;
- both fields are mandatory;
- never return JSON syntax inside any string field.

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
        replacementParsed.items = replacementParsed.items.filter(
  item => !itemContainsLeakedJson(item)
)
        const replacementItems: CalendarItem[] = (
  replacementParsed.items as CalendarItem[]
)
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
            const concept =
  safeString(rawItem.concept).trim() ||
  safeString(rawItem.idea).trim()

const execution =
  safeString(rawItem.execution).trim()

  const summary =
  safeString(rawItem.summary).trim() ||
  concept

const viewerExperience =
  safeString(rawItem.viewerExperience).trim() ||
  'The viewer follows one clear progression before the concept reaches its payoff.'

const whyChosenForArtist =
  safeString(rawItem.whyChosenForArtist).trim() ||
  'This idea fits the selected content style and the artist’s confirmed Creative Reality.'

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

  attentionStrategy:
    safeString(rawItem.attentionStrategy).trim(),

  attentionReason:
    safeString(rawItem.attentionReason).trim(),

  summary,
  viewerExperience,

  onScreenText: safeOnScreenText,
  hook,
  concept,
  execution,

  caption:
    safeString(rawItem.suggested_caption).trim(),

  cta,

  why: why.length
    ? why
    : ['This gives new listeners a clear reason to connect with the song.'],

  whyChosenForArtist,
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
      releaseContext,
      ideaDepth,
      contextSource,
      campaignContext,
      releaseStrategyContext,
      usedTitles: completedItems.map(i => i.title),
      usedConcepts: completedItems.map(i => i.idea),
      hasLyrics,
      cameraConfidence,
speakingConfidence,
performanceConfidence,
locations: safeLocations,
worksAlone,
existingFootage,
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
        releaseContext,
        ideaDepth,
        contextSource,
        campaignContext,
        releaseStrategyContext,
        hasLyrics,
        cameraConfidence,
  speakingConfidence,
  performanceConfidence,
  existingFootage,
  worksAlone,
  locations,
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