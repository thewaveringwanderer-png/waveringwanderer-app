'use client'

import { WW_PDF_LAYOUT as LAYOUT, type PdfLine } from '@/lib/wwPdf'

export default function PdfAccuratePreview({ lines }: { lines: PdfLine[] }) {
  const px = (pt: number) => `${Math.round((pt / 72) * 96)}px` // pt -> px approx

  return (
    <div className="bg-white text-black rounded-2xl shadow-[0_0_22px_rgba(0,0,0,0.25)] overflow-hidden w-full">
      <div
        style={{
          paddingLeft: px(LAYOUT.marginX),
          paddingRight: px(LAYOUT.marginX),
          paddingTop: px(LAYOUT.marginTop),
          paddingBottom: px(LAYOUT.marginBottom),
        }}
      >
        {lines.map((l, idx) => {
          if (l.kind === 'spacer') {
            return <div key={idx} style={{ height: px(l.height) }} />
          }

          if (l.kind === 'divider') {
            return (
              <div
                key={idx}
                style={{
                  paddingTop: px(LAYOUT.dividerPadTop),
                  paddingBottom: px(LAYOUT.dividerPadBottom + LAYOUT.dividerExtraAfter),
                }}
              >
                <div style={{ height: 1, background: 'rgb(225,225,225)' }} />
              </div>
            )
          }

          if (l.kind === 'title') {
            return (
              <div
                key={idx}
                style={{
                  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                  fontWeight: 800,
                  fontSize: px(LAYOUT.titleSize),
                  lineHeight: px(LAYOUT.titleLeading),
                  marginBottom: px(LAYOUT.titleGapAfter),
                  letterSpacing: '0.02em',
                }}
              >
                {l.text}
              </div>
            )
          }

          if (l.kind === 'subtitle') {
            return (
              <div
                key={idx}
                style={{
                  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                  fontWeight: 500,
                  fontSize: px(LAYOUT.subtitleSize),
                  lineHeight: px(LAYOUT.subtitleLeading),
                  marginBottom: px(LAYOUT.gapAfterSubtitle),
                }}
              >
                {l.text}
              </div>
            )
          }

          if (l.kind === 'sectionTitle') {
            return (
              <div
                key={idx}
                style={{
                  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                  fontWeight: 800,
                  fontSize: px(LAYOUT.sectionTitleSize),
                  lineHeight: px(LAYOUT.sectionTitleLeading),
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  marginBottom: px(LAYOUT.gapAfterSectionTitle),
                  color: '#111',
                }}
              >
                {l.text}
              </div>
            )
          }

          if (l.kind === 'body') {
            return (
              <div
                key={idx}
                style={{
                  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                  fontWeight: 400,
                  fontSize: px(LAYOUT.bodySize),
                  lineHeight: px(LAYOUT.bodyLeading),
                  marginBottom: px(LAYOUT.gapAfterParagraph),
                  color: '#111',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {l.text}
              </div>
            )
          }

          if (l.kind === 'meta') {
            return (
              <div
                key={idx}
                style={{
                  marginBottom: px(LAYOUT.gapAfterParagraph),
                  padding: `${px(LAYOUT.metaBoxPadY)} ${px(LAYOUT.metaBoxPadX)}`,
                  borderRadius: px(LAYOUT.metaBoxRadius),
                  border: '1px solid rgb(230,230,230)',
                  background: 'rgb(248,248,248)',
                  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                  fontSize: px(LAYOUT.metaValueSize),
                  lineHeight: px(LAYOUT.metaLeading),
                  color: '#111',
                }}
              >
                {l.items.map((it, j) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      gap: px(10),
                      marginBottom: j === l.items.length - 1 ? 0 : px(LAYOUT.metaRowGap),
                    }}
                  >
                    <div
                      style={{
                        width: px(110),
                        fontSize: px(LAYOUT.metaLabelSize),
                        color: 'rgb(90,90,90)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {it.label}
                    </div>
                    <div style={{ flex: 1 }}>{it.value || ''}</div>
                  </div>
                ))}
              </div>
            )
          }

          if (l.kind === 'twoCol') {
            return (
              <div
                key={idx}
                style={{
                  marginBottom: px(LAYOUT.gapAfterParagraph),
                  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                  color: '#111',
                }}
              >
                {l.heading ? (
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: px(LAYOUT.sectionTitleSize),
                      lineHeight: px(LAYOUT.sectionTitleLeading),
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      marginBottom: px(LAYOUT.gapAfterSectionTitle),
                    }}
                  >
                    {l.heading}
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: px(LAYOUT.twoColGap) }}>
                  <div style={{ flex: 1 }}>
                    {l.leftTitle ? (
                      <div style={{ fontWeight: 700, marginBottom: px(LAYOUT.twoColInnerGap) }}>
                        {l.leftTitle}
                      </div>
                    ) : null}
                    {l.left.map((t, j) => (
                      <div key={j} style={{ marginBottom: px(4), whiteSpace: 'pre-wrap' }}>
                        • {t}
                      </div>
                    ))}
                  </div>

                  <div style={{ flex: 1 }}>
                    {l.rightTitle ? (
                      <div style={{ fontWeight: 700, marginBottom: px(LAYOUT.twoColInnerGap) }}>
                        {l.rightTitle}
                      </div>
                    ) : null}
                    {l.right.map((t, j) => (
                      <div key={j} style={{ marginBottom: px(4), whiteSpace: 'pre-wrap' }}>
                        • {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
