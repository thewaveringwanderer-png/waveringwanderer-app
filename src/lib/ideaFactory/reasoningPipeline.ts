export function formatIdeaFactoryReasoningPipelineForPrompt() {
  return `
WW IDEA FACTORY REASONING PIPELINE

Complete the following stages internally before writing any final ideas.

STAGE 1 — READ THE ARTIST'S TERRAIN

Establish what is genuinely possible.

Identify:

- available time
- available locations
- available equipment
- whether the artist works alone
- whether the artist shows their face
- confidence speaking to camera
- confidence performing
- editing ability and appetite
- budget
- access to studio, live footage or collaborators
- explicit restrictions

Creative Reality creates the hard boundary for every later decision.

Do not continue with any execution that contradicts this terrain.

STAGE 2 — INFER THE CREATIVE FINGERPRINT

Use the Creator Genome and all available evidence to infer:

- Primary Creator Gene
- Secondary Creator Gene
- up to two Supporting Creator Genes
- filming habits
- performance comfort
- editing style
- recurring assets and environments
- natural creative strengths
- preferred energy
- behaviours and executions to avoid

Explicit user choices outweigh inference.

The Creator Genome interprets the artist. It never overrules them.

STAGE 3 — EXTRACT THE ARTIST-SPECIFIC SOURCE MATERIAL

When Identity Kit context exists, identify:

- lived experiences
- identity anchors
- contradictions
- beliefs and philosophy
- recurring themes
- listener transformation
- audience desires and frustrations
- visual world
- Creative DNA
- content pillars
- brand guardrails

When Identity Kit context does not exist, use the strongest specific evidence from the artist brief.

Do not invent identity details.

STAGE 4 — DEFINE THE JOB OF THE BATCH

Identify:

- current goal
- audience stage
- focus mode
- campaign or release context
- desired content energy
- platform
- selected content styles

Determine what the ideas need to achieve.

Examples:

- discovery
- connection
- credibility
- community
- release momentum
- catalogue revival
- audience conversion
- deeper artist recognition

STAGE 5 — CHOOSE THE CONTENT FORMAT

For each idea, choose a format inside the artist's explicitly selected content-style territory.

The format must:

- fit Creative Reality
- fit the Creative Fingerprint
- support the current goal
- suit the platform
- use available assets
- feel natural for the artist to repeat

Do not choose a format merely to create superficial variety.

STAGE 6 — CHOOSE THE ATTENTION GENE

Choose one primary Attention Gene for each idea.

Use it to determine:

- why the viewer should stop
- what the viewer should feel
- how the hook should work
- how the on-screen text should work
- what type of CTA is appropriate

The Attention Gene must shape the whole idea, not only the opening line.

STAGE 7 — DESIGN THE CONCEPT MECHANIC

Choose how the viewer experiences the idea.

The mechanic must fit:

- the chosen format
- Creative Reality
- the Creative Fingerprint
- the artist's confidence
- the platform
- the Attention Gene

Do not begin with a broad topic.

Design an actual post with a clear viewer experience.

STAGE 8 — ADD SPECIFICITY

Every concept must contain at least one tangible element:

- a real moment
- a location
- an object
- a visual action
- a sound
- a lyric supplied by the artist
- a piece of existing footage
- a recognisable environment
- a specific audience interaction

If the concept remains abstract, rewrite it.

STAGE 9 — DESIGN THE EXECUTION

The execution must visibly reflect:

- filming habits
- location
- framing
- movement
- delivery style
- performance comfort
- pacing
- editing complexity
- recurring assets
- available time and resources

The artist should be able to understand exactly what to film.

Do not require resources the artist has not said they possess.

STAGE 10 — WRITE THE COMMUNICATION LAYER

Write:

- title
- hook
- on-screen text
- caption
- CTA
- why this works

The hook and on-screen text must perform different jobs.

On-screen text is the billboard.

The hook is the conversation.

The CTA must match the idea's psychology rather than defaulting to generic promotion.

STAGE 11 — BATCH DIFFERENTIATION

Compare all ideas before returning them.

Vary:

- emotional territory
- Attention Gene
- concept mechanic
- execution pattern
- tangible detail
- viewer experience

Do not create the same post with slightly different wording.

Do not sacrifice artist fit merely to force variety.

STAGE 12 — FINAL VALIDATION

Silently validate every idea.

REALITY TEST

Could this artist genuinely create it tomorrow?

If no, simplify or replace it.

CREATIVE FINGERPRINT TEST

Does it feel natural for this specific creator?

If no, redesign it.

IDENTITY TEST

Does it contain artist-specific source material where available?

If no, make it more personal.

FORMAT TEST

Does the output content type match the actual execution and remain inside the selected styles?

If no, correct it.

MUSIC TEST

Does the idea lead back to the song, sound, performance, release or artist world?

If no, strengthen the music connection.

DIFFERENTIATION TEST

Could another artist with a different Creative Fingerprint receive essentially the same execution?

If yes, personalise it further.

Never output this internal reasoning, inferred fingerprint, gene selection process or validation scores.
`.trim()
}