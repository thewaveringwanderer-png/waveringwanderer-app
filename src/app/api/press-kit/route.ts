import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const runtime = 'nodejs'

type PressKitPatch = {
  artistName?: string
  tagline?: string
  shortBio?: string
  extendedBio?: string
  location?: string
  genre?: string
  forFansOf?: string
  keyAchievements?: string
  notablePress?: string
  liveHighlights?: string
  pressAngle?: string
  streamingLinks?: string
  socialLinks?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  photoNotes?: string
  releaseTitle?: string
}

function jsonResponse(body: any, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const mode = body.mode as 'from_profile' | 'from_web' | 'bio_from_web'
    const artistName = (body.artistName ?? '').toString().trim()
    const socialHandle = (body.socialHandle ?? '').toString().trim()
    const profile = body.profile ?? null
    const current: PressKitPatch = body.current ?? {}

    if (!mode) {
      return jsonResponse({ error: 'Missing mode' }, 400)
    }
    if (!artistName) {
      return jsonResponse({ error: 'artistName is required' }, 400)
    }

    const systemPrompt = `
You are an assistant helping independent recording artists assemble a clean, professional electronic press kit (EPK).

- Your job is to polish and complete fields, NOT to invent wild claims.
- Keep details plausible and lightly described: say things like "support from local radio and online tastemakers" instead of naming specific outlets, unless they are already provided.
- When in doubt, be slightly conservative rather than over-hyping.
- Preserve any strong, distinctive language in the existing content where it fits.
- Output ONLY a single JSON object, no explanatory text.

JSON shape (all fields optional):

{
  "artistName": string,
  "tagline": string,
  "shortBio": string,
  "extendedBio": string,
  "location": string,
  "genre": string,
  "forFansOf": string,
  "keyAchievements": string,
  "notablePress": string,
  "liveHighlights": string,
  "pressAngle": string,
  "streamingLinks": string,
  "socialLinks": string,
  "contactName": string,
  "contactEmail": string,
  "contactPhone": string,
  "photoNotes": string,
  "releaseTitle": string
}
    `.trim()

    let userPrompt = ''

    if (mode === 'from_profile') {
      userPrompt = `
Use the artist profile and current draft below to fill or improve the press kit fields.

Artist name: ${artistName}
Social handle(s): ${socialHandle || 'not provided'}

Artist profile from other Wavering Wanderers tools (may be partial JSON):
${JSON.stringify(profile, null, 2)}

Current press kit fields (may be partial JSON):
${JSON.stringify(current, null, 2)}

Return a refined JSON object with any updated / added fields. Don't remove good existing details; build around them.
      `.trim()
    } else if (mode === 'from_web') {
      userPrompt = `
Pretend you briefly looked at this artist's public profiles online using the name and social handle below.
You DO NOT literally have web access, so do not say that you "looked up" anything. Instead, infer a believable, grounded picture based on:

- Artist name
- Optional social handle
- Any existing profile information
- Any existing press-kit fields

Never invent specific stats (follower numbers, exact stream counts, named outlets) unless they already appear in the input.

Artist name: ${artistName}
Social handle(s): ${socialHandle || 'not provided'}

Artist profile from tools (may be partial JSON):
${JSON.stringify(profile, null, 2)}

Current press kit fields (may be partial JSON):
${JSON.stringify(current, null, 2)}

Return a JSON object with polished fields for an artist EPK.
      `.trim()
    } else if (mode === 'bio_from_web') {
      userPrompt = `
Focus ONLY on writing a short bio and an extended bio for this artist.

Use the name, optional handle, and any existing information as context.
Keep it grounded and believable for an independent artist. No specific stats, just general support and momentum.

Artist name: ${artistName}
Social handle(s): ${socialHandle || 'not provided'}

Artist profile from tools (may be partial JSON):
${JSON.stringify(profile, null, 2)}

Existing press kit fields (may be partial JSON):
${JSON.stringify(current, null, 2)}

Return JSON with just these keys (others optional but not required):
{
  "shortBio": string,
  "extendedBio": string
}
      `.trim()
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content from OpenAI')
    }

    const patch = JSON.parse(content) as PressKitPatch

    return jsonResponse({ data: patch }, 200)
  } catch (err: any) {
    console.error('[press-kit API] error', err)
    return jsonResponse(
      { error: err?.message || 'Press kit API error' },
      500
    )
  }
}
