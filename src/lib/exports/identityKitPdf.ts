// src/lib/exports/identityKitPdf.ts
import { normalizeText, type PdfLine } from '@/lib/wwPdf'

function pushList(lines: PdfLine[], items: any[], prefix = '• ') {
  if (!Array.isArray(items) || items.length === 0) return
  for (const it of items) {
    const text = normalizeText(String(it ?? ''))
    if (!text) continue
    lines.push({ kind: 'body', text: `${prefix}${text}` })
  }
}

export function buildIdentityKitPdfLines(
  result: any,
  inputs: {
    artistName?: string
    genre?: string
    audience?: string
    goal?: string
    influences?: string
    brandWords?: string
  }
): PdfLine[] {
  const lines: PdfLine[] = []

  const title = inputs.artistName ? `${inputs.artistName} — Identity Kit` : 'Identity Kit'
  lines.push({ kind: 'title', text: normalizeText(title) })

  const subtitleParts: string[] = []
  if (inputs.genre) subtitleParts.push(normalizeText(inputs.genre))
  if (inputs.audience) subtitleParts.push(`Audience: ${normalizeText(inputs.audience)}`)
  if (inputs.goal) subtitleParts.push(`Goal: ${normalizeText(inputs.goal)}`)

  lines.push({
    kind: 'subtitle',
    text: subtitleParts.length ? subtitleParts.join(' • ') : 'Wavering Wanderers export',
  })

  lines.push({ kind: 'divider' })
  lines.push({ kind: 'sectionTitle', text: 'Inputs' })
  if (inputs.influences) lines.push({ kind: 'body', text: `Influences: ${normalizeText(inputs.influences)}` })
  if (inputs.brandWords) lines.push({ kind: 'body', text: `Brand words: ${normalizeText(inputs.brandWords)}` })

  lines.push({ kind: 'divider' })
  lines.push({ kind: 'sectionTitle', text: 'Core' })
  if (result?.brand_essence) lines.push({ kind: 'body', text: `Brand essence: ${normalizeText(result.brand_essence)}` })
  if (result?.one_line_positioning) lines.push({ kind: 'body', text: `Positioning: ${normalizeText(result.one_line_positioning)}` })
  if (result?.bio_short) lines.push({ kind: 'body', text: `Bio: ${normalizeText(result.bio_short)}` })

  // keep it short for now — can expand after it compiles
  if (Array.isArray(result?.release_plan_90d) && result.release_plan_90d.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: '90-day plan' })
    for (const w of result.release_plan_90d) {
      const week = normalizeText(w?.week || '')
      const focus = normalizeText(w?.focus || '')
      if (week || focus) lines.push({ kind: 'body', text: `${week}${week && focus ? ' — ' : ''}${focus}` })
      if (Array.isArray(w?.tasks) && w.tasks.length) pushList(lines, w.tasks, '  • ')
    }
  }

  return lines
}
