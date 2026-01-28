import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

type Mode = 'kit' | 'release'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !anon) return null
  return createClient(url, anon)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      mode?: Mode
      dates?: string[]
      release?: { title?: string; status?: 'unreleased' | 'released'; date?: string; goals?: string }
    }

    const mode = body.mode
    const dates = body.dates

    if (mode !== 'kit' && mode !== 'release') {
      return NextResponse.json({ error: 'invalid mode' }, { status: 400 })
    }

    if (!Array.isArray(dates) || dates.length !== 7) {
      return NextResponse.json({ error: 'need 7 dates' }, { status: 400 })
    }

    // --- Build-safe: create clients INSIDE the request handler ---
    const supabase = getSupabase()
    const apiKey = process.env.OPENAI_API_KEY

    // If either is missing, return a usable fallback (don’t crash build)
    if (!apiKey) {
      const fallback = dates.map((d, i) => ({
        date: d,
        title: `Post ${i + 1} — brand moment`,
        platform: i % 2 === 0 ? 'Instagram' : 'TikTok',
        notes: 'Fallback: OPENAI_API_KEY not set on server.',
      }))
      return NextResponse.json(fallback)
    }

    const openai = new OpenAI({ apiKey })

    let context = ''

    if (mode === 'kit') {
      if (!supabase) {
        context = 'LATEST IDENTITY KIT: (unavailable — missing SUPABASE env on server)'
      } else {
        const { data: kits } = await supabase
          .from('identity_kits')
          .select('result, created_at')
          .order('created_at', { ascending: false })
          .limit(1)

        const kit = kits?.[0]?.result ?? {}
        context = `LATEST IDENTITY KIT (truncated JSON):\n${JSON.stringify(kit).slice(0, 5000)}`
      }
    } else {
      const rel = body.release || {}
      context = `RELEASE BRIEF:
Title: ${rel.title || 'Untitled'}
Status: ${rel.status || 'unreleased'} (date: ${rel.date || 'TBD'})
Goals: ${rel.goals || 'grow saves/streams, UGC, discovery'}`
    }

    const flavor =
      mode === 'release'
        ? `If status=unreleased, design a ladder of teasers leading TO the target date.
If status=released, design a post-release amplification week after the date (remixes, live moments, UGC prompts).
Spread platforms naturally.`
        : `Use the brand’s voice, audience persona, and content pillars to craft a cohesive week.`

    const prompt = `
You are a music social strategist. Create a 7-day plan, strictly one post per date below.
Return STRICT JSON array of 7 objects:
{ "date": "YYYY-MM-DD", "title": string, "platform": "Instagram|TikTok|YouTube|X/Twitter", "notes": string }

DATES:
${dates.join(', ')}

${flavor}

Keep titles concise and scroll-stopping. Notes should include the hook/angle and any shot or caption guidance.

CONTEXT:
${context}
`.trim()

    const completion = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.7,
    })

    const text = completion.output_text || ''
    const match = text.match(/\[[\s\S]*\]/)

    let out: unknown = []
    if (match) {
      try {
        out = JSON.parse(match[0])
      } catch {}
    }

    if (!Array.isArray(out) || out.length !== dates.length) {
      out = dates.map((d, i) => ({
        date: d,
        title: `Post ${i + 1} — brand moment`,
        platform: i % 2 === 0 ? 'Instagram' : 'TikTok',
        notes: 'Fallback: parser failed.',
      }))
    }

    return NextResponse.json(out)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'suggest-failed' }, { status: 500 })
  }
}
