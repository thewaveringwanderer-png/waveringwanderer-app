import OpenAI from "openai"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      projectType,
      description,
      keyTracks,
      runwayWeeks,
      platformFocus,
      budget,
      songMood,
  songEnergy,
  referenceArtists,
  targetListener,
    } = body

    const SYSTEM = `
You are a senior release strategist who has run campaigns for independent artists, boutique labels, and distribution companies.

You think in systems, not advice.

You produce:
- execution plans
- workflows
- checklists
- pipelines
- weekly schedules

You NEVER give vague guidance.

Every recommendation must include:
- exact actions
- quantities
- timelines
- platforms
- concrete deliverables

You assume the artist has:
- no manager
- no label
- limited budget
- limited time

You prioritize leverage over vanity.

Output MUST be valid JSON only.
No markdown.
No backticks.
No commentary.

You understand how playlist curators think and search.
You translate song characteristics into exact playlist search keywords.
Keywords must reflect mood, energy, and listener context — not genre labels alone.

`

const USER = (args: any) => `
Create a professional release campaign plan.

Treat this as a real client project.

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
- songMood: ${songMood}
- songEnergy: ${songEnergy}
- referenceArtists: ${referenceArtists}
- targetListener: ${targetListener}


Hard requirements:

1. Campaign must be split into 3 phases:
   - Pre-release
   - Launch week
   - Post-release

2. Each phase must contain AT LEAST 10 actions.

3. Actions must be written as executable tasks:
   Example:
   "Build Spotify curator spreadsheet with 50 contacts"
   NOT:
   "Reach out to curators"

4. Must include ALL of the following systems:

PLAYLIST SYSTEM:
PLAYLIST DISCOVERY WORKFLOW (mandatory):

Must include:

- Exact Spotify search queries (minimum 6 examples)
- How to extract curator contact info from playlist bios + Instagram + Soundplate
- How to use Spotify desktop app → right click playlist → copy link → inspect owner
- SubmitHub discovery process (filters + credits strategy)
- Groover discovery process (genre + country filters)
- Soundplate usage
- Instagram hashtag method (e.g. #spotifycurator + niche tags)
- Expected realistic response rate %
- Campaign MUST adapt based on songMood, songEnergy, referenceArtists, and targetListener.
Playlist keywords must:
- Change significantly based on songMood and energy
- Avoid generic genre-only terms
- Match how curators actually title playlists on Spotify and SubmitHub
- Include “avoid” keywords that would attract the wrong curators

- Playlist targets, content angles, creator outreach, and ad strategy must change accordingly.
- Do NOT reuse generic strategies if inputs differ.


Provide step-by-step instructions like:

Step 1: Search Spotify for "UK indie hip hop"
Step 2: Open 20 playlists
Step 3: Collect curator IG/email
Step 4: Add to Google Sheet with columns X,Y,Z

No generalities.
Must read like onboarding documentation.

- Spotify for Artists editorial pitch (timeline + fields to fill)
- curator discovery workflow (where to find them)
- outreach message framework
- follow-up cadence
- tracking method (Google Sheet columns)

CONTENT SYSTEM:
- posting cadence per week
- hook testing framework (minimum 5 hooks per clip)
- content pillars (minimum 4)
- daily execution routine

ADS SYSTEM (respect budgetNotes):
- creative testing structure
- Spark Ads usage
- Meta retargeting
- audience definitions
If budgetNotes implies £0 → explicitly state NO PAID ADS.

UGC SYSTEM:
- creator seeding process
- DM template outline
- expected conversion rates

PR SYSTEM:
- how to build press list
- what to send
- who to target (blogs, radio, playlists)
- follow-up cadence

5. Provide real numbers:
- posts per week
- DMs per day
- creators contacted
- ad creatives tested
- playlists pitched

6. Include failure points:
- common mistakes
- where artists usually drop momentum

Return JSON matching exactly this TypeScript shape:

{
  "summary": string,
  "positioning": string,
  "keyMoments": string[],
  "phases": [
    { "label": string, "timeframe": string, "focus": string, "actions": string[] }
  ],
  "playlistKeywords": {
    "primary": string[],
    "secondary": string[],
    "avoid": string[]
  },
  "contentThemes": string[],
  "metrics": string[]
}


Minimums:
- keyMoments: 6+
- phases: 3
- actions per phase: 10+
- contentThemes: 6+
- metrics: 10+

No motivational language.
No filler.
Think like a campaign operator.
`




    const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0.5,
  messages: [
    { role: "system", content: SYSTEM },
    { role: "user", content: USER(body) },
  ],
})


   const raw = completion.choices[0].message.content || '{}'
const json = JSON.parse(raw.trim())


    return NextResponse.json(json)

  } catch (e: any) {
    console.error(e)
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    )
  }
}
