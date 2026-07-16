export type CreatorGene = {
  id: string
  name: string
  description: string
  indicators: string[]
  strengths: string[]
  risks: string[]
  bestFormats: string[]
  avoid: string[]
  coaching: string
}

export const CREATOR_GENOME: CreatorGene[] = [

    {
  id: 'performer',

  name: 'Performer',

  description:
    'Feels most natural communicating through music itself rather than explanation.',

  indicators: [
    'Enjoys performing songs',
    'Comfortable on camera while performing',
    'Lets music carry emotion',
    'Prefers showing rather than telling',
  ],

  strengths: [
    'Performance',
    'Emotion',
    'Presence',
    'Authenticity',
  ],

  risks: [
    'May avoid deeper storytelling',
    'Can rely too heavily on performance alone',
  ],

  bestFormats: [
    'Direct Performance',
    'Live Performance',
    'Performance Documentary',
  ],

  avoid: [
    'Long educational monologues',
    'Forced humour',
  ],

  coaching:
    'Let the music do most of the talking. Add just enough context for discovery.',
},

{
  id: 'storyteller',

  name: 'Storyteller',

  description:
    'Naturally connects through stories, emotions and experiences.',

  indicators: [
    'Explains songs',
    'Shares experiences',
    'Reflective personality',
  ],

  strengths: [
    'Connection',
    'Depth',
    'Trust',
  ],

  risks: [
    'Can over-explain',
    'Can become repetitive',
  ],

  bestFormats: [
    'Song Meaning',
    'Talking to Camera',
    'Storytelling',
  ],

  avoid: [
    'Trend chasing',
  ],

  coaching:
    'Use stories to invite people into your world, not to explain every detail.',
},

{
  id: 'visual-builder',

  name: 'Visual Builder',

  description:
    'Creates atmosphere through imagery before words.',

  indicators: [
    'Cinematic footage',
    'Colour',
    'Composition',
    'Locations',
  ],

  strengths: [
    'Mood',
    'Worldbuilding',
    'Aesthetic consistency',
  ],

  risks: [
    'Can become beautiful but forgettable',
  ],

  bestFormats: [
    'Visual Cinematic',
    'Slideshow',
    'Atmospheric Reel',
  ],

  avoid: [
    'Long explanations',
  ],

  coaching:
    'Let visuals lead, but always anchor them to a memorable emotional idea.',
},

{
  id: 'educator',

  name: 'Educator',

  description:
    'Naturally enjoys teaching or sharing knowledge.',

  indicators: [
    'Explains production',
    'Talks about songwriting',
    'Shares process',
  ],

  strengths: [
    'Authority',
    'Trust',
  ],

  risks: [
    'Talking too much before the music.',
  ],

  bestFormats: [
    'Behind the Scenes',
    'Breakdown',
    'Tutorial',
  ],

  avoid: [
    'Pure performance only',
  ],

  coaching:
    'Teach through your music rather than away from it.',
},

{
  id: 'observer',

  name: 'Observer',

  description:
    'Finds relatable moments in everyday life.',

  indicators: [
    'Observational humour',
    'Life moments',
    'Relatable thoughts',
  ],

  strengths: [
    'Relatability',
    'Community',
  ],

  risks: [
    'Can drift away from the music.',
  ],

  bestFormats: [
    'POV',
    'Talking to Camera',
    'Text on Screen',
  ],

  avoid: [
    'Complex cinematic shoots',
  ],

  coaching:
    'Always reconnect observations back to your music.',
},

{
  id: 'experimenter',

  name: 'Experimenter',

  description:
    'Naturally enjoys trying new ideas, unusual concepts and creative risks.',

  indicators: [
    'Frequently experiments with new formats',
    'Enjoys trends as inspiration rather than imitation',
    'Often changes visual style',
    'Comfortable trying unusual ideas',
  ],

  strengths: [
    'Novelty',
    'Originality',
    'Curiosity',
    'Creative confidence',
  ],

  risks: [
    'Can lack consistency',
    'Can chase novelty over identity',
  ],

  bestFormats: [
    'Creative Constraint',
    'Trend Remix',
    'Concept Videos',
  ],

  avoid: [
    'Highly repetitive series',
  ],

  coaching:
    'Experiment widely, but let your identity remain recognisable.',
},

{
  id: 'documentary',

  name: 'Documentary Creator',

  description:
    'Naturally records the creative journey rather than staging content specifically for social media.',

  indicators: [
    'Films real moments',
    'Shares process',
    'Documents studio sessions',
    'Captures progress naturally',
  ],

  strengths: [
    'Authenticity',
    'Trust',
    'Consistency',
  ],

  risks: [
    'May forget to create clear story arcs',
    'Can become too observational',
  ],

  bestFormats: [
    'Behind the Scenes',
    'Studio Diary',
    'Day in the Life',
  ],

  avoid: [
    'Overly scripted performances',
  ],

  coaching:
    "Don't manufacture moments. Help people appreciate the real ones.",
},

{
  id: 'entertainer',

  name: 'Entertainer',

  description:
    'Naturally captures attention through energy, humour and engaging personality.',

  indicators: [
    'Enjoys being on camera',
    'Comfortable improvising',
    'Uses humour naturally',
    'Creates high-energy content',
  ],

  strengths: [
    'Entertainment',
    'Retention',
    'Shareability',
  ],

  risks: [
    'Music can become secondary',
    'Humour can overshadow identity',
  ],

  bestFormats: [
    'Talking to Camera',
    'Comedy',
    'POV',
  ],

  avoid: [
    'Overly serious educational content',
  ],

  coaching:
    'Use entertainment to bring people into your music, not away from it.',
},

{
  id: 'minimalist',

  name: 'Minimalist',

  description:
    'Prefers simple ideas with low production effort and maximum clarity.',

  indicators: [
    'Simple filming setups',
    'Minimal editing',
    'One-location content',
    'Repeatable workflows',
  ],

  strengths: [
    'Consistency',
    'Efficiency',
    'Authenticity',
  ],

  risks: [
    'Can become visually repetitive',
    'May avoid creative experimentation',
  ],

  bestFormats: [
    'Direct Performance',
    'Text on Screen',
    'Camera Roll',
  ],

  avoid: [
    'Complex multi-location shoots',
  ],

  coaching:
    'Simple does not mean boring. Repeatable systems create momentum.',
},

{
  id: 'community-builder',

  name: 'Community Builder',

  description:
    'Naturally focuses on conversations, relationships and making listeners feel included.',

  indicators: [
    'Replies to comments',
    'Speaks directly to fans',
    'Encourages interaction',
    'Builds belonging',
  ],

  strengths: [
    'Community',
    'Loyalty',
    'Audience connection',
  ],

  risks: [
    'Can neglect showcasing the music itself',
    'May prioritise conversation over discovery',
  ],

  bestFormats: [
    'Talking to Camera',
    'Fan Questions',
    'Community Updates',
  ],

  avoid: [
    'Highly polished but emotionally distant content',
  ],

  coaching:
    'Invite people into your journey, but always let the music remain the destination.',
},

]

