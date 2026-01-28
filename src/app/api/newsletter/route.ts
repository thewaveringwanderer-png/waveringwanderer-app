// src/app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Extract text from OpenAI Responses API output.
 * Supports:
 * - resp.output[0].content[*] items (output_text)
 * - resp.output_text (legacy convenience)
 * - plain string fallback
 */
function extractText(resp: any): string {
  try {
    // New-ish Responses API shape: output: [{ content: [{ type: 'output_text', text: { value } | string }] }]
    const out0 = resp?.output?.[0]
    const content = out0?.content
    if (Array.isArray(content)) {
      // Prefer first output_text
      const firstText = content.find((c: any) => c?.type === 'output_text')
      if (firstText) {
        const t = firstText.text
        if (typeof t === 'string') return t
        if (t?.value) return t.value
      }

      // Fallback: concatenate any string-ish parts
      const parts: string[] = []
      for (const c of content) {
        if (c?.type === 'output_text') {
          const t = c.text
          if (typeof t === 'string') parts.push(t)
          else if (t?.value) parts.push(t.value)
        } else if (typeof c?.text === 'string') {
          parts.push(c.text)
        } else if (typeof c === 'string') {
          parts.push(c)
        }
      }
      if (parts.length) return parts.join('\n')
    }

    // Some SDKs expose output_text directly
    if (typeof resp?.output_text === 'string') return resp.output_text

    // Total fallback
    if (typeof resp === 'string') return resp
  } catch {
    // ignore
  }
  return ''
}

/**
 * Robust JSON parse:
 * - tries direct JSON.parse(text)
 * - tries extracting the first {...} block
 * - tries extracting ```json ... ``` fenced block
 */
function parseModelJson(text: string) {
  const raw = (text || '').trim()
  if (!raw) return null

  // 1) direct
  try {
    return JSON.parse(raw)
  } catch {
    // continue
  }

  // 2) fenced ```json ... ```
  const fence = raw.match(/```json\s*([\s\S]*?)\s*```/i)
  if (fence?.[1]) {
    try {
      return JSON.parse(fence[1])
    } catch {
      // continue
    }
  }

  // 3) first object-like block
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    const candidate = raw.slice(start, end + 1)
    try {
      return JSON.parse(candidate)
    } catch {
      // continue
    }
  }

  // 4) first array-like block (used by themeIdeas)
  const aStart = raw.indexOf('[')
  const aEnd = raw.lastIndexOf(']')
  if (aStart !== -1 && aEnd !== -1 && aEnd > aStart) {
    const candidate = raw.slice(aStart, aEnd + 1)
    try {
      return JSON.parse(candidate)
    } catch {
      // continue
    }
  }

  return null
}

