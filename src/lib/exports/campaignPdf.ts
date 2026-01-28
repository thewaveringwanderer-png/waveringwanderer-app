// src/lib/exports/campaignPdf.ts
import { normalizeText, type PdfLine, buildStandardHeader, twoColSection } from '@/lib/wwPdf'


type CampaignVisualDirection = {
  shotlist?: string[]
  palette?: string[]
  props?: string[]
}

export type CampaignTimeline = {
  teasers?: string[]
  drop_day?: string[]
  post_drop?: string[]
}

export type CampaignConcept = {
  name?: string
  hook?: string
  synopsis?: string
  visual_direction?: CampaignVisualDirection
  deliverables?: string[]
  caption_tones?: string[]
  timeline?: CampaignTimeline
}

export type Campaigns = {
  concepts?: CampaignConcept[]
  kpis?: string[]
  hashtags?: string[]
  _fallback?: boolean
}

type Meta = {
  artistName?: string
  genre?: string
  audience?: string
  goal?: string
  influences?: string
  brandWords?: string
}

function asList(x: any): string[] {
  if (!Array.isArray(x)) return []
  return x.map(v => normalizeText(String(v ?? ''))).filter(Boolean)
}

function pushSpacer(lines: PdfLine[], n = 1, h = 16) {
  for (let i = 0; i < n; i++) lines.push({ kind: 'spacer', height: h } as any)
}

function pushDivider(lines: PdfLine[]) {
  lines.push({ kind: 'divider' } as any)
}


function pushBody(lines: PdfLine[], text: any) {
  const t = normalizeText(String(text ?? ''))
  if (!t) return
  lines.push({ kind: 'body', text: t })
}

function pushBullets(lines: PdfLine[], items: any[], prefix = '• ') {
  const arr = asList(items)
  if (!arr.length) return
  for (const it of arr) lines.push({ kind: 'body', text: `${prefix}${it}` })
}

function safeTitle(s: any, fallback: string) {
  const t = normalizeText(String(s ?? ''))
  return t || fallback
}

