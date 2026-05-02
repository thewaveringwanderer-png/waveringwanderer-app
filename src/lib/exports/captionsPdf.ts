// src/lib/exports/captionsPdf.ts
import type { PdfLine } from '@/lib/wwPdf'
import { buildStandardHeader, normalizeText } from '@/lib/wwPdf'

type CaptionVariant = {
  text: string
  hashtags?: {
    core?: string[]
    niche?: string[]
  }
}

export function buildCaptionPdfLines(args: {
  artistName: string
  platform: string
  topic: string
  tone: string
  variantLabel: string
  captionText: string
  hashtags?: { core?: string[]; niche?: string[] }
}): PdfLine[] {
  const { artistName, platform, topic, tone, variantLabel, captionText, hashtags } = args

  const lines: PdfLine[] = [
    ...buildStandardHeader({
      title: 'Captions & Hashtags',
      subtitle: [artistName, platform ? `Platform: ${platform}` : '', topic ? `Topic: ${topic}` : '']
        .filter(Boolean)
        .map(normalizeText)
        .join(' • '),
    }),
  ]

  lines.push({ kind: 'sectionTitle', text: variantLabel })
  lines.push({ kind: 'body', text: normalizeText(captionText || '') })

  if (tone) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Tone' })
    lines.push({ kind: 'body', text: normalizeText(tone) })
  }

  const core = (hashtags?.core || []).filter(Boolean)
  const niche = (hashtags?.niche || []).filter(Boolean)

  if (core.length || niche.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Hashtags' })

    const chunks: string[] = []
    if (core.length) chunks.push(`Core: ${core.map(t => `#${t}`).join(' ')}`)
    if (niche.length) chunks.push(`Niche: ${niche.map(t => `#${t}`).join(' ')}`)

    lines.push({ kind: 'body', text: chunks.join('\n') })
  }

  return lines
}

export function buildAllCaptionsPdfLines(args: {
  artistName: string
  platform: string
  topic: string
  tone: string
  variants: CaptionVariant[]
}): PdfLine[] {
  const { artistName, platform, topic, tone, variants } = args

  const lines: PdfLine[] = [
    ...buildStandardHeader({
      title: 'Captions & Hashtags',
      subtitle: [artistName, platform ? `Platform: ${platform}` : '', topic ? `Topic: ${topic}` : '']
        .filter(Boolean)
        .map(normalizeText)
        .join(' • '),
    }),
  ]

  if (tone) {
    lines.push({ kind: 'sectionTitle', text: 'Tone' })
    lines.push({ kind: 'body', text: normalizeText(tone) })
    lines.push({ kind: 'divider' })
  }

  variants.forEach((v, idx) => {
    lines.push({ kind: 'sectionTitle', text: `Variant ${idx + 1}` })
    lines.push({ kind: 'body', text: normalizeText(v.text || '') })

    const core = (v.hashtags?.core || []).filter(Boolean)
    const niche = (v.hashtags?.niche || []).filter(Boolean)

    if (core.length || niche.length) {
      lines.push({ kind: 'sectionTitle', text: 'Hashtags' })

      const blocks: string[] = []
      if (core.length) blocks.push(`Core: ${core.map(t => `#${t}`).join(' ')}`)
      if (niche.length) blocks.push(`Niche: ${niche.map(t => `#${t}`).join(' ')}`)

      lines.push({ kind: 'body', text: blocks.join('\n') })
    }

    if (idx !== variants.length - 1) {
      lines.push({ kind: 'divider' })
    }
  })

  return lines
}