function validateKeys(obj: any, keys: string[], label: string) {
  if (!obj || typeof obj !== 'object') {
    throw new Error(`Unexpected ${label} format from model`)
  }
  for (const k of keys) {
    if (!(k in obj)) {
      throw new Error(`Missing "${k}" in ${label} JSON from model`)
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const mode = body.mode as
      | 'outline'
      | 'outlineAssist'
      | 'themeIdeas'
      | 'subjectHook'
      | 'fullEmail'

    if (!mode) {
      return NextResponse.json({ error: 'Missing mode' }, { status: 400 })
    }

    switch (mode) {
      case 'outline': {
        const {
          targetDescription,
          cadence,
          primaryGoal,
          voiceAndVibe,
          mainTheme,
          extraContext,
        } = body

        const prompt = `
You are Wavering Wanderers' newsletter strategist, helping independent artists plan email newsletters.

Given:
- Target: ${targetDescription || 'n/a'}
- Cadence: ${cadence || 'n/a'}
- Primary goal: ${primaryGoal || 'n/a'}
- Voice & vibe: ${voiceAndVibe || 'n/a'}
- Key theme / story: ${mainTheme || 'n/a'}
- Extra context: ${extraContext || 'n/a'}

Return a pure JSON object (no markdown) with this shape:

{
  "ideas": [
    {
      "id": 1,
      "title": "Direction name",
      "subjectLine": "A strong subject idea",
      "summary": "2–3 sentences overview.",
      "cadencePlan": ["bullet line 1", "bullet line 2"],
      "segments": ["segment description 1", "segment description 2"],
      "valueSections": [
        {
          "heading": "Section heading",
          "bullets": ["bullet 1", "bullet 2"]
        }
      ],
      "ctas": ["CTA example 1", "CTA example 2"],
      "metrics": ["Metric 1", "Metric 2"]
    }
  ]
}

All numbers should be plausible and not hyper-inflated. Avoid made-up press outlet names.
ONLY output JSON.
`.trim()

        const response = await client.responses.create({
          model: 'gpt-4.1-mini',
          input: prompt,
        })

        const text = extractText(response)
        const outline = parseModelJson(text)

        if (!outline || !Array.isArray((outline as any).ideas)) {
          throw new Error('Failed to parse outline JSON from model')
        }

        return NextResponse.json({ outline })
      }

      case 'outlineAssist': {
        const { profile, current } = body

        const prompt = `
You are Wavering Wanderers' assistant. Help refine and lightly expand newsletter planning inputs.

Profile (may be partial):
${JSON.stringify(profile || {}, null, 2)}

Current inputs (may be empty strings):
${JSON.stringify(current || {}, null, 2)}

Return a pure JSON object ONLY with this shape, filling in missing or weak fields based on the profile:

{
  "targetDescription": "who this is really for",
  "cadence": "suggested cadence wording",
  "primaryGoal": "clear, artist-relevant goal",
  "voiceAndVibe": "voice description",
  "mainTheme": "coherent key theme idea",
  "extraContext": "any helpful additional notes"
}

Do not invent fake stats or specific press claims. Keep it grounded and label-ready.
ONLY output JSON.
`.trim()

        const response = await client.responses.create({
          model: 'gpt-4.1-mini',
          input: prompt,
        })

        const text = extractText(response)
        const patch = parseModelJson(text)

        if (!patch || typeof patch !== 'object') {
          throw new Error('Failed to parse outlineAssist JSON from model')
        }

        return NextResponse.json({ patch })
      }

      case 'themeIdeas': {
        const { targetDescription, primaryGoal, extraContext } = body

        const prompt = `
You are Wavering Wanderers' newsletter strategist.

Suggest 4–6 strong key themes or story ideas for an artist newsletter.

Target: ${targetDescription || 'n/a'}
Primary goal: ${primaryGoal || 'n/a'}
Extra context: ${extraContext || 'n/a'}

Return a JSON array of short string ideas, like:
["Idea 1", "Idea 2", "Idea 3"]

ONLY output JSON.
`.trim()

        const response = await client.responses.create({
          model: 'gpt-4.1-mini',
          input: prompt,
        })

        const text = extractText(response)
        const themes = parseModelJson(text)

        if (!Array.isArray(themes)) {
          throw new Error('Failed to parse themeIdeas JSON from model')
        }

        return NextResponse.json({ themes })
      }

      case 'subjectHook': {
        const {
          targetDescription,
          primaryGoal,
          mainTheme,
          extraContext,
          fromOutline,
        } = body

        const prompt = `
You are Wavering Wanderers' email copywriter.

Write a subject line and a 1–2 sentence hook for a newsletter.

Inputs:
- Target: ${targetDescription || 'n/a'}
- Primary goal: ${primaryGoal || 'n/a'}
- Theme: ${mainTheme || 'n/a'}
- Extra context: ${extraContext || 'n/a'}
- From outline direction (optional): ${JSON.stringify(fromOutline || null, null, 2)}

Return pure JSON ONLY:
{
  "subject": "Subject line",
  "hook": "Short hook"
}

ONLY output JSON.
`.trim()

        const response = await client.responses.create({
          model: 'gpt-4.1-mini',
          input: prompt,
        })

        const text = extractText(response)
        const parsed = parseModelJson(text)

        if (!parsed) {
          throw new Error('Failed to parse subjectHook JSON from model')
        }

        validateKeys(parsed, ['subject', 'hook'], 'subjectHook')

        return NextResponse.json({
          subject: String((parsed as any).subject ?? ''),
          hook: String((parsed as any).hook ?? ''),
        })
      }

      case 'fullEmail': {
        const { subject, hook, audience, offer, additionalNotes, fromOutline } =
          body

        const prompt = `
You are Wavering Wanderers' in-house copywriter.

Draft a full newsletter email for an independent artist.
Keep it human, grounded and slightly cinematic, not salesy.
Paragraph spacing should be email-friendly (no giant blocks).

Inputs:
- Subject: ${subject || 'n/a'}
- Hook: ${hook || 'n/a'}
- Audience: ${audience || 'n/a'}
- Main offer / action: ${offer || 'n/a'}
- Additional notes: ${additionalNotes || 'n/a'}
- Outline direction (optional): ${JSON.stringify(fromOutline || null, null, 2)}

Return pure JSON with this exact shape:

{
  "subject": "Final subject line",
  "preheader": "Short preheader that complements the subject",
  "intro": "Opening paragraph in first person from the artist",
  "sections": [
    { "heading": "Section heading", "body": "1–3 short paragraphs" }
  ],
  "closing": "A warm closing, signed off by the artist",
  "ps": "Optional P.S. line (or null/empty)"
}

Do not include any markdown or extra commentary, only JSON.
ONLY output JSON.
`.trim()

        const response = await client.responses.create({
          model: 'gpt-4.1-mini',
          input: prompt,
        })

        const text = extractText(response)
        const email = parseModelJson(text)

        if (!email) {
          throw new Error('Failed to parse fullEmail JSON from model')
        }

        // Light validation so UI doesn’t explode
        validateKeys(email, ['subject', 'preheader', 'intro', 'sections', 'closing'], 'fullEmail')

        return NextResponse.json({ email })
      }

      default:
        return NextResponse.json(
          { error: `Unsupported mode: ${mode}` },
          { status: 400 }
        )
    }
  } catch (e: any) {
    console.error('[newsletter-api]', e)
    return NextResponse.json(
      { error: e?.message || 'Failed to process newsletter request' },
      { status: 400 }
    )
  }
}
