import { normalizeText, type PdfLine } from '@/lib/wwPdf'

function pushList(lines: PdfLine[], items: unknown[], prefix = '• ') {
  if (!Array.isArray(items) || items.length === 0) return

  for (const item of items) {
    const text = normalizeText(String(item ?? ''))
    if (!text) continue
    lines.push({ kind: 'body', text: `${prefix}${text}` })
  }
}

function pushField(lines: PdfLine[], label: string, value: unknown) {
  const text = normalizeText(String(value ?? ''))
  if (!text) return
  lines.push({ kind: 'body', text: `${label}: ${text}` })
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
  pushField(lines, 'Influences', inputs.influences)
  pushField(lines, 'Brand words', inputs.brandWords)

  if (result?.snapshot) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Artist Snapshot' })

    pushField(lines, 'One-line identity', result.snapshot.oneLineIdentity)
    pushField(lines, 'Ownable difference', result.snapshot.ownableDifference)
    pushField(lines, 'Audience promise', result.snapshot.audiencePromise)
    pushField(lines, 'Visual shorthand', result.snapshot.visualShorthand)
    pushField(lines, 'Content direction', result.snapshot.contentDirection)
  }

  if (result?.strategicFoundations) {
    const sf = result.strategicFoundations

    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Strategic Foundations' })

    if (Array.isArray(sf.coreBeliefs) && sf.coreBeliefs.length) {
      lines.push({ kind: 'body', text: 'Core beliefs:' })
      pushList(lines, sf.coreBeliefs)
    }

    if (Array.isArray(sf.worldviewStatements) && sf.worldviewStatements.length) {
      lines.push({ kind: 'body', text: 'Worldview statements:' })
      pushList(lines, sf.worldviewStatements)
    }

    if (Array.isArray(sf.coreTensions) && sf.coreTensions.length) {
      lines.push({ kind: 'body', text: 'Core tensions:' })
      pushList(lines, sf.coreTensions)
    }

    pushField(lines, 'Emotional territory', sf.emotionalTerritory)
    pushField(lines, 'Listener transformation', sf.listenerTransformation)
    pushField(lines, 'Cultural position', sf.culturalPosition)

    if (Array.isArray(sf.influenceAnalysis) && sf.influenceAnalysis.length) {
      lines.push({ kind: 'body', text: 'Influence analysis:' })
      pushList(lines, sf.influenceAnalysis)
    }
  }

  if (result?.core) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Core Identity' })

    pushField(lines, 'Brand essence', result.core.brandEssence)
    pushField(lines, 'Positioning', result.core.positioning)
    pushField(lines, 'Manifesto', result.core.manifesto)
  }

  if (result?.strategy) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Brand Strategy' })

    pushField(lines, 'USP', result.strategy.usp)
    pushField(lines, 'Brand message', result.strategy.brandMessage)

    if (Array.isArray(result.strategy.listenerIdentity) && result.strategy.listenerIdentity.length) {
      lines.push({ kind: 'body', text: 'Listener identity:' })
      pushList(lines, result.strategy.listenerIdentity)
    }
  }

  if (result?.audience) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Audience' })

    pushField(lines, 'Persona', result.audience.persona)

    if (Array.isArray(result.audience.frustrations) && result.audience.frustrations.length) {
      lines.push({ kind: 'body', text: 'Frustrations:' })
      pushList(lines, result.audience.frustrations)
    }

    if (Array.isArray(result.audience.hiddenDesires) && result.audience.hiddenDesires.length) {
      lines.push({ kind: 'body', text: 'Hidden desires:' })
      pushList(lines, result.audience.hiddenDesires)
    }

    if (Array.isArray(result.audience.contentTriggers) && result.audience.contentTriggers.length) {
      lines.push({ kind: 'body', text: 'Content triggers:' })
      pushList(lines, result.audience.contentTriggers)
    }

    if (Array.isArray(result.audience.contentTurnoffs) && result.audience.contentTurnoffs.length) {
      lines.push({ kind: 'body', text: 'Content turnoffs:' })
      pushList(lines, result.audience.contentTurnoffs)
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

    pushField(lines, 'Voice', result.tone.voiceDescription)

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
    const visuals = result.visuals
    const palette = visuals.colorPalette
    const meanings = visuals.colorMeanings

    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'Visual System' })

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

    if (meanings) {
      if (Array.isArray(meanings.primary) && meanings.primary.length) {
        lines.push({ kind: 'body', text: 'Primary meaning:' })
        pushList(lines, meanings.primary)
      }

      if (Array.isArray(meanings.secondary) && meanings.secondary.length) {
        lines.push({ kind: 'body', text: 'Secondary meaning:' })
        pushList(lines, meanings.secondary)
      }

      if (Array.isArray(meanings.accent) && meanings.accent.length) {
        lines.push({ kind: 'body', text: 'Accent meaning:' })
        pushList(lines, meanings.accent)
      }
    }

    pushField(lines, 'Lighting', visuals.lighting)

    if (Array.isArray(visuals.environment) && visuals.environment.length) {
      lines.push({ kind: 'body', text: 'Environments:' })
      pushList(lines, visuals.environment)
    }

    if (Array.isArray(visuals.framing) && visuals.framing.length) {
      lines.push({ kind: 'body', text: 'Framing:' })
      pushList(lines, visuals.framing)
    }

    if (Array.isArray(visuals.texture) && visuals.texture.length) {
      lines.push({ kind: 'body', text: 'Textures:' })
      pushList(lines, visuals.texture)
    }

    if (Array.isArray(visuals.symbolism) && visuals.symbolism.length) {
      lines.push({ kind: 'body', text: 'Symbolism:' })
      pushList(lines, visuals.symbolism)
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

        if (Array.isArray(pillar?.examples) && pillar.examples.length) {
          pushList(lines, pillar.examples, '  - ')
        }
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
        if (emotionalGoal) lines.push({ kind: 'body', text: `  Emotional goal: ${emotionalGoal}` })
      }
    }
  }

  if (Array.isArray(result?.creativeDNA) && result.creativeDNA.length) {
  lines.push({ kind: 'divider' })
  lines.push({ kind: 'sectionTitle', text: 'Creative DNA' })

  for (const item of result.creativeDNA) {
    const title = normalizeText(String(item?.title ?? ''))
    const meaning = normalizeText(String(item?.meaning ?? ''))

    if (!title && !meaning) continue

    if (title) {
      lines.push({ kind: 'body', text: `• ${title}` })
    }

    if (meaning) {
      lines.push({ kind: 'body', text: `  Meaning: ${meaning}` })
    }
  }
}

  if (Array.isArray(result?.identityRules) && result.identityRules.length) {
  lines.push({ kind: 'divider' })
  lines.push({ kind: 'sectionTitle', text: 'Creative Constitution' })

  for (const rule of result.identityRules) {
    const section =
      typeof rule === 'string'
        ? ''
        : normalizeText(String(rule?.section ?? ''))

    const principle =
      typeof rule === 'string'
        ? normalizeText(rule)
        : normalizeText(String(rule?.principle ?? ''))

    const rationale =
      typeof rule === 'string'
        ? ''
        : normalizeText(String(rule?.rationale ?? ''))

    if (!principle && !rationale) continue

    if (section) {
      lines.push({ kind: 'body', text: section.toUpperCase() })
    }

    if (principle) {
      lines.push({ kind: 'body', text: `• ${principle}` })
    }

    if (rationale) {
      lines.push({ kind: 'body', text: `  Why this matters: ${rationale}` })
    }
  }
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