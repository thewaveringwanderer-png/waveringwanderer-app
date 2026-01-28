// components/pdf/PdfDocument.tsx

'use client'

import { LAYOUT, ptToPx } from '@/lib/pdf/layout'
import type { PdfLine } from '@/lib/pdf/types'

export default function PdfDocument({ lines }: { lines: PdfLine[] }) {
  return (
    <div
      className="bg-white text-black rounded-2xl shadow-[0_0_22px_rgba(0,0,0,0.25)] overflow-hidden"
      style={{ width: '100%' }}
    >
      <div
        style={{
          paddingLeft: ptToPx(LAYOUT.marginX),
          paddingRight: ptToPx(LAYOUT.marginX),
          paddingTop: ptToPx(LAYOUT.marginTop),
          paddingBottom: ptToPx(LAYOUT.marginBottom),
        }}
      >
        {lines.map((l, idx) => {
          if (l.kind === 'spacer') {
            return <div key={idx} style={{ height: ptToPx(l.height) }} />
          }

          if (l.kind === 'divider') {
            return (
              <div
                key={idx}
                style={{
                  paddingTop: ptToPx(LAYOUT.dividerPadTop),
                  paddingBottom: `calc(${ptToPx(
                    LAYOUT.dividerPadBottom
                  )} + ${ptToPx(LAYOUT.dividerExtraAfter)})`,
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
                  fontSize: ptToPx(LAYOUT.titleSize),
                  lineHeight: ptToPx(LAYOUT.titleLeading),
                  marginBottom: ptToPx(LAYOUT.titleGapAfter),
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
                  fontSize: ptToPx(LAYOUT.subtitleSize),
                  lineHeight: ptToPx(LAYOUT.subtitleLeading),
                  marginBottom: ptToPx(LAYOUT.gapAfterSubtitle),
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
                  paddingTop: ptToPx(LAYOUT.sectionTitlePadTop),
                  fontFamily:
                    'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                  fontWeight: 800,
                  fontSize: ptToPx(LAYOUT.sectionTitleSize),
                  lineHeight: ptToPx(LAYOUT.sectionTitleLeading),
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  marginBottom: ptToPx(LAYOUT.gapAfterSectionTitle),
                  color: '#111',
                }}
              >
                {l.text}
              </div>
            )
          }

          // body
          return (
            <div
              key={idx}
              style={{
                fontFamily:
                  'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
                fontWeight: 400,
                fontSize: ptToPx(LAYOUT.bodySize),
                lineHeight: ptToPx(LAYOUT.bodyLeading),
                marginBottom: ptToPx(LAYOUT.gapAfterParagraph),
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
