// lib/pdf/types.ts

export type PdfLine =
  | { kind: 'title'; text: string }
  | { kind: 'subtitle'; text: string }
  | { kind: 'divider' }
  | { kind: 'sectionTitle'; text: string }
  | { kind: 'body'; text: string }
  | { kind: 'spacer'; height: number }
