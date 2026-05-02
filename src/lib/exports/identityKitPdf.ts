import { normalizeText, type PdfLine } from '@/lib/wwPdf'

function pushList(lines: PdfLine[], items: unknown[], prefix = '• ') {
  if (!Array.isArray(items) || items.length === 0) return

  for (const item of items) {
    const text = normalizeText(String(item ?? ''))
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
    direction?: string
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
  if (inputs.direction) subtitleParts.push(`Direction: ${normalizeText(inputs.direction)}`)

  lines.push({
    kind: 'subtitle',
    text: subtitleParts.length ? subtitleParts.join(' • ') : 'Wavering Wanderers export',
  })

  lines.push({ kind: 'divider' })
  lines.push({ kind: 'sectionTitle', text: 'Inputs' })
  if (inputs.influences) {
    lines.push({ kind: 'body', text: `Influences: ${normalizeText(inputs.influences)}` })
  }
  if (inputs.brandWords) {
    lines.push({ kind: 'body', text: `Brand words: ${normalizeText(inputs.brandWords)}` })
  }

  if (result?.core) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Core' })

    if (result.core.brandEssence) {
      lines.push({
        kind: 'body',
        text: `Brand essence: ${normalizeText(result.core.brandEssence)}`,
      })
    }

    if (result.core.positioning) {
      lines.push({
        kind: 'body',
        text: `Positioning: ${normalizeText(result.core.positioning)}`,
      })
    }

    if (result.core.bio) {
      lines.push({
        kind: 'body',
        text: `Bio: ${normalizeText(result.core.bio)}`,
      })
    }
  }

  if (result?.audience) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Audience' })

    if (result.audience.persona) {
      lines.push({
        kind: 'body',
        text: `Persona: ${normalizeText(result.audience.persona)}`,
      })
    }

    if (Array.isArray(result.audience.psychographics) && result.audience.psychographics.length) {
      lines.push({ kind: 'body', text: 'Psychographics:' })
      pushList(lines, result.audience.psychographics)
    }

    if (Array.isArray(result.audience.emotionalTriggers) && result.audience.emotionalTriggers.length) {
      lines.push({ kind: 'body', text: 'Emotional triggers:' })
      pushList(lines, result.audience.emotionalTriggers)
    }
  }

  if (result?.tone) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Tone' })

    if (result.tone.voiceDescription) {
      lines.push({
        kind: 'body',
        text: `Voice: ${normalizeText(result.tone.voiceDescription)}`,
      })
    }

    if (Array.isArray(result.tone.do) && result.tone.do.length) {
      lines.push({ kind: 'body', text: 'Do:' })
      pushList(lines, result.tone.do)
    }

    if (Array.isArray(result.tone.dont) && result.tone.dont.length) {
      lines.push({ kind: 'body', text: "Don't:" })
      pushList(lines, result.tone.dont)
    }
  }

  if (result?.visuals) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Visual System' })

    const palette = result.visuals.colorPalette
    if (palette) {
      if (Array.isArray(palette.primary) && palette.primary.length) {
        lines.push({
          kind: 'body',
          text: `Primary palette: ${palette.primary.map((x: unknown) => normalizeText(String(x))).join(', ')}`,
        })
      }

      if (Array.isArray(palette.secondary) && palette.secondary.length) {
        lines.push({
          kind: 'body',
          text: `Secondary palette: ${palette.secondary.map((x: unknown) => normalizeText(String(x))).join(', ')}`,
        })
      }

      if (Array.isArray(palette.accent) && palette.accent.length) {
        lines.push({
          kind: 'body',
          text: `Accent palette: ${palette.accent.map((x: unknown) => normalizeText(String(x))).join(', ')}`,
        })
      }
    }

    if (result.visuals.lighting) {
      lines.push({
        kind: 'body',
        text: `Lighting: ${normalizeText(result.visuals.lighting)}`,
      })
    }

    if (Array.isArray(result.visuals.environment) && result.visuals.environment.length) {
      lines.push({ kind: 'body', text: 'Environments:' })
      pushList(lines, result.visuals.environment)
    }

    if (Array.isArray(result.visuals.framing) && result.visuals.framing.length) {
      lines.push({ kind: 'body', text: 'Framing:' })
      pushList(lines, result.visuals.framing)
    }

    if (Array.isArray(result.visuals.texture) && result.visuals.texture.length) {
      lines.push({ kind: 'body', text: 'Textures:' })
      pushList(lines, result.visuals.texture)
    }

    if (Array.isArray(result.visuals.symbolism) && result.visuals.symbolism.length) {
      lines.push({ kind: 'body', text: 'Symbolism:' })
      pushList(lines, result.visuals.symbolism)
    }
  }

  if (result?.content) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Content System' })

    if (Array.isArray(result.content.pillars) && result.content.pillars.length) {
      lines.push({ kind: 'body', text: 'Content pillars:' })

      for (const pillar of result.content.pillars) {
        const name = normalizeText(String(pillar?.name ?? ''))
        const purpose = normalizeText(String(pillar?.purpose ?? ''))
        if (!name && !purpose) continue

        lines.push({
          kind: 'body',
          text: `• ${name}${name && purpose ? ' — ' : ''}${purpose}`,
        })
      }
    }

    if (Array.isArray(result.content.formats) && result.content.formats.length) {
      lines.push({ kind: 'body', text: 'Repeatable formats:' })

      for (const format of result.content.formats) {
        const name = normalizeText(String(format?.name ?? ''))
        const type = normalizeText(String(format?.type ?? ''))
        const structure = normalizeText(String(format?.structure ?? ''))
        const emotionalGoal = normalizeText(String(format?.emotionalGoal ?? ''))

        if (name) lines.push({ kind: 'body', text: `• ${name}` })
        if (type) lines.push({ kind: 'body', text: `  Type: ${type}` })
        if (structure) lines.push({ kind: 'body', text: `  Structure: ${structure}` })
        if (emotionalGoal) {
          lines.push({ kind: 'body', text: `  Emotional goal: ${emotionalGoal}` })
        }
      }
    }
  }

  if (Array.isArray(result?.identityRules) && result.identityRules.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Identity Rules' })
    pushList(lines, result.identityRules)
  }

  if (Array.isArray(result?.keywords) && result.keywords.length) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Keywords' })
    lines.push({
      kind: 'body',
      text: result.keywords.map((x: unknown) => normalizeText(String(x))).join(', '),
    })
  }

  return lines
}