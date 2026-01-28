import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { mode } = body

    // ---------- GENERATE ----------
    if (mode === 'generate') {
      const {
        sourceKind,
        artistName,
        platform,
        topic,
        imageHint,
        keywords,
        tone,
        variantCount,
        includeHashtags,
      } = body

      const prompt = `
You are a social-media caption writer for a music artist.
Generate ${variantCount} highly engaging, human captions.

Artist: ${artistName || 'Unknown'}
Platform: ${platform}
Source kind: ${sourceKind || '—'}
Tone: ${tone}
Topic: ${topic}

Keywords: ${keywords || '—'}
Image hint: ${imageHint || '—'}
Include hashtags: ${includeHashtags ? 'yes' : 'no'}

Return STRICT JSON in this **exact** format:

{
  "variants": [
    {
      "text": "full caption with line breaks as needed",
      "hashtags": {
        "core": ["tag1", "tag2"],
        "niche": ["tag3"]
      }
    }
  ]
}

Rules:
- Do NOT wrap JSON in backticks.
- Do NOT include commentary or explanations.
- If hashtags should be off, set "core" and "niche" to empty arrays.
      `.trim()

      const completion = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
      })

      const raw = completion.choices[0].message?.content || '{}'

      // Try to extract the JSON block safely
      const jsonStart = raw.indexOf('{')
      const jsonEnd = raw.lastIndexOf('}')
      const clean = raw.substring(jsonStart, jsonEnd + 1)

      const parsed = JSON.parse(clean)

      return NextResponse.json(parsed)
    }

    // ---------- POLISH ----------
    if (mode === 'polish') {
      const { text, platform, goal } = body

      const prompt = `
You are a caption editor.

Platform: ${platform}
Goal: ${goal}

Improve this caption without changing its meaning:

"${text}"

Return ONLY JSON in this format:

{
  "improved": "new version...",
  "reasoning": "what you changed and why"
}
      `.trim()

      const completion = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      })

      const raw = completion.choices[0].message?.content || '{}'
      const jsonStart = raw.indexOf('{')
      const jsonEnd = raw.lastIndexOf('}')
      const clean = raw.substring(jsonStart, jsonEnd + 1)

      const parsed = JSON.parse(clean)

      return NextResponse.json(parsed)
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
  } catch (err: any) {
    console.error('API ERROR /captions:', err)
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