export type InferredCreativeFingerprint = {
  primaryGene: string
  secondaryGene: string
  supportingGenes: string[]
  filmingHabits: string[]
  performanceComfort: string[]
  editingStyle: string[]
  recurringAssets: string[]
  naturalStrengths: string[]
  preferredEnergy: string[]
  avoid: string[]
  reasoningSummary: string
}

export function formatCreatorGenomeForPrompt() {
  return CREATOR_GENOME.map((gene) => {
    return `
CREATOR GENE ID: ${gene.id}
CREATOR GENE NAME: ${gene.name}

DESCRIPTION:
${gene.description}

INDICATORS:
${gene.indicators.map((item) => `- ${item}`).join('\n')}

STRENGTHS:
${gene.strengths.map((item) => `- ${item}`).join('\n')}

RISKS:
${gene.risks.map((item) => `- ${item}`).join('\n')}

BEST-SUITED FORMATS:
${gene.bestFormats.map((item) => `- ${item}`).join('\n')}

AVOID:
${gene.avoid.map((item) => `- ${item}`).join('\n')}

COACHING PRINCIPLE:
${gene.coaching}
`.trim()
  }).join('\n\n')
}

export function formatCreatorInferenceEngineForPrompt() {
  return `
CREATOR GENOME INFERENCE ENGINE

The Creator Genome describes distinct ways artists naturally create and communicate.

Before generating any ideas, infer a temporary Creative Fingerprint using all available evidence.

AVAILABLE EVIDENCE

- explicitly selected content styles
- performance and creation style
- Creative Reality
- artist type
- genre
- audience
- goal
- tone and content energy
- Identity Kit context
- recurring themes
- visual world
- stated strengths, dislikes and limitations

INFER THIS INTERNAL CREATIVE FINGERPRINT

Build this internal object before generating ideas:

{
  "primaryGene": "one Creator Gene ID",
  "secondaryGene": "one Creator Gene ID",
  "supportingGenes": ["up to two Creator Gene IDs"],
  "filmingHabits": ["specific habits inferred from evidence"],
  "performanceComfort": ["what the artist is comfortable doing"],
  "editingStyle": ["likely editing preferences"],
  "recurringAssets": ["locations, objects, footage or environments available"],
  "naturalStrengths": ["creative behaviours the artist naturally does well"],
  "preferredEnergy": ["natural emotional and pacing style"],
  "avoid": ["formats, behaviours or executions that conflict with the artist"],
  "reasoningSummary": "one concise internal explanation"
}

Do not return this object to the user.

Use it as temporary working memory for the rest of the generation.

EVIDENCE PRIORITY

1. Explicit content-style selections
2. Hard Creative Reality constraints
3. The artist's own description of how they create
4. Explicit confidence and comfort statements
5. Identity Kit evidence
6. Creator Genome inference
7. Genre-based assumptions

SELECTED STYLE ADAPTATION RULE

Explicitly selected content styles define the allowed territory, but they do not override confidence, time, equipment, location or production constraints.

When a selected style conflicts with part of Creative Reality, preserve the style while adapting its execution.

Examples:

- Direct Performance + low camera confidence:
  use side profile, silhouette, cropped framing, seated delivery, partial face, distant framing or short low-pressure takes.

- Visual / Cinematic + ten minutes:
  use one location, one visual motif, one lighting choice and minimal editing.

- Talking to Camera + low confidence:
  use voiceover, text-supported delivery, off-centre framing or a very short scripted sentence.

- Slideshow + no existing footage:
  use a small number of available images rather than assuming a large archive.

Never discard an explicitly selected style solely because execution must be simplified.

Never use the most demanding version of a selected style when Creative Reality requires a lighter version.

INFERENCE RULES

- Base the fingerprint only on available evidence.
- Never invent equipment, locations, skills, preferences or confidence.
- The Creator Genome interprets the artist. It never overrules them.
- Creative Reality defines the hard physical boundaries.
- Explicit content selections define the permitted format territory.
- The artist's own creation description is the strongest behavioural evidence.
- Identity Kit provides artistic and emotional context.
- Do not mistake genre for creator behaviour.
- Do not treat low resources as a personality.
- Do not default every artist to Performer or Storyteller.
- The Primary Gene should represent the strongest natural creation behaviour.
- The Secondary Gene should complement rather than repeat the Primary Gene.
- Only infer Supporting Genes where meaningful evidence exists.

USING THE CREATIVE FINGERPRINT

The Creative Fingerprint must influence:

- concept choice
- filming behaviour
- delivery style
- location
- pacing
- editing complexity
- recurring objects and assets
- performance comfort
- emotional energy
- execution detail

Two artists with the same genre, goal and selected format should still receive meaningfully different executions when their Creative Fingerprints differ.

CREATIVE FINGERPRINT VALIDATION

Before returning each idea, silently ask:

- Does this feel natural for this specific artist?
- Does it match the Primary Creator Gene?
- Does the Secondary Gene improve the idea without being forced?
- Does it respect explicit content-style selections?
- Does it fit the artist's filming habits?
- Does it match their performance comfort?
- Does it fit their likely editing style?
- Does it use their natural strengths?
- Does it avoid behaviours they ruled out?
- Would an artist with a different fingerprint receive a meaningfully different execution?
- Would this artist realistically enjoy making it?

If the idea fights the Creative Fingerprint, redesign it.

If it contradicts Creative Reality or an explicit user instruction, replace it completely.

Do not expose the Creative Fingerprint, genes, confidence estimates or internal reasoning in the JSON response.
`.trim()
}