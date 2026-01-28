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
      peerSourceMode,
      peerArtists,
      peerVibe,
      peerFocus,
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
    const effectiveArtist = artistName || 'the artist'
    const effectiveVibe = peerVibe || 'not specified'

    // Manual vs AI-chosen artists
    const manualArtists =
      typeof peerArtists === 'string'
        ? peerArtists
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : []

    const sourceMode: 'manual' | 'ai' =
      peerSourceMode === 'ai' ? 'ai' : 'manual'

    const focus = {
      pillars: peerFocus?.pillars !== false, // default true
      hooks: peerFocus?.hooks !== false,
      visuals: peerFocus?.visuals !== false,
      cadence: !!peerFocus?.cadence,
    }

    const focusLines: string[] = []
    if (focus.pillars) focusLines.push('- Content pillars & recurring formats')
    if (focus.hooks) focusLines.push('- Hooks & caption style')
    if (focus.visuals) focusLines.push('- Visual language & framing')
    if (focus.cadence) focusLines.push('- Posting rhythm & release cadence')

    const artistSourceText =
      sourceMode === 'manual' && manualArtists.length
        ? `Reference artists to analyse in depth:\n${manualArtists
            .map((a) => `- ${a}`)
            .join('\n')}`
        : `No explicit reference artists were provided. First, choose 3–5 well-known or representative artists for this lane (based on platform, genre, audience and vibe), then base your analysis on them.`

    const prompt = [
      `You are an expert social strategist for independent music artists.`,
      ``,
      `Artist context:`,
      `- Working artist name: ${effectiveArtist}`,
      `- Platform: ${platform}`,
      `- Genre / lane: ${effectiveGenre}`,
      `- Campaign goal: ${effectiveGoal}`,
      `- Audience: ${effectiveAudience}`,
      `- Vibe / brand keywords: ${effectiveVibe}`,
      ``,
      artistSourceText,
      ``,
      `The user wants to study "peers" — artists operating in a similar lane — to understand how they move on ${platform}.`,
      ``,
      `Focus on the following aspects (only emphasise those listed):`,
      focusLines.length
        ? focusLines.join('\n')
        : '- Use your best judgement to cover pillars, hooks, visuals and cadence.',
      ``,
      `Your job:`,
      `1) Identify a small set of peer artists.`,
      `2) For each artist, summarise key patterns in their content.`,
      `3) Synthesize what this means for the user's artist project.`,
      ``,
      `Return ONLY valid JSON. Do NOT include markdown, backticks, or commentary.`,
      ``,
      `STRICT JSON SHAPE:`,
      `{`,
      `  "platform": "TikTok",`,
      `  "reference_artists_used": ["Artist A", "Artist B"],`,
      `  "summary": "High-level summary of how this lane behaves on the platform.",`,
      `  "artists": [`,
      `    {`,
      `      "name": "Artist A",`,
      `      "positioning": "One-line on how they sit in the lane.",`,
      `      "content_pillars": ["pillar one", "pillar two"],`,
      `      "hook_patterns": ["question-led openers", "mid-story drops"],`,
      `      "visual_language": "Camera, locations, colours, textures, editing feel.",`,
      `      "cadence": "How often they seem to post / when they cluster content.",`,
      `      "stealable_structures": [`,
      `        "Three-beat story format you could adapt",`,
      `        "Studio confession style piece you could adapt"`,
      `      ]`,
      `    }`,
      `  ],`,
      `  "for_you": {`,
      `    "suggested_pillars": ["pillar A tailored to user", "pillar B tailored to user"],`,
      `    "format_starters": [`,
      `      "specific content prompt this artist could shoot this week",`,
      `      "another specific content prompt"`,
      `    ],`,
      `    "warnings": [`,
      `      "where copying would feel inauthentic",`,
      `      "platform or audience pitfalls to avoid"`,
      `    ]`,
      `  }`,
      `}`,
      ``,
      `If you are uncertain about real-world data, you may answer based on typical patterns in this lane — but still stick to the schema and make it practically useful.`,
    ].join('\n')

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              // IMPORTANT: must be "input_text" (not "text")
              type: 'input_text',
              text: prompt,
            },
          ],
        },
      ],
    })

    // Extract text from Responses API
    let rawText = ''
    const anyRes = response as any

    if (anyRes.output?.[0]?.content?.[0]?.text) {
      rawText = anyRes.output[0].content[0].text as string
    } else if (typeof anyRes.output_text === 'function') {
      rawText = await anyRes.output_text()
    }

    let parsed: any
    try {
      parsed = rawText ? JSON.parse(rawText) : {}
    } catch {
      parsed = { raw: rawText }
    }

    // Basic safety: ensure we always send a predictable shape
    if (!Array.isArray(parsed.artists)) {
      parsed.artists = []
    }
    if (!Array.isArray(parsed.reference_artists_used)) {
      parsed.reference_artists_used = manualArtists
    }
    if (!parsed.platform) {
      parsed.platform = platform
    }

    return NextResponse.json(parsed)
  } catch (err: any) {
    console.error('[peers] error', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to run Peer Radar' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, ping: 'peers alive' })
}
