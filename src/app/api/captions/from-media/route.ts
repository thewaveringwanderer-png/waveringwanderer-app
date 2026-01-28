import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs' // ensure we can access Buffers/FormData parsing

type CaptionsResult = {
  variants: string[]
  hashtags: { core: string[]; niche: string[]; banned: string[] }
  notes?: string
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ ok: false, error: 'Missing OPENAI_API_KEY' }, { status: 500 })
    }

    const form = await req.formData()
    const file = form.get('file') as File | null
    const platform = String(form.get('platform') || 'Instagram')
    const artistName = String(form.get('artistName') || '')
    const topic = String(form.get('topic') || '')
    const tone = String(form.get('tone') || 'brand-consistent, concise, human, engaging')
    const variants = Number(form.get('variants') || 4)
    const includeHashtags = String(form.get('includeHashtags') || 'true') === 'true'

    if (!file) {
      return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 })
    }

    // convert to base64 data URL for vision
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type || 'image/jpeg'};base64,${base64}`

    const platformGuidance: Record<string, string> = {
      Instagram:
        'Keep 1–2 short lines max, line breaks ok. CTA can be soft. Emojis minimal and relevant.',
      TikTok:
        'Hook in the first line. Punchy and playful. Avoid walls of text. Emojis OK but not spammy.',
      YouTube:
        '1–2 teaser lines for description opening. No clickbait. Suggest a save/share CTA.',
      X: 'Short, high-signal. 1 concise idea. Avoid overusing hashtags (0–2).',
      Facebook:
        '1–2 compact sentences. Friendly tone, clear CTA. Emojis sparse. Keep it scannable.',
    }
    const platformTip =
      platformGuidance[platform as keyof typeof platformGuidance] ??
      'Short, high-signal, human. Avoid spammy emoji/hashtags.'

    const count = clamp(variants || 4, 2, 6)

    const prompt = [
      'You are a senior music marketing copywriter + visual strategist.',
      'Analyze the provided image and write platform-native captions that reflect the visual content, the artist context, and the desired tone.',
      '',
      `Artist: ${artistName || '—'}`,
      `Platform: ${platform}`,
      `Topic (optional): ${topic || '—'}`,
      `Tone: ${tone}`,
      '',
      `Write ${count} distinct captions tailored to ${platform}.`,
      platformTip,
      'No ALL CAPS. Avoid clichés. Keep each variant self-contained and human.',
      includeHashtags
        ? 'Return platform-appropriate hashtags in core and niche groups. Place tags only in the hashtags object, not inside the variants unless natural.'
        : 'Return empty arrays for hashtags.',
      '',
      'Return ONLY a JSON object with this exact shape:',
      `{
  "variants": ["string", "string", ...], 
  "hashtags": {
    "core": ["#tag", ...], 
    "niche": ["#tag", ...], 
    "banned": ["#tag", ...]
  },
  "notes": "optional string"
}`,
    ].join('\n')

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // Vision via Chat Completions: text + image data URL
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are an expert music marketing copywriter and visual analyst.' },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ] as any,
        },
      ],
    })

    const text = completion.choices?.[0]?.message?.content || '{}'
    let data: CaptionsResult | null = null
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }

    if (
      !data ||
      !Array.isArray(data.variants) ||
      !data.hashtags ||
      !Array.isArray(data.hashtags.core) ||
      !Array.isArray(data.hashtags.niche) ||
      !Array.isArray(data.hashtags.banned)
    ) {
      throw new Error('Model returned an unexpected shape.')
    }

    data.variants = data.variants.map(v => (typeof v === 'string' ? v.trim() : '')).filter(Boolean)

    return NextResponse.json({ ok: true, result: data })
  } catch (e: any) {
    console.error('[captions/from-media]', e?.message || e)
    const fallback: CaptionsResult = {
      variants: [
        'Visual-led post — moody, cinematic framing. Keep copy minimal and evocative.',
        'Alt: lean into texture and atmosphere; invite saves/shares subtly.',
      ],
      hashtags: {
        core: ['#music', '#newmusic', '#artist'],
        niche: ['#indiemusic', '#underground', '#waveringwanderers'],
        banned: [],
      },
      notes: 'Fallback due to AI error.',
    }
    return NextResponse.json({ ok: true, result: fallback, _fallback: true })
  }
}
