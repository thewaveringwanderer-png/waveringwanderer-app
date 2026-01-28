import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

type PolishResult = {
  polished: string
  explanation?: string
}

export async function POST(req: Request) {
  try {
    const { caption, platform, tone, keepEmojis } = await req.json()

    if (!caption || typeof caption !== 'string') {
      return NextResponse.json(
        { error: 'Caption is required' },
        { status: 400 }
      )
    }

    const system = [
      'You are a senior social copy editor for music artists.',
      'Keep the original meaning and rough voice,',
      'but improve rhythm, clarity, and emotional pull.',
      'Avoid generic AI language, avoid shouty ALL CAPS.',
      'Keep it human, specific, and scroll-stopping.',
    ].join(' ')

    const user = [
      `Platform: ${platform || 'unspecified'}`,
      `Polish brief: ${tone || 'keep my tone, just clean it up'}`,
      keepEmojis
        ? 'Keep emojis where they add flavour, but remove any that feel noisy.'
        : 'Remove emojis unless absolutely necessary.',
      '',
      'Original caption:',
      caption,
      '',
      'Return ONLY JSON with this shape:',
      '{ "polished": string, "explanation": string }',
    ].join('\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'CaptionPolish',
          schema: {
            type: 'object',
            properties: {
              polished: { type: 'string' },
              explanation: { type: 'string' },
            },
            required: ['polished'],
            additionalProperties: false,
          },
        },
      },
    })

    const message = completion.choices[0].message.content
    if (!message) {
      throw new Error('No content from model')
    }

    const parsed = JSON.parse(message) as PolishResult
    return NextResponse.json(parsed)
  } catch (e: any) {
    console.error('[captions/polish] error', e)
    return NextResponse.json(
      { error: 'Failed to polish caption' },
      { status: 500 }
    )
  }
}
