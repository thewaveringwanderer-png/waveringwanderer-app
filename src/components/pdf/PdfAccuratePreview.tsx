'use client'

import { LAYOUT, PdfLine } from '@/app/lib/pdf/presskitPdf'

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
            // ✅ mirror PDF divider spacing EXACTLY
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
                  fontFamily:
                    'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
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
                  fontFamily:
                    'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
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
                  fontFamily:
                    'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
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

          return (
            <div
              key={idx}
              style={{
                fontFamily:
                  'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
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
        })}
      </div>
    </div>
  )
}
