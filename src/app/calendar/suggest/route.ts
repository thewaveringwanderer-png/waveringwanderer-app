import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// We read latest kit globally. For strict per-user scoping,
// send userId from the client and add `.eq('user_id', userId)`.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json() as any
    const { mode, dates } = body as { mode: 'kit' | 'release', dates: string[] }

    if (!Array.isArray(dates) || dates.length !== 7) {
      return NextResponse.json({ error: 'need 7 dates' }, { status: 400 })
    }

    let context = ''
    if (mode === 'kit') {
      const { data: kits } = await supabase
        .from('identity_kits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
      const kit = kits?.[0]?.result ?? {}
      context = `LATEST IDENTITY KIT (truncated JSON):
${JSON.stringify(kit).slice(0, 5000)}`
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
      temperature: 0.7
    })

    const text = completion.output_text || ''
    const match = text.match(/\[[\s\S]*\]/)
    let out: any[] = []
    if (match) {
      try { out = JSON.parse(match[0]) } catch {}
    }
    if (!Array.isArray(out) || out.length !== dates.length) {
      out = dates.map((d, i) => ({
        date: d,
        title: `Post ${i+1} — brand moment`,
        platform: i % 2 === 0 ? 'Instagram' : 'TikTok',
        notes: 'Fallback suggestion (parser failed).'
      }))
    }

    return NextResponse.json(out)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'suggest-failed' }, { status: 500 })
  }
}

