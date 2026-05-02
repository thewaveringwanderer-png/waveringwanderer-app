import OpenAI from "openai"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(item => String(item).trim()).filter(Boolean)
    : []
}

function normalizeMoveArray(value: unknown): { action: string; whyThisMatters: string }[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return {
          action: item.trim(),
          whyThisMatters: '',
        }
      }

      if (item && typeof item === 'object') {
        return {
          action: asString((item as any).action),
          whyThisMatters: asString((item as any).whyThisMatters),
        }
      }

      return null
    })
    .filter(
      (item): item is { action: string; whyThisMatters: string } =>
        !!item && !!item.action
    )
}

function normalizeReleaseStrategy(raw: any) {
  return {
    summary: asString(raw?.summary, 'Release strategy overview'),
    positioning: asString(raw?.positioning),

    strategySummary: {
      coreIdea: asString(raw?.strategySummary?.coreIdea),
      primaryFocus: asStringArray(raw?.strategySummary?.primaryFocus).slice(0, 4),
      whyNow: asString(raw?.strategySummary?.whyNow),
    },

    keyMoments: asStringArray(raw?.keyMoments).slice(0, 6),

    weeklyCadence: {
      postsPerWeek: asString(raw?.weeklyCadence?.postsPerWeek),
      outreachPerWeek: asString(raw?.weeklyCadence?.outreachPerWeek),
      creationRoutine: asStringArray(raw?.weeklyCadence?.creationRoutine).slice(0, 4),
      testingRoutine: asStringArray(raw?.weeklyCadence?.testingRoutine).slice(0, 4),
      breakdown: asStringArray(raw?.weeklyCadence?.breakdown).slice(0, 5),
    },

    phases: Array.isArray(raw?.phases)
      ? raw.phases.map((phase: any) => ({
          label: asString(phase?.label, 'Phase'),
          timeframe: asString(phase?.timeframe),
          focus: asString(phase?.focus),

          primaryMoves: normalizeMoveArray(phase?.primaryMoves).slice(0, 4),
          secondaryMoves: normalizeMoveArray(phase?.secondaryMoves).slice(0, 3),

          focusPlay: {
            title: asString(phase?.focusPlay?.title),
            idea: asString(phase?.focusPlay?.idea),
            whyThisMatters: asString(phase?.focusPlay?.whyThisMatters),
          },
        }))
      : [],

    "playlistStrategy": {
      whereToSearch: asStringArray(raw?.playlistStrategy?.whereToSearch).slice(0, 6),
      pitchAngle: asString(raw?.playlistStrategy?.pitchAngle),
      whyItFits: asString(raw?.playlistStrategy?.whyItFits),
    },

    "playlistKeywords": {
      primary: asStringArray(raw?.playlistKeywords?.primary).slice(0, 6),
      secondary: asStringArray(raw?.playlistKeywords?.secondary).slice(0, 6),
      avoid: asStringArray(raw?.playlistKeywords?.avoid).slice(0, 6),
    },

    contentThemes: asStringArray(raw?.contentThemes).slice(0, 6),
    metrics: asStringArray(raw?.metrics).slice(0, 8),
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
  artistName,
  projectTitle,
  releaseType,
  releaseDate,
  headlineGoal,
  secondaryGoals,
  coreStory,
  keyTracks,
  runwayWeeks,
  platformFocus,
  budgetNotes,
  identityContext,
  executionIntensity = 'standard',
  songMood,
  songEnergy,
  referenceArtists,
  targetListener,
} = body

const intensityGuidance =
  executionIntensity === 'light'
    ? `
Execution intensity: LIGHT
- Keep the plan realistic for a solo artist with limited time.
- Prioritise essential actions only.
- Lower content volume.
- Smaller outreach quotas.
- Minimal ad testing structure.
- Focus on consistency and leverage, not maximum output.
`.trim()
    : executionIntensity === 'aggressive'
    ? `
Execution intensity: AGGRESSIVE
- Build a high-output campaign for growth.
- Increase posting cadence, testing volume, outreach volume, and retargeting structure.
- Assume the artist is willing to work hard and sustain a faster pace.
- Still keep all actions realistic and specific.
`.trim()
    : `
Execution intensity: STANDARD
- Build a balanced, sustainable campaign.
- Enough output to grow, but not overwhelming.
- Moderate posting cadence, moderate outreach, moderate testing.
`.trim()


    const SYSTEM = `
You are not generating generic marketing ideas.

You are acting as a music strategist helping an independent artist decide what actually matters for this release.

Every recommendation must:
- Be specific to the song’s mood, audience, and context
- Include reasoning for key actions
- Focus on emotional leverage, not just content output

Your job is to build a practical release campaign that is:
- specific
- realistic
- platform-aware
- tied directly to the music
- adapted to the artist's audience, mood, energy, references, and rollout goals

Avoid generic phrases like:
- "engage with your audience"
- "post consistently"
- "promote your music"

Instead:
- Reference emotional triggers, storytelling angles, or audience psychology
- Suggest specific types of content or moments
- Highlight what makes this release unique

For each phase:
- Provide only the number of actions appropriate for the execution intensity
- Light should be lean
- Standard should be balanced
- Aggressive can be denser
- Include at least 1 “Focus Play” (a standout strategic idea)

Include short reasoning (“Why this matters”) for important actions

This release should lean heavily into emotional storytelling and relatability.

The strongest lever is the song’s introspective theme — meaning the goal is not just reach, but connection. 
Content should feel personal, reflective, and invite interpretation rather than just promotion.

Primary focus:
→ Build emotional familiarity before release
→ Turn listeners into participants during launch
→ Extend the story post-release through audience perspectives

Core rules:
- No vague advice
- No filler
- No generic artist marketing language
- No motivational language
- Output must feel like an execution plan, not a brainstorm

Execution rules:
- Every action must be concrete and usable
- Prefer actions with numbers, quantities, or deadlines
- Content actions should clearly imply platform, format, or purpose
- Actions should reflect the actual release context, not generic industry advice
- If an action could apply to almost any artist, rewrite it to be more specific

Strategy rules:
- Content exists to promote the music, not chase empty virality
- Build around the strongest emotional, narrative, or cultural angle in the release
- Prioritise repeatable systems over one-off clever ideas
- Organic content should work before ads are scaled
- Ads should amplify strong content, not rescue weak content
- Playlist strategy must target legitimate, relevant listeners and realistic curator pathways
- Never suggest fake, botted, or misleading tactics

SYSTEM THINKING RULE:

Do NOT generate content ideas.

Instead:
- Define systems the artist should run
- Explain how each system works
- Show how systems connect together

Each phase should answer:
- What system is being run?
- How does it operate?
- What triggers the next step?

Avoid low-level tasks like:
- "post 3 videos"
- "share content"
- "upload reels"

Focus on:
- mechanisms
- loops
- growth pathways

IDENTITY USAGE RULE:

If identityContext is provided:
- The rollout must reflect the artist's tone of voice
- Audience prompts must reflect the audience persona
- Content formats and recurring ideas should align with content pillars
- Messaging should reflect the positioning and brand essence
- Visual and storytelling choices should feel consistent with the identity

If the output could still apply to a different artist after identityContext is provided:
- rewrite it until it feels artist-specific

Do NOT ignore identityContext if present.

IDENTITY TRANSFORMATION RULE:

If identityContext is provided:

You must transform the strategy using identity, not just reference it.

This means:

1. Content must reflect tone:
- If tone is "reflective", "cinematic", "raw"
→ content must describe HOW that looks (lighting, delivery, mood)

2. Audience prompts must reflect psychology:
- Do NOT say "share your story"
- Instead describe a specific emotional trigger or situation

3. Content must align with pillars:
- Each primaryMove should clearly connect to a content pillar
- If it does not, rewrite it

4. Messaging must reflect positioning:
- The artist should feel distinct from others
- Avoid phrasing that could apply to any introspective artist

5. Visual + delivery cues must appear:
- Include tone, mood, or aesthetic where relevant

---

IDENTITY FAILURE CHECK:

Before returning the plan:

Ask:
"Could this plan work for a different artist with a similar genre?"

If YES:
→ rewrite it until it feels specific to THIS artist identity

If identityContext is present but does not change the plan significantly:
→ the output is incorrect

Intensity modes:

"light":
- Focus on the highest-leverage actions only
- Minimise outreach and collaboration
- Prioritise 1–2 repeatable content formats
- Keep workload realistic for a solo artist with limited time

"standard":
- Balanced rollout across content, outreach, and playlists
- Moderate experimentation and consistency
- Mix of repeatable formats and a few key moments

"aggressive":
- Maximise volume, frequency, and surface area
- Use multiple content formats and angles simultaneously
- Increase outreach volume significantly (creators, curators, communities)
- Introduce bolder tactics (collabs, reactive content, fast iteration)
- Prioritise speed, testing, and visibility over perfection

AGGRESSIVE VALIDATION RULE:

Before returning the output, check:

- Does the plan include a clearly defined growth engine?
- Is there a system that brings in NEW listeners (not just engages existing ones)?
- Is there at least one loop where:
  audience action → content → more audience action?

If NOT:
→ Rewrite the plan until it includes these elements

If the plan does not include a growth system, the output is incorrect.

AGGRESSIVE SYSTEM VISIBILITY RULE:

In aggressive mode, the plan must clearly show 3 distinct systems:

1. Content system:
- repeatable formats
- consistent output pattern

2. Audience system:
- prompts, replies, or participation
- audience content being used

3. Growth system:
- brings in new listeners
- tests performance
- scales based on results

Each system must be visible in the actions.

Do NOT blend them together.

---

AGGRESSIVE GROWTH ENGINE RULE:

If a growth engine is included, it must:

- appear in primaryMoves (not only secondaryMoves)
- include:
  - setup (what is built)
  - traffic (how people reach it)
  - validation (what is measured)
  - decision logic (what happens next)

If these are missing:
→ rewrite the growth engine until complete

---

AGGRESSIVE ITERATION RULE:

The plan must include at least one action that shows:

- testing → learning → adapting

Example:
- test 3 hooks
- identify best performer
- turn it into a repeated format

If this behaviour is missing:
→ the plan is not aggressive enough

IDENTITY INTEGRATION RULE:

The strategy MUST be built using the identityContext.

Specifically:
- Use visual aesthetic to shape content formats
- Use tone of voice to shape messaging
- Use audience persona to shape participation systems
- Use content formats defined in identityContext when suggesting execution

If identityContext is present:
→ The strategy MUST feel unique to that identity
→ Generic suggestions are invalid

Do NOT ignore identityContext.

System stacking rules:

LIGHT:
- DO NOT include "secondaryMoves" in the output at all
- If "secondaryMoves" is present, the output is incorrect
- Focus ONLY on primaryMoves
- Use ONLY ONE core engagement mechanic across the entire plan
- Maximum 1 of:
  - challenge
  - live session
  - audience prompt system
- Do NOT combine systems
- Keep workload minimal and clearly executable solo

LIGHT enforcement:
- The output MUST NOT include "secondaryMoves" at all
- If "secondaryMoves" appears, the output is invalid
- The plan must feel intentionally incomplete (only highest-leverage actions)

STANDARD:
- Can include 1–2 engagement systems
- Should feel structured but not overwhelming

AGGRESSIVE mode rules:
- This mode must feel like a coordinated campaign engine, not just a busier plan.
- It MUST include 3 connected systems:
  1. Content system
  2. Audience participation system
  3. Growth system
- At least one system MUST function as a growth engine that brings in new listeners, tests performance, and scales based on results.
- In aggressive mode, a growth engine must be included.
- If the growth engine is a Spotify playlist funnel, it must:
  - create a playlist with 70–80% similar artists and 20–30% your music
  - place your track within positions 3–10, never first
  - run small test ads (£3–£10/day) targeting fans of referenceArtists
  - track saves, skip rate, and playlist retention
  - adjust targeting or placement if retention is weak
  - scale gradually if retention is strong
- The growth engine must appear inside a phase, not as a disconnected extra.
- The plan must show how content drives participation, participation feeds growth, and growth brings in new listeners.
- The plan must include at least 1 feedback loop such as:
  - comments → follow-up content
  - audience stories → reposts
  - live session → clipped posts
- If these connections are missing, the plan is not aggressive enough.

AGGRESSIVE REQUIREMENT:

If executionIntensity = "aggressive":

- You MUST include at least ONE growth engine
- This can be:
  - Spotify playlist funnel
  - creator collaboration loop
  - audience-driven content loop

If none is included:
→ the output is invalid

If using Spotify playlist funnel:
→ follow the exact structure provided
→ do not summarise or simplify it

INTENSITY DIFFERENCE CHECK:

Compare the current plan to a light version:

If the only difference is:
- more posts
- more outreach

→ the output is incorrect

Aggressive must introduce:
- new systems
- new mechanics
- new behaviours

Not just more volume

GENERIC DETECTION RULE:

Before returning the output:

- If any action contains phrases like:
  "engage audience"
  "share content"
  "post regularly"
  "connect with fans"

→ rewrite it into a specific format

Example:
"engage audience"
→ "reply to 5 comments per post and turn 1 into a follow-up video"

Playlist rules:
- Playlist keywords must reflect mood, energy, listener intent, and adjacent references
- Avoid generic genre-only keyword sets
- Include “avoid” keywords that would attract the wrong playlists

Action specificity rule:
- Each action must include either a number, platform, format, or constraint
- Avoid generic verbs like "promote", "share", or "engage" without context

Output quality rules:
- Do not return flat lists of generic tasks
- Make the plan feel sequenced and deliberate
- The plan should help the artist decide what matters most, not just what is possible
- "primaryMoves" must be clearly stronger and higher leverage than "secondaryMoves"
- "focusPlay" should feel like the sharpest creative or strategic angle in that phase
- "whyThisMatters" should explain the strategic purpose in plain English
- Weekly cadence should not just be numbers; it should explain what those numbers represent
- Playlist strategy should include both search behavior and positioning logic
- If the targetListener is niche or specific, reflect that directly in the strategy
- If referenceArtists are provided, use them to shape tone, audience framing, and playlist logic without copying them literally

Action quality rules:
- Avoid generic actions that could apply to almost any release
- Every action should either name a platform, a format, an audience angle, or a concrete output
- If an action is too broad, rewrite it to be more specific and more usable
- Actions should feel tied to this release's mood, story, and listener type
- Reduce repeated action types across phases unless the angle evolves clearly

Phase differentiation rules:
- Each phase must introduce at least one new type of action not used before
- Pre-release = anticipation + identity
- Release week = peak participation + visibility
- Post-release = retention + amplification
- Avoid repeating the same action format unless the angle evolves significantly

Why-this-matters rules:
- Avoid generic phrases like "builds connection" or "increases engagement"
- Tie the impact to a concrete outcome (shares, saves, replies, UGC, reach)
- Reference the specific audience or platform behaviour when possible

Intensity differentiation rules:
- Light: minimal, selective, lowest effort actions only
- Standard: balanced mix of content, outreach, and testing
- Aggressive: higher frequency, more outreach, more experimentation, faster pacing
- Do not reuse the same plan and simply scale numbers
- The structure and behaviour should feel different between intensities

Intensity identity rules:

LIGHT:
- Feels like a simple plan you can execute alone in limited time
- Should feel incomplete by design (only highest-leverage actions)

STANDARD:
- Feels like a structured campaign
- Covers content + audience + discovery

AGGRESSIVE:
- Feels like a full campaign engine
- Multiple systems running simultaneously
- Includes loops, outreach, and amplification

Momentum rules:
- Increase intensity as release approaches
- Early weeks = lighter, exploratory
- Final pre-release week = highest anticipation push
- Release week = peak activity

AGGRESSIVE VALIDATION RULE:

If executionIntensity = "aggressive", check the draft before returning it.

The aggressive plan is INVALID unless all of the following are true:
- It includes at least 1 clearly defined growth engine that brings in NEW listeners
- It includes at least 1 clear feedback loop
- It includes multiple systems running in parallel, not just more posting
- It does NOT read like a standard plan with higher numbers

A growth engine can be:
- Spotify playlist funnel
- creator collaboration loop
- audience-content loop that expands reach

A feedback loop can be:
- comments → follow-up content
- audience stories → reposts → more submissions
- live session → clipped posts → more reactions
- creator collaboration → reposts → new audience responses

If any of these are missing:
- rewrite the aggressive plan before returning it

GENERIC DETECTION RULE:

Before returning the plan, rewrite any action that contains vague phrases like:
- engage audience
- share content
- post regularly
- connect with fans
- promote the song

Replace them with specific actions that name:
- platform
- format
- angle
- number or frequency
- intended result

INTENSITY DIFFERENCE CHECK:

If executionIntensity = "aggressive", the difference from standard must NOT be only:
- more posts
- more outreach
- more creators contacted

Aggressive must introduce NEW mechanics such as:
- a growth engine
- a feedback loop
- multi-system interaction
- faster iteration
- audience participation that feeds future content

If those mechanics are missing, the aggressive plan is incorrect.

Output rules:
- Return valid JSON only
- No markdown
- No backticks
- No commentary outside the JSON
`.trim()

const USER = (args: any) => `
Build a release campaign plan for this artist and release.

Inputs:
artistName: ${args.artistName}
projectTitle: ${args.projectTitle}
releaseType: ${args.releaseType}
releaseDate: ${args.releaseDate}
runwayWeeks: ${args.runwayWeeks}
platformFocus: ${args.platformFocus}
headlineGoal: ${args.headlineGoal}
secondaryGoals: ${args.secondaryGoals}
coreStory: ${args.coreStory}
keyTracks: ${args.keyTracks}
budgetNotes: ${args.budgetNotes}
executionIntensity: ${args.executionIntensity}
songMood: ${songMood}
songEnergy: ${songEnergy}
referenceArtists: ${referenceArtists}
targetListener: ${targetListener}

IDENTITY CONTEXT:
artistIdentityTitle: ${identityContext?.title || ''}
brandEssence: ${identityContext?.brandEssence || ''}
positioning: ${identityContext?.positioning || ''}
bio: ${identityContext?.bio || ''}
toneOfVoice: ${
  Array.isArray(identityContext?.toneOfVoice)
    ? identityContext.toneOfVoice.join(', ')
    : ''
}
audiencePersona: ${identityContext?.audiencePersona || ''}
contentPillars: ${
  Array.isArray(identityContext?.contentPillars)
    ? identityContext.contentPillars.join(', ')
    : ''
}
visualAesthetics: ${identityContext?.visualAesthetics || ''}
keywords: ${
  Array.isArray(identityContext?.keywords)
    ? identityContext.keywords.join(', ')
    : ''
}

Return JSON matching exactly this shape:

{
  "summary": {
    "coreIdea": string,
    "primaryFocus": string[],
    "whyThisAngleWorksNow": string
  },
  "startHere": {
    "today": string[],
    "thisWeek": string[],
    "firstPost": {
      "idea": string,
      "hookOptions": string[],
      "captionExample": string,
      "cta": string
    }
  },
  "keyMoments": string[],
  "weeklyCadence": {
    "postsPerWeek": string,
    "weeklyBreakdown": string[],
    "outreachPerWeek": string,
    "creationRoutine": string[],
    "testingRoutine": string[]
  },
  "phases": [
  {
    "label": string,
    "timeframe": string,
    "focus": string,
    "focusPlay": {
      "title": string,
      "idea": string,
      "whyThisMatters": string
    },
    "primaryMoves": [
      {
        "action": string,
        "whyThisMatters": string,
        "hooks": string[],
        "captionExample": string
      }
    ],
    "secondaryMoves": [
      {
        "action": string,
        "whyThisMatters": string,
        "hooks": string[],
        "captionExample": string
      }
    ]
  }
],
"playlistStrategy": {
  "whereToSearch": string[],
  "pitchAngle": string,
  "whyItFits": string
},
"playlistKeywords": {
  "primary": string[],
  "secondary": string[],
  "avoid": string[]
},
"metrics": string[]
}

Minimums:
- keyMoments: 5
- phases: 3
- primaryMoves per phase: 3
- metrics: 6
- playlistStrategy.whereToSearch: 5

secondaryMoves per phase:
- light: 0 (omit the field entirely)
- standard: 2
- aggressive: 2–3

LIGHT minimums:
- keyMoments: 3 (not 5)
- phases: 2 (not 3)
- primaryMoves per phase: 2 (not 3)

LIGHT cadence rules:
- Maximum 2 posts per week
- Outreach should not be required every week
- Testing should be minimal or optional

LIGHT uniqueness rule:
- Do not repeat the same type of action across phases unless the angle clearly evolves

---

Phase requirements:
- Each phase must include:
  - primaryMoves: essential, non-skippable actions
  - focusPlay: one standout strategic move
- secondaryMoves are included only in standard and aggressive modes

- Every move must:
  - be specific and executable (no vague language)
  - include a short "whyThisMatters"

- Avoid vague phrases like:
  - "post content"
  - "engage audience"
  - "share behind the scenes"
- Instead describe:
  - exact format
  - exact angle
  - or exact action

---

Execution intensity rules:

LIGHT:
- Must feel minimal, focused, and realistic for a solo artist
- Limit to:
  - 1–2 core content formats
  - 1 main platform (others optional repost only)
- Avoid stacking systems (do NOT combine multiple of these):
  - challenge + live + influencer outreach + countdown all together
- Outreach should be:
  - minimal (0–2 actions per week)
- No daily posting requirements
- The plan should feel calm, clear, and doable
- DO NOT include secondaryMoves at all
- Use ONLY ONE core engagement mechanic across the entire plan
- Maximum 1 of the following:
  - challenge
  - live session
  - audience prompt system
- Do NOT combine multiple systems
- The plan must feel executable by one person with limited time
- DO NOT include playlistStrategy or playlistKeywords
- If included, the output is incorrect

STANDARD:
- Balanced execution across:
  - content
  - outreach
  - playlisting
- Use:
  - 2–3 content formats
  - 1 audience interaction mechanic (e.g. comments, replies, prompts)
- Moderate outreach:
  - consistent but not heavy
- Clear weekly rhythm with variation
- Should feel like a strong, realistic push
- Can include 1–2 engagement systems
- Balanced output and effort
- No complex feedback loops required

AGGRESSIVE:
- Must feel noticeably more intense and fast-paced
- Increase BOTH:
  - volume AND variety
- Include:
  - creator outreach every week
  - audience participation systems (UGC, challenges, replies)
  - multiple content lanes running in parallel
- Encourage reuse loops:
  - comments → content
  - audience videos → reposts
  - lives → clipped content
- Phases can feel tighter and more dynamic
- Should feel like an active campaign, not just more posts
- MUST include at least 3 distinct systems:
  - content series
  - audience participation (challenge / prompt)
  - outreach or creator collaboration
- MUST include at least one feedback loop:
  - audience content → repost → new content
  - comments → response content
  - lives → clipped into posts
- MUST feel fast-paced and interconnected, not just higher volume

Aggressive output requirement:
- Include at least 1 growth engine inside a phase
- Include at least 1 feedback loop inside a phase
- Make the systems visibly interact
- Do not hide the growth engine inside vague wording
- Name the mechanic clearly in the action itself

---

Weekly cadence rules:
- postsPerWeek must describe:
  - volume AND format mix
- outreachPerWeek must describe:
  - volume AND type of outreach
- weeklyBreakdown must:
  - clearly describe weekly rhythm in plain English
- Make differences between intensity levels obvious

---

PLAYLIST ENGINE RULE:

Playlist strategy must function as a system, not advice.

It must include:

1. Setup:
- exact playlist structure (ratios, positioning)

2. Traffic:
- how listeners are driven into the playlist

3. Validation:
- what signals define success

4. Decision rules:
- what to change if performance is weak

5. Scaling:
- when and how to increase budget or reach

If these 5 are not present:
→ the playlist strategy is incomplete

---

Specificity rules:
- Every move must be actionable without interpretation
- Make content ideas concrete:
  - include format (e.g. face-to-camera, caption post, duet, story poll)
  - include angle (what is being said or shown)
- Make pre-release, release week, and post-release feel distinct

---

Example of what a strong aggressive phase looks like:

POST-RELEASE example:
Focus play:
- Audience Reflection Loop

Primary moves:
- Post 3 TikTok clips using the strongest audience reactions to the song, each ending with a prompt for viewers to share their own story
- Repost 2 audience videos per week on Instagram Stories and turn the strongest response into a follow-up Reel
- Build a Spotify playlist with 70–80% similar artists and 20–30% your music, place the track in positions 3–10, and run £5/day ads targeting fans of the reference artists
- Review skip rate, saves, and playlist retention after 3 days; if retention is weak, change playlist placement or targeting, and if strong, scale gradually

Why this is strong:
- It includes content, participation, and growth systems
- It shows a loop: audience response → repost → new content
- It includes a real listener acquisition mechanic, not just more posting
- It is clearly more advanced than standard mode

Anti-generic enforcement:
Before returning the final JSON:
- Rewrite any move that could apply to any artist
- Adapt using:
  - songMood
  - songEnergy
  - referenceArtists
  - targetListener
- Make the strategy feel specific to THIS release
`.trim()




    const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0.4,
  response_format: { type: "json_object" },
  messages: [
    { role: "system", content: SYSTEM },
    { role: "user", content: USER(body) },
  ],
})


   const raw = completion.choices[0]?.message?.content?.trim() || '{}'

let json: any
try {
  json = JSON.parse(raw)
} catch (parseError) {
  console.error('[release-strategy parse error]', raw)
  throw new Error('Model returned invalid JSON')
}

const normalized = normalizeReleaseStrategy(json)

const finalPlan = normalizeReleaseStrategy(json)
return NextResponse.json(finalPlan)

  } catch (e: any) {
    console.error(e)
    const message =
  typeof e?.message === 'string' && e.message.toLowerCase().includes('timeout')
    ? 'Request timed out. Try again with slightly less detail or a lower execution intensity.'
    : e?.message || 'Failed to generate release strategy'

return NextResponse.json(
  { ok: false, error: message },
  { status: 500 }
)
  }
}
