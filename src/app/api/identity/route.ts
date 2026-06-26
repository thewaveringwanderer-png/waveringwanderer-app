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
  artistPhilosophy?: string
recurringThemes?: string
listenerEffect?: string
uniqueQualities?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function buildIdentityPreview(full: any) {
  return {
    core: {
      brandEssence: full?.core?.brandEssence ?? '',
      positioning: full?.core?.positioning ?? '',
      manifesto: full?.core?.manifesto ?? '',
    },
    strategy: {
  usp: full?.strategy?.usp ?? '',
  brandMessage: full?.strategy?.brandMessage ?? '',
  listenerIdentity: Array.isArray(full?.strategy?.listenerIdentity)
    ? full.strategy.listenerIdentity.slice(0, 3)
    : [],
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
    creativeDNA: Array.isArray(full?.creativeDNA)
  ? full.creativeDNA.slice(0, 6).map((item: any) => ({
      title: item?.title ?? '',
      meaning: item?.meaning ?? '',
    }))
  : [],
    identityRules: Array.isArray(full?.identityRules)
  ? full.identityRules.slice(0, 9).map((rule: any) =>
      typeof rule === 'string'
        ? {
            section: '',
            principle: rule,
            rationale: '',
          }
        : {
            section: rule?.section ?? '',
            principle: rule?.principle ?? '',
            rationale: rule?.rationale ?? '',
          }
    )
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
  artistPhilosophy = '',
recurringThemes = '',
listenerEffect = '',
uniqueQualities = '',

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

  


const tier = ((profileRow?.tier as any) || 'free') as 'free' | 'idea_factory' | 'creator' 
const usage: Record<string, any> = (profileRow?.usage as any) || {}
const used = Number(usage.identity_generate_uses || 0)
const isDevBypass = false
if (tier === 'idea_factory') {
  return NextResponse.json(
    {
      error: 'CREATOR_ONLY',
      message: 'Identity Kit is part of the full Creator system.',
    },
    { status: 403 }
  )
}


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
        result: buildIdentityPreview(stubResult({
  artistName,
  genre,
  influences,
  brandWords,
  audience,
  direction,
  artistPhilosophy,
  recurringThemes,
  listenerEffect,
  uniqueQualities,
})),
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
Avoid polished AI-branding phrases such as:
- "voice of a generation"
- "transforming hardship into art"
- "authentic storytelling"
- "raw emotion"
- "unique sound"
- "deeply personal"
- "resonate deeply"
- "powerful voice"

Write like a sharp artist strategist, not a generic brand copywriter.
Focus on positioning, psychology, narrative cohesion, and usable brand constraints.
Return valid JSON only.

The output should teach the artist how to use their experiences, themes, philosophy, and unique qualities.

The artist should leave with a clearer understanding of:
- what they own
- why it matters
- how to communicate it
- how to make it visually recognisable
- how to keep it consistent without becoming repetitive

IMPORTANT STYLE RULES:

INTERNAL REASONING PIPELINE

Before generating the Identity Kit, complete these stages internally.

Stage 1 — Identity Extraction
Identify:
- identity anchors
- specific experiences
- beliefs
- contradictions
- motivations
- worldview
- influence fingerprint
- audience psychology
- emotional territory

Do not output this reasoning.

Stage 2 — Strategic Interpretation
For every major finding, ask: "So what?"

Determine:
- brand implications
- visual implications
- content implications
- audience implications
- positioning implications

Do not output this reasoning.

Stage 3 — Section Generation
Generate each section independently.

Complete one section before moving onto the next.

Each section has a unique role.

Stage 4 — Cross-reference
Compare every section.

Check:
- consistency
- contradictions
- repeated themes
- repeated language
- missing source material

Rewrite where necessary.

Stage 5 — Creative Director Review

Before returning the final JSON, critique your own work as if you were reviewing another strategist's identity system.

Do not immediately accept the first version.

Challenge every section.

Review the Identity Kit using the following questions.

IDENTITY

Would this identity only fit this artist?

Could another artist receive 80% of these outputs?

If yes, rewrite until the identity feels unmistakably personal.

SECTION DIFFERENTIATION

If every heading was removed, could each section still be recognised?

Snapshot should not sound like Positioning.

Positioning should not sound like the USP.

USP should not sound like the Manifesto.

Audience should not sound like Listener Identity.

Content should not sound like Audience.

Every section must reveal new strategic value.

EXPERIENCE TEST

Have the artist's actual experiences remained visible?

Or have they been replaced by abstract ideas?

Prefer:

"Working night shifts."

over

"Resilience."

Prefer:

"Getting knocked back repeatedly."

over

"Perseverance."

The specific experience should remain recognisable.

WORLDVIEW TEST

Do the worldview statements actually sound like opinions about life?

Or are they simply positive values?

Reject safe statements.

Prefer observations over advice.

POSITIONING TEST

Does the positioning describe the market lane?

Or does it simply describe the artist?

USP TEST

Could this USP belong to 100 artists?

If yes, rewrite it.

The USP should reveal an angle the artist may not have recognised.

AUDIENCE TEST

Does the audience feel like real people?

Or simply fans of meaningful music?

Identify how they think.

Not just what they like.

VISUAL TEST

Could a photographer build a recognisable visual identity from this alone?

If not, add more specificity.

CONTENT TEST

Would these pillars become recognisable recurring series?

Or are they simply themes?

Would fans recognise them after several months?

If not, redesign them.

CREATIVE CONSTITUTION TEST

Would these principles genuinely help the artist make difficult creative decisions?

Would they still apply five years from now?

Could these principles belong to another artist?

If yes, rewrite them.

Every principle should emerge from:

- lived experiences
- signature assets
- worldview
- creative tensions

These should feel like creative laws rather than inspirational advice.

FINAL TEST

After reading the whole document ask:

"What would surprise the artist most?"

"What would make them say..."

"I hadn't thought about myself like that before."

Prioritise insight over description.

Reveal patterns.

Do not simply organise information.

Create strategic clarity.

Only after every test has passed should the final JSON be returned.

FIRST DRAFT RULE

Treat your first internal draft as incomplete.

Before returning the final Identity Kit, improve it.

Strengthen weak wording.

Replace generic observations with more specific ones.

Replace summaries with interpretations.

Replace descriptions with strategic implications.

Assume your first draft is only 70% of the final quality.

The final JSON should represent the improved second draft.


INTERNAL STRATEGIC PROFILE

Create an internal strategic profile before writing.

Do not output it.

Use it only for reasoning.

Include:
- identityAnchors
- worldview
- hiddenBeliefs
- contradictions
- audienceNeeds
- influenceFingerprint
- strategicImplications
- sectionPurpose

Use this internal profile to make the final Identity Kit coherent without making every section sound the same.

EVIDENCE-BASED INFERENCE

Every major inference must be supported by something in the artist's inputs.

Before using an inferred idea, internally check:

- What input supports this?
- Is this directly stated, strongly implied, or weakly implied?
- Am I expanding the artist's details or inventing new ones?
- Is there a more specific interpretation available?

Use bold interpretations only when they are supported.

Do not invent trauma, background, beliefs, audience pain points, cultural identity, or life circumstances that the artist did not provide.

If an input is vague, create a useful but cautious interpretation.

The best output should feel insightful, not psychic.

QUALITY STANDARDS

No repetition

Different section roles

No clichés

No AI language

No generic emotional defaults

Respect lived experiences

Don't over-abstract

Reveal new information every section

SECTION ROLE TEST

Before finalising the JSON, review every major section as if the heading was removed.

The reader should still be able to tell what section it belongs to by the function of the writing.

Each section must have a distinct job:

- snapshot = fast strategic summary
- strategicFoundations = hidden beliefs, tensions, worldview and source material
- core.brandEssence = condensed identity
- core.positioning = the market lane the artist owns
- core.manifesto = first-person conviction
- strategy.usp = competitive difference
- strategy.brandMessage = public-facing promise
- strategy.listenerIdentity = how listeners see themselves through the artist
- audience = listener psychology, frustrations, desires and behaviours
- tone = how the artist should speak
- visuals = how the artist should look and feel
- content = repeatable creative territories and formats
- identityRules = Creative Constitution and permanent creative principles

Do not allow multiple sections to become emotional summaries.

Bad:
Positioning, manifesto, USP, audience promise and listener transformation all saying the artist helps people feel understood.

Good:
Positioning explains the artist's lane.
Manifesto states what the artist believes.
USP explains what makes them harder to replace.
Audience explains who needs this and why.
Listener transformation explains what changes for the listener.
Content pillars explain what the artist repeatedly talks about.
Visuals translate the identity into recognisable images.

FINAL DIFFERENTIATION CHECK

Before returning JSON:

1. Identify repeated emotional words across sections.
2. If the same emotional idea appears in more than 2 major sections, rewrite the weaker uses.
3. Replace repeated generic emotion with a different supported angle:
   - lived experience
   - worldview
   - contradiction
   - audience frustration
   - influence fingerprint
   - visual metaphor
   - content behaviour
   - market difference
4. Make sure every section reveals new information.
5. The final kit should not feel like one paragraph rewritten under different headings.
If removing every heading would make two sections difficult to distinguish, rewrite them until each has a unique purpose.


Analyse the artist's influences.

Identify:

- Shared lyrical traits
- Shared storytelling approaches
- Shared themes
- Shared emotional qualities
- Shared audience characteristics

Do not copy the influences.

Instead identify the patterns that connect them.

Allow these patterns to subtly shape:

- Manifesto
- Positioning
- Tone of voice
- Content pillars
- Audience psychology
- Expand the artist's inputs into sharper strategic ideas.
- Do not simply reword what they typed.
- Every section should reveal a new insight.

You are building an ARTIST IDENTITY SYSTEM, not just a description.

The user inputs are raw material, not final strategy.


Use the artist's actual details heavily:
- their genre
- their influences
- their philosophy
- their recurring themes
- their desired listener effect
- their unique qualities

The output should feel impossible to reuse for another artist.

If the artist mentions specific influences, use them to infer creative direction, but do not copy those artists directly.

Do not merely restate the artist's inputs.

Preserve the underlying experiences, philosophies, relationships, environments and themes while expanding them into stronger strategic language.
Interpret the inputs and expand them into sharper brand thinking.

For every section, ask:
- What does this mean strategically?
- How can the artist use this to become more recognisable?
- What angle does this reveal that the artist may not have noticed?
- How does this help with visuals, messaging, content, audience connection, or positioning?




EXPERIENCE INTERPRETATION

Before identifying themes, first identify the artist's specific lived experiences.

Interpret experiences rather than summarising them.

Ask:

- What happened?
- What did that teach them?
- How did it change how they see the world?
- What emotional territory did it create?
- What recurring beliefs came from it?

Do not replace experiences with abstract labels.

Bad:

Working night shifts
↓

Sacrifice

Good:

Working night shifts
↓

Seeing a different side of society after dark.
Developing discipline through routine.
Finding creativity when most people were asleep.

The experience should remain visible.

Themes should explain experiences, not replace them.

Always preserve both:

Specific reality
+
Universal meaning.


EXPERIENCE DOMINANCE

The artist's lived experiences, philosophy, recurring themes, desired listener effect and unique qualities are the primary source of differentiation.

Genre and influences provide context.

Experiences provide identity.

Do not replace lived experiences with generic concepts such as resilience, authenticity, growth, self-discovery, clarity or introspection.

When analysing artist inputs, identify:

1. Specific experiences
2. Specific relationships
3. Specific environments
4. Specific life circumstances
5. Specific perspectives

These should remain visible throughout the identity kit.

Do not replace all specific details with abstract concepts.

Abstract themes should support the identity, not replace it.

The strongest artist identities combine:

- Specific lived experiences
- Universal emotional themes

Example:

Specific:
"Growing up in a small town"

Universal:
"Feeling trapped"

Specific:
"Working night shifts"

Universal:
"Sacrifice"

Both levels should appear throughout the kit.

Do not reduce it to:
- growth
- maturity
- responsibility

Surviving alone should remain surviving alone.

Do not reduce it to:
- resilience
- independence
- perseverance

Specific experiences create identity.

Abstract concepts support identity.

The final kit should contain both.



IDENTITY ANCHORS

Before generating any strategic analysis:

infer:
 Hidden beliefs
- Identity drivers
- Internal contradictions
- Emotional needs
- Core motivations
- Frustrations with culture or the industry

Do not invent these.

They must be supported by the artist's inputs.

Use these findings selectively across:
- positioning
- manifesto
- USP
- audience psychology
- content pillars

Do not force every finding into every section.


Extract 5 identity anchors.

Identity anchors must be taken directly from the artist's inputs.

Identity anchors can include:

- experiences
- philosophies
- recurring themes
- ambitions
- relationships
- environments
- struggles
- contradictions

Do not convert anchors into abstract concepts.

Bad:

Experience:
"getting knocked back repeatedly"

Anchor:
"resilience"

Good:

Anchor:
"getting knocked back repeatedly"

Bad:

Theme:
"unity"

Anchor:
"community"

Good:

Anchor:
"unity"

Store these anchors.

SIGNATURE ASSETS

Before generating any section, identify the artist's most ownable identity assets.

These are not themes.

They are recurring ingredients that make this artist recognisable.

They should come directly from the artist's lived experiences, environment, interests, creative process, ambitions, contradictions and worldview.

Examples include:

- unexpected fatherhood
- growing up in London
- night shifts
- anime philosophy
- notebooks full of lyrics
- underground venues
- faith
- skate culture
- engineering mindset
- photography
- martial arts
- solitude
- obsession with language

Avoid generic assets such as:

- struggle
- resilience
- hope
- authenticity
- motivation

Those are themes.

Instead identify tangible identity ingredients.

Every Signature Asset should be:

• specific
• memorable
• difficult to copy
• repeatedly usable

Before writing each section ask:

Which Signature Assets naturally belong here?

The final Identity Kit should repeatedly reference these assets in different ways without becoming repetitive.

These assets should influence:

- Snapshot
- Manifesto
- Positioning
- USP
- Audience
- Visual System
- Content System
- Identity Rules

The best Identity Kits feel as though every section was built from the same set of identity ingredients.

SIGNATURE ASSET DISTRIBUTION

Do not rely on the same Signature Asset in every section.

Distribute them naturally.

For example:

One asset may shape the Visual System.

Another may shape the Manifesto.

Another may shape the Content System.

Another may shape the Audience.

Collectively they should create a complete identity rather than repeatedly emphasising one idea.

The goal is breadth without losing coherence.

CREATIVE DNA HIERARCHY

The artist's identity should be built in this order.

Experiences

↓

Identity Anchors

↓

Signature Assets

↓

Creative DNA

↓

Worldview

↓

Strategic Implications

↓

Every remaining section.

Creative DNA is the bridge between lived experiences and long-term artistic identity.

The Constitution should protect the DNA.

The Positioning should communicate the DNA.

The Visual System should express the DNA.

The Content System should repeatedly reinforce the DNA.

Nothing should contradict the DNA.

WORLDVIEW EXTRACTION

Look beneath what the artist says and identify what they believe.

Worldview should reveal the artist's opinions about life, culture, people, ambition, creativity, struggle, love, belonging, success, or the industry.

Do not turn worldview into vague values.

Before writing any section, identify the artist's worldview.

- What repeatedly frustrates this artist?
- What do they believe most people misunderstand?
- What lesson keeps appearing in their life?
- What truth would they defend in an argument?
- What are they pushing against culturally?
- What do they want listeners to stop believing?

Do not generate safe answers.

These findings should shape:

- coreBeliefs
- positioning
- manifesto
- USP
- audience psychology

A strong belief should sound like a statement about reality.

Weak:
"Be yourself."

Strong:
"People spend years trying to become someone instead of understanding who they already are."

Prefer specific worldview statements over personal values.

Use identity anchors as source material, not repeated slogans.

At least 3 of the 5 anchors should influence the final kit, but they should not appear in every section.

Each major section should use a different implication of the anchors:
- positioning = market lane
- manifesto = belief
- USP = competitive difference
- audience = listener need
- visuals = aesthetic translation
- content = repeatable creative territory

Every major section should build from an identity anchor but reveal a different implication of that anchor.

The output must define how the artist should:
- look
- sound
- communicate
- create content

The goal is to create constraints that make the artist consistent and recognisable.

---

STRATEGIC IMPLICATIONS

For every important finding ask:

"So what?"

Translate discoveries into decisions.

For every identity anchor determine:

• positioning implication
• audience implication
• visual implication
• messaging implication
• content implication
• commercial implication

Every important discovery should create multiple strategic consequences.

Do not output these.

Use them to make later sections feel connected without repeating the same wording.

POSITIONING

Positioning answers one question.

Why should this artist exist in today's music landscape?

Do not describe the artist.

Describe the gap they occupy.

This should explain:

What space do they own?

What conversations do they naturally lead?

What makes them culturally relevant?

Positioning should describe the lane.

Not the person.

Good positioning makes competitors feel irrelevant rather than inferior.

USP

USP answers one question.

Why would someone choose this artist instead of another artist in the same space?

Focus on competitive differentiation.

Not personality.

Not emotions.

Not philosophy.

Think like a strategist.

Examples of differentiation:

Perspective

Creative process

Combination of influences

Recurring themes

Consistency

Communication style

Avoid describing quality.

Describe replaceability.

A strong USP should make another artist difficult to substitute.

BRAND MESSAGE

Brand Message answers one question.

What promise does this artist make every time someone encounters their work?

This is external.

Not internal.

Do not describe who the artist is.

Describe what listeners can expect.

This should feel usable on:

website

press kit

social bio

Spotify

campaigns

captions

It should remain consistent even as songs change.

---

VISUAL SYSTEM:

Define:
- color palette (primary, secondary, accent)
- lighting style (e.g. dim, natural, cinematic)
- environment (e.g. bedroom, city, abstract)
- framing (close-up, wide, POV)
- texture (grainy, clean, analogue, digital)
- symbolism (recurring objects or motifs)

Avoid repeating the same visual idea across multiple categories.

For example:
- Do not use "city streets" in both environment and symbolism.
- Do not make every visual choice dark, gritty, urban, or moody.
- Each visual category should add a different layer.

Environment = where the artist appears.
Framing = how the camera sees them.
Texture = how the image feels.
Symbolism = recurring objects, motifs, or visual metaphors.
Lighting = the emotional atmosphere.

---

CONTENT PILLARS

Do not generate broad content themes.

Instead design 3 recurring creative franchises that this artist could realistically become known for.

Each pillar should feel like an original series, not a topic.

Think like a creative director designing repeatable IP.

Every pillar should have:

- a memorable name
- a clear strategic purpose
- a recognisable identity
- practical recurring examples

The goal is that, after several months of consistent posting, fans would immediately recognise one of these series even if the artist's username was hidden.

The best content pillars should become part of the artist's identity rather than simply supporting it.

Avoid names that simply describe emotions or subjects.

Bad:

- Motivation
- Personal Growth
- Reflection
- Community
- Inspiration
- Mindset

Instead prefer names that emerge naturally from the artist's worldview, philosophy, experiences or lyrical style.

Good examples:

- The Cost Of Becoming
- Survival Notes
- What This Song Taught Me
- Things Nobody Told Me
- The Verse Behind The Story
- The Line That Changed Everything
- Before I Knew Better

Each pillar should feel difficult for another artist to naturally copy.

Purpose should explain why this recurring series exists.

Examples should be realistic episode ideas rather than full content plans.

The three pillars should feel noticeably different from one another.

One might revolve around stories.

One around philosophy.

One around conversations.

Do not make all three personal storytelling.

CONTENT FORMATS

Design 3 repeatable creator formats.

Think like recurring YouTube shows or TikTok series.

Every format should reinforce the artist identity.

Avoid generic creator content.

Each format must include:

- name
- type
- structure
- emotionalGoal

Additional internal rules:

The name should feel ownable.

The structure should explain exactly how every episode works.

The emotional goal should explain why fans come back every week.

Prefer music-first formats such as:

- lyric breakdowns
- songwriting moments
- hook explanations
- studio decisions
- unfinished ideas
- audience discussions
- verse stories

Avoid formats that could belong to any creator.

Bad:

Late Night Thoughts

City Walks

Reflections

Good:

The Story Behind The Hook

One Verse Explained

The Notebook Before The Song

What This Line Really Means

One Take One Truth

The Listener Question

Each format should feel like a recurring show rather than a single content idea.

---

AUDIENCE:

Audience psychology may be built around:
- ambitions
- lifestyles
- frustrations
- cultural identity
- humour
- curiosity
- rebellion
- status
- craftsmanship
- nostalgia
- obsession
- responsibility

Do not default to:
- deep thinkers
- people seeking meaning
- people seeking connection
- introspective listeners

unless strongly supported by inputs.

Do not describe the audience only by genre taste or demographics.

Audience First Principle

The audience should be defined primarily by:

- life circumstances
- emotional state
- worldview
- frustrations
- aspirations

Music taste is secondary.

Bad:
- rap fans
- lyrical listeners
- old school heads

Good:
- people carrying responsibilities earlier than expected
- people trying to make sense of difficult periods
- people searching for meaning rather than distraction

The audience should feel like people, not consumers.

Define:
- persona: who they are emotionally and culturally
- frustrations: what they are tired of, struggling with, or reacting against
- hiddenDesires: what they secretly want from music, artists, identity, belonging, or life
- contentTriggers: what would make them stop scrolling, save, comment, share, or feel seen
- contentTurnoffs: what would make them ignore the artist or feel the brand is fake

Audience output should be specific enough that the artist thinks:
"I know exactly who I am speaking to now."

Avoid generic audience descriptions like:
- people who value authenticity
- people who like meaningful music
- people who enjoy storytelling
- deep thinkers

---

TONE:

Define:
- voice description
- what to do (style rules)
- what to avoid


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
Experiences/philosophy: ${artistPhilosophy || '—'}
Recurring themes: ${recurringThemes || '—'}
Desired listener effect: ${listenerEffect || '—'}
Unique qualities: ${uniqueQualities || '—'}

Use the listed influences as creative context only.

Do not copy them, compare the artist to them, or repeatedly mention them by name.

Infer useful creative patterns from the influences and apply them subtly across the identity kit.

ARTIST MANIFESTO:

Write core.manifesto in the artist's voice.

Do not write in third person.

Describe:
- what the artist stands for
- what they reject
- why they create
- what impact they hope their music has

The manifesto should feel human, direct, and specific.

Bad:
"natestapes is a UK hip hop artist..."

Good:
"I do not make music to escape reality. I make music to understand it."

Manifesto rules:
- Write in first person.
- Make it sound like something the artist could put on their website or press kit.
- It should clearly state what the artist stands for, rejects, and wants listeners to feel.
- Avoid generic motivational language.
- Use the artist’s lived experiences, philosophy, themes, and listener effect.

The manifesto should feel emotionally charged and personal.

Avoid corporate language.

Avoid sounding like a biography.

Write as if the artist is speaking directly.

Use conviction.

Prioritise strong opinions, philosophies and perspectives over career goals.

Artist Snapshot

Create a 30-second strategic overview.

This section is designed for someone discovering the artist for the first time.

It should explain the artist quickly.

Do not persuade.

Do not tell a story.

Simply help someone understand the artist immediately.

Each field should feel concise, memorable and practical.

snapshot.oneLineIdentity

Who is this artist?

Describe them in one memorable sentence.

snapshot.ownableDifference

What is the clearest thing they own that other artists do not?

This should describe territory rather than quality.

snapshot.audiencePromise

What can listeners consistently expect from this artist?

Describe the recurring experience rather than emotions.

snapshot.visualShorthand

Describe the artist's recognisable visual world in one sentence.

snapshot.contentDirection

Summarise what this artist should repeatedly create content about.

Do not repeat positioning, USP or manifesto.

Experience Dominance Rule

Experiences outrank themes.

When both are available:

Bad:
Becoming a parent unexpectedly -> responsibility

Good:
Becoming a parent unexpectedly -> responsibility

The specific experience remains visible.

The strongest identity systems contain both:

Specific reality
+
Universal meaning

Never output only the universal meaning.

Do not extract generic values such as authenticity, honesty, self-belief, passion, hard work, resilience, motivation, or creativity.

Instead identify deeper worldview beliefs.

A belief should sound like a statement about how the world works.

Weak:
- Authenticity matters
- Believe in yourself
- Work hard

Strong:
- Most people confuse visibility with value.
- Comfort often delays growth.
- Modern culture rewards performance over honesty.
- People rarely change until their excuses stop working.
- Belonging is often mistaken for agreement.
- Division causes more suffering than circumstance.

Extract beliefs that are specific to the artist's experiences, philosophy, themes and desired listener effect.

Use these foundations to shape every section of the kit.

Do not merely restate the artist's inputs.

Preserve the experiences, themes, philosophies and perspectives that make the artist unique while expanding them into stronger strategic insight.

NO SAFE ANSWERS

When multiple interpretations are possible, choose the most distinctive interpretation that is supported by the inputs.

Avoid defaulting to:

- self-belief
- resilience
- authenticity
- honesty
- motivation
- growth
- empowerment
- connection

unless the artist explicitly centres those ideas.

Look for unusual patterns.

Prefer specific observations over universally positive observations.

The goal is not to make the artist sound admirable.

The goal is to make them sound identifiable.

When multiple interpretations are possible, choose the most insightful one.

Look for:

- contradictions
- tensions
- unexpected themes
- overlooked strengths
- unusual perspectives

The goal is not merely to describe the artist.

The goal is to reveal something meaningful about them.

CREATIVE DNA

Before generating the Creative Constitution, identify the artist's Creative DNA.

Creative DNA represents the permanent ingredients that repeatedly define this artist.

These are not personality traits.

These are not values.

These are not emotions.

Instead identify the artist's recurring identity ingredients.

Examples

Unexpected Fatherhood

Night Shift Discipline

Anime Philosophy

Underground Realism

Dense Lyricism

Community Before Ego

Late Night London

Building In Public

Creative Curiosity

Earned Hope

Every DNA element should satisfy four rules.

Specific.

Memorable.

Repeatable.

Difficult to copy.

Avoid generic DNA such as:

Resilience

Authenticity

Growth

Hope

Passion

Instead prefer identity ingredients that repeatedly appear throughout the artist's life and work.

Generate 8–12 Creative DNA elements.

Each element should include:

{
Each Creative DNA item should contain:

title

meaning
}

Meaning should explain why this ingredient repeatedly appears throughout the artist's identity.

Creative DNA should become the foundation underneath the entire Identity Kit.

If every other page disappeared, Creative DNA should still explain who the artist is.

CREATIVE CONSTITUTION

Generate the artist's Creative Constitution.

These are permanent creative laws.

They should protect the artist's identity as opportunities, trends and commercial pressure increase.

Organise the Constitution into three sections.

NEVER

Things the artist should never compromise.

ALWAYS

Things the artist should consistently pursue.

REMEMBER

Ideas the artist should keep in mind as their career evolves.

Every principle must emerge naturally from:

- Signature Assets
- Worldview
- Creative Tensions
- Lived Experiences

Do not create motivational advice.

Do not create branding tips.

Do not create social media advice.

Instead create principles that guide future creative decisions.

Each principle should answer questions like:

Should I release this?

Should I collaborate?

Should I follow this trend?

Should I simplify my lyrics?

Should I change my visual identity?

Every principle should protect the artist's long-term identity.

Return:

{
  Each Creative Constitution entry should contain:

section

principle

rationale
}

The rationale should explain why this principle exists.

Generate approximately:

3 Never

3 Always

3 Remember

The strongest constitutions should feel timeless.

Return valid JSON matching exactly this shape:

{
  "core": {
    "brandEssence": string,
    "positioning": string,
    "manifesto": string
  },
  "strategicFoundations": {
  "coreBeliefs": string[],
  "worldviewStatements": string[],
  "coreTensions": string[],
  "emotionalTerritory": string,
  "listenerTransformation": string,
  "culturalPosition": string,
  "influenceAnalysis": string[]
},
"snapshot": {
  "oneLineIdentity": string,
  "ownableDifference": string,
  "audiencePromise": string,
  "visualShorthand": string,
  "contentDirection": string
},
  "strategy": {
  "usp": string,
  "brandMessage": string,
  "listenerIdentity": string[]
},
  "audience": {
  "persona": string,
  "frustrations": string[],
  "hiddenDesires": string[],
  "contentTriggers": string[],
  "contentTurnoffs": string[]
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
"colorMeanings": {
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
    "purpose": string,
    "examples": string[]
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
  "creativeDNA":[
{
"title":"",
"meaning":""
}
],
  "identityRules": [
  {
    "section": string,
    "principle": string,
    "rationale": string
  }
],
  "keywords": string[]
}

Worldview statements should inform the identity system.

Do not reuse the same worldview statement across every section.

Different sections may draw from different worldview statements, experiences, tensions, or identity anchors.

These are the deepest truths extracted from the artist.

They should feel like observations about life.

identityRules represents the artist's Creative Constitution.

Although the JSON field is named identityRules for compatibility, the generated content should be permanent creative principles rather than branding advice.

Every item should help the artist make future creative decisions.

Avoid generic guidance.

Each principle should feel like a law that could only belong to this artist.

Examples:

- Most people quit before life starts making sense.
- Pain becomes useful when it teaches something.
- Community matters more than status.
- Growth starts where comfort ends.
- People are stronger than they realise.

These statements become the source material for:

- manifesto
- positioning
- USP
- content pillars
- audience psychology

The identity kit should be built from these statements.

Requirements:
- Do not simply echo the user's input phrases
- Expand the user's inputs into new strategic language
- If the user says "resilience", explain what that means visually, emotionally, and commercially
- If the user says "unity", explain how that becomes audience connection, content themes, and brand behaviour
- If the user says "lyrical", explain what type of lyrical identity they should own
- Make the identity feel distinct and ownable
- Avoid generic artist branding language
- core.positioning must clearly explain:
  1. who the artist is for
  2. what emotional need they serve
  3. how they differ from similar artists
  4. why listeners would choose them
- Do not use broad claims like "voice of a generation".
- The visuals section must feel specific enough to guide artwork, content, and styling
- Colour palette values must use this exact format: "Colour name — #HEXCODE"
- Only use colour names and hex codes from this approved list:

Deep navy — #07111F
Midnight blue — #0B1026
Ink blue — #111827
Electric blue — #2F7DFF
Ice blue — #BFD7FF
Muted teal — #2C7A7B
Petrol blue — #0F4C5C

Soft black — #050505
Charcoal — #1F1F24
Graphite — #2B2D31
Slate grey — #334155
Concrete grey — #6B7280
Silver grey — #A3A3A3
Soft white — #F5F5F5
Off white — #F2EEE8
Cream — #FFF4D6

Warm beige — #C9A982
Sand — #D6B98C
Taupe — #8B7E74
Cocoa brown — #5C4033
Espresso — #2A1E1A
Terracotta — #B85C38
Burnt orange — #D35400
Amber — #F59E0B
Gold — #D4AF37

Muted green — #556B4E
Earthy green — #4F6F52
Forest green — #1F4D2B
Olive — #6B7D3C
Sage — #A3B18A
Lime accent — #A3E635
Mint — #98F5C8

Deep burgundy — #581C2C
Wine red — #7F1D1D
Crimson — #DC143C
Cherry red — #B91C1C
Dusty pink — #C27A8A
Rose — #E11D48
Blush — #FBCFE8

Violet — #8B5CF6
Royal purple — #5B21B6
Deep purple — #2E1065
Lavender — #C4B5FD
Magenta — #D946EF
Hot pink — #EC4899

Neon green — #39FF14
Cyber cyan — #00E5FF
Acid yellow — #E6FF00
Signal red — #FF3131
Chrome silver — #D9D9D9

Colour rules:
- Use only valid hex codes that visually match the colour name.
- Do not invent colour names that do not match the hex.
- If the colour is called navy, the hex must look navy.
- If the colour is called beige, the hex must look beige.
- Keep colour names short: maximum 2 words.

- Do not invent new colour names.
- Do not invent new hex codes.
- The colour name and hex code must match exactly from the approved list.
- The content formats must be repeatable and realistic
- The audience section must describe how the audience thinks, not just who they are
- The identityRules must act like constraints, not advice
- The result should feel like a system another feature can use, not a moodboard
- The strategy.usp must clearly define what separates the artist from similar musicians.
- The USP must not sound like it could apply to hundreds of similar artists.
- The USP must compare the artist against the common alternative in their lane.
- The USP should explain what the artist does differently, not just what they do.
- Avoid vague phrases like "voice of a generation", "unique sound", "authentic storytelling", "rising artist", "raw emotion".
USP QUALITY TEST:

The USP should be comparative and category-aware.

It should answer:
- What do similar artists usually do?
- What does this artist do differently?
- Why does that difference matter to listeners?
- What can this artist own that others cannot easily copy?

Avoid simply saying the artist is lyrical, authentic, motivational, emotional, raw, or unique.
Explain the specific angle behind those qualities.

Weak:
"An artist blending personal struggle with lyrical depth."

Strong:
"While many motivational rappers focus on confidence and success, this artist focuses on understanding. Their advantage is turning hardship into clarity, not hype."

The USP should reveal an angle the artist may not have seen in themselves.
USP should be one of the most valuable sections in the entire kit.

It should clearly explain:
- what makes the artist different
- why that difference matters
- how that difference creates value for listeners

Avoid generic statements.

The USP should combine:
- sound
- story
- worldview
- audience
- strengths

The USP should be punchy enough that it could become a positioning line.

Prefer sharp contrast.

Example:
Weak: "This artist blends struggle with motivation."

Strong:
"While many artists celebrate outcomes, this artist documents the process."

Strong:
"While many artists provide answers, this artist explores the questions."

Strong:
"While many artists focus on individual success, this artist focuses on collective experience."

The USP should avoid sounding like a bio.

The USP should be punchy enough to become a positioning line.

It should contrast the artist against the obvious alternative.

It should answer:
- What do similar artists usually do?
- What does this artist do differently?
- Why does that difference matter to listeners?
- What can this artist own that others cannot easily copy?

Avoid simply saying the artist is lyrical, authentic, motivational, emotional, raw, powerful, unique, or inspiring.

Explain the specific angle behind those qualities.

Example:
Weak: "This artist blends struggle with motivation."

Strong: "Most motivational rap talks about winning. This artist talks about surviving long enough to understand yourself."

into a single memorable positioning statement.
- The strategy.brandMessage must be a concise statement the artist could use across bios, websites, press kits, and content.
- The strategy.listenerIdentity must describe the kind of listener who would feel represented by this artist.
- Use the experiences/philosophy, recurring themes, desired listener effect, and unique qualities as core source material.
- Do not make the USP generic. It should be based on a specific strength, perspective, story, sound, skill, value, or emotional effect.
- Avoid saying every piece of content must include the same theme
- Make the rules useful for future evolution, not restrictive
- If Direction is provided, it must materially influence:

- Visual System
- Content System
- Creative DNA
- Creative Constitution

Positioning must explain what makes the artist different from others in their genre.

Use contrast.

Structure:

"While many [artists in category] focus on X, this artist focuses on Y."

Examples:

While many rappers celebrate outcomes, this artist explores the lessons hidden inside the journey.

While others document struggle, this artist extracts meaning from it.

Focus on differentiation, not description.

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
- each content pillar must include 3 practical examples of what the artist could post under that pillar
- content.formats: 3
- identityRules: 9
- keywords: 8
- strategy.listenerIdentity: 4
- creativeDNA: 8


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
      temperature: 1,
      max_tokens: 2600,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    const raw = completion.choices?.[0]?.message?.content?.trim() || '{}'

console.log(raw)

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
  artistPhilosophy,
  recurringThemes,
  listenerEffect,
  uniqueQualities,
}: {
  artistName: string
  genre: string
  influences: string
  brandWords: string
  audience: string
  direction: string
  artistPhilosophy?: string
  recurringThemes?: string
  listenerEffect?: string
  uniqueQualities?: string
}) {
  const influenceList = influences
    ? influences.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return {
    core: {
  brandEssence: `${artistName || 'This artist'} crafts ${genre || 'left-field'} music with ${brandWords || 'nocturnal, tactile'} detail, guided by ${direction || 'a focused creative identity'}.`,
  positioning: `${artistName || 'This artist'} makes introspective music for ${audience || 'listeners who want depth, atmosphere, and honesty'}.`,
  manifesto: `I make music to turn ${artistPhilosophy || 'lived experience'} into something listeners can recognise in themselves. I want the music to leave people feeling ${listenerEffect || 'understood, grounded, and less alone'}. This is not about chasing a trend; it is about building a world around ${recurringThemes || 'truth, growth, and identity'}.`,
},
strategy: {
  usp: `${artistName || 'This artist'} stands out through ${uniqueQualities || brandWords || 'a distinct creative identity'}, shaped by ${artistPhilosophy || direction || 'a clear personal perspective'} and expressed through ${genre || 'their musical lane'}.`,
  brandMessage: `Music for ${audience || 'listeners'} who want ${listenerEffect || 'something honest, recognisable, and emotionally specific'}.`,
  listenerIdentity: [
    recurringThemes
      ? `Listeners drawn to themes of ${recurringThemes}`
      : 'Listeners who want music that reflects their inner world',
    artistPhilosophy
      ? `People who connect with the philosophy: ${artistPhilosophy}`
      : 'People drawn to artists with a clear point of view',
    uniqueQualities
      ? `Fans who value ${uniqueQualities}`
      : 'Fans who value emotional specificity over generic hype',
    listenerEffect
      ? `Listeners who want to feel ${listenerEffect}`
      : 'Listeners who connect with atmosphere, story, and identity',
  ],
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
