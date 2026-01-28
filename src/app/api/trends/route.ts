import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))

    const {
      artistName,
      platform,
      genre,
      goal,
      audience,
      energy,
      releaseContext,
    } = body || {}

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    const effectiveGenre = genre || 'unspecified genre'
    const effectiveGoal = goal || 'grow awareness and deepen connection'
    const effectiveAudience = audience || 'fans of this scene'
    const effectiveEnergy = energy || 'medium'
    const effectiveArtist = artistName || 'the artist'

    const prompt = [
      `You are an expert music marketing strategist for independent artists.`,
      ``,
      `Artist: ${effectiveArtist}`,
      `Platform: ${platform}`,
      `Genre: ${effectiveGenre}`,
      `Campaign goal: ${effectiveGoal}`,
      `Audience: ${effectiveAudience}`,
      `Desired energy: ${effectiveEnergy}`,
      releaseContext
        ? `Release context (optional): ${releaseContext}`
        : `Release context: not specified`,
      ``,
      `Task: Propose 4 highly actionable trend-aligned content ideas that feel native to ${platform}.`,
      `These are NOT generic trends like “use trending sound”; instead they are specific, programmable content ideas with:`,
      `- A name (short label)`,
      `- A description of what the post looks/feels like`,
      `- Why it fits this artist + audience`,
      `- A hook template (the first line / idea opener)`,
      `- Suggested visuals (camera framing, location, props, motion)`,
      `- Suggested caption angle`,
      `- Suggested hashtags (split into core + niche)`,
      ``,
      `Also include a "fit_score" from 0–100 describing how well the idea matches the described genre, audience and goal.`,
      ``,
      `IMPORTANT FORMAT:`,
      `Return ONLY valid JSON (no backticks, no markdown).`,
      `Shape:`,
      `{"platform": "...", "summary": "...", "trends": [ { "name": "...", "type": "...", "fit_score": 87, "description": "...", "why_it_fits": "...", "hook_template": "...", "suggested_visuals": "...", "caption_angle": "...", "hashtags": { "core": ["tag"], "niche": ["tag"] } } ] }`,
    ].join('\n')

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              // 🔴 this was `type: 'text'` before – now fixed:
              type: 'input_text',
              text: prompt,
            },
          ],
        },
      ],
    })

    // Safely extract the text from the Responses API
    let rawText = ''
    const anyRes = response as any

    if (anyRes.output?.[0]?.content?.[0]?.text) {
      rawText = anyRes.output[0].content[0].text as string
    } else if (typeof anyRes.output_text === 'function') {
      rawText = await anyRes.output_text()
    }

    let parsed: any
    try {
      parsed = rawText ? JSON.parse(rawText) : { trends: [] }
    } catch {
      parsed = { trends: [], raw: rawText }
    }

    if (!Array.isArray(parsed.trends)) {
      parsed.trends = []
    }

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('[trends] error', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to generate trends' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, ping: 'trends alive' })
}