export function buildCampaignPdfLines(
  campaigns: Campaigns,
  meta: Meta = {},
  opts?: { onlyConceptIndex?: number }
): PdfLine[] {
  const lines: PdfLine[] = []

  const artistName = meta.artistName || 'Artist'

  // ✅ Premium header (title + subtitle + meta box + divider)
  const subtitleParts: string[] = []
  if (meta.genre) subtitleParts.push(normalizeText(meta.genre))
  if (meta.audience) subtitleParts.push(`Audience: ${normalizeText(meta.audience)}`)
  if (meta.goal) subtitleParts.push(`Goal: ${normalizeText(meta.goal)}`)

  lines.push(
    ...buildStandardHeader({
      title: `${artistName} — Campaign Concepts`,
      subtitle: subtitleParts.length ? subtitleParts.join(' • ') : 'Wavering Wanderers export',
      meta: [
        meta.genre ? { label: 'Genre', value: meta.genre } : null,
        meta.audience ? { label: 'Audience', value: meta.audience } : null,
        meta.goal ? { label: 'Goal', value: meta.goal } : null,
        meta.influences ? { label: 'Influences', value: meta.influences } : null,
        meta.brandWords ? { label: 'Brand words', value: meta.brandWords } : null,
        campaigns?._fallback ? { label: 'Note', value: 'Fallback export used (no API key / repair).' } : null,
      ].filter(Boolean) as any,
    })
  )

  pushSpacer(lines, 1)

  const all = Array.isArray(campaigns?.concepts) ? campaigns.concepts : []
  const picked = 
  
    typeof opts?.onlyConceptIndex === 'number'
      ? all.slice(opts.onlyConceptIndex, opts.onlyConceptIndex + 1)
      : all

  if (!picked.length) {
    lines.push({ kind: 'sectionTitle', text: 'No concepts found' })
    lines.push({ kind: 'body', text: 'Generate campaign concepts first.' })
    return lines
  }

  picked.forEach((c, idx) => {
    const conceptNumber =
      typeof opts?.onlyConceptIndex === 'number' ? (opts.onlyConceptIndex as number) + 1 : idx + 1

    // ✅ Concept title
    lines.push({
      kind: 'sectionTitle',
      text: `Concept ${conceptNumber}: ${safeTitle(c?.name, `Concept ${conceptNumber}`)}`,
    })

    pushSpacer(lines, 1, 8)

    // Hook + synopsis (clean, not too many headings)
    const hook = normalizeText(String(c?.hook ?? ''))
    if (hook) lines.push({ kind: 'body', text: `Hook: ${hook}` })

    const synopsis = normalizeText(String(c?.synopsis ?? ''))
    if (synopsis) {
      pushSpacer(lines, 1, 8)
      lines.push({ kind: 'body', text: synopsis })
    }

    pushSpacer(lines, 1)

    // ✅ Visual direction: use 2-column block when possible
    const vd = c?.visual_direction
    const palette = asList(vd?.palette)
    const props = asList(vd?.props)
    const shotlist = asList(vd?.shotlist)

    if (shotlist.length) {
      lines.push({ kind: 'sectionTitle', text: 'Shotlist' })
      pushBullets(lines, shotlist, '• ')
      pushSpacer(lines, 1)
    }

    if (palette.length || props.length) {
      lines.push(
        twoColSection({
          heading: 'Visual direction',
          leftTitle: palette.length ? 'Palette' : undefined,
          left: palette,
          rightTitle: props.length ? 'Props / set pieces' : undefined,
          right: props,
        }) as any
      )
    }

    pushSpacer(lines, 1)

    // Deliverables + tones: another 2-col block for “deck feel”
    const deliverables = asList(c?.deliverables)
    const tones = asList(c?.caption_tones)

    if (deliverables.length || tones.length) {
      lines.push(
        twoColSection({
          heading: 'Execution',
          leftTitle: deliverables.length ? 'Deliverables' : undefined,
          left: deliverables,
          rightTitle: tones.length ? 'Caption tones' : undefined,
          right: tones,
        }) as any
      )
      pushSpacer(lines, 1)
    }

    // Timeline
    const tl = c?.timeline
    const teasers = asList(tl?.teasers)
    const dropDay = asList(tl?.drop_day)
    const post = asList(tl?.post_drop)

    if (teasers.length || dropDay.length || post.length) {
      lines.push({ kind: 'sectionTitle', text: 'Timeline (2–3 weeks)' })

      if (teasers.length) {
        lines.push({ kind: 'body', text: 'Teasers' })
        pushBullets(lines, teasers, '• ')
        pushSpacer(lines, 1, 8)
      }
      if (dropDay.length) {
        lines.push({ kind: 'body', text: 'Drop day' })
        pushBullets(lines, dropDay, '• ')
        pushSpacer(lines, 1, 8)
      }
      if (post.length) {
        lines.push({ kind: 'body', text: 'Post-drop (weeks 2–3)' })
        pushBullets(lines, post, '• ')
      }
    }

    // Divider between concepts (but not after the last one)
    if (idx !== picked.length - 1) {
      pushSpacer(lines, 1)
      pushDivider(lines)
      pushSpacer(lines, 1)
    }
  })

  // ✅ KPIs + Hashtags only for full pack (not single concept export)
  const exportingSingle = typeof opts?.onlyConceptIndex === 'number'
  if (!exportingSingle) {
  const kpis = asList(campaigns?.kpis)
  const hashtags = asList(campaigns?.hashtags)

  if (kpis.length || hashtags.length) {
  pushSpacer(lines, 1)
  lines.push({ kind: 'sectionTitle', text: 'Performance' })
  pushSpacer(lines, 1, 8)

  if (kpis.length) {
    lines.push({ kind: 'body', text: 'KPIs:' })
    pushBullets(lines, kpis, '• ')
    pushSpacer(lines, 1, 10)
  }

  if (hashtags.length) {
    lines.push({ kind: 'body', text: 'Hashtags:' })
    lines.push({
      kind: 'body',
      text: asList(hashtags).map(h => (h.startsWith('#') ? h : `#${h}`)).join(' '),
    })

    }
  }
}

return lines
}
