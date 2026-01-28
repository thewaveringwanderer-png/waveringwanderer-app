'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

/* ---------- Types ---------- */
type IdentityResult = {
  brand_essence?: string
  one_line_positioning?: string
  bio_short?: string
  archetype?: { primary?: string; secondary?: string }
  audience_persona?: {
    nickname?: string
    demographics?: string
    psychographics?: string
    adjacent_artists?: string[]
  }
  value_props?: string[]
  tone_of_voice?: string[]
  visual_aesthetics?: {
    palette?: string[]
    mood_words?: string[]
    references?: string[]
  }
  content_pillars?: { name?: string; why?: string; formats?: string[] }[]
  platform_strategy?: {
    primary_platforms?: string[]
    cadence?: string
    cta_examples?: string[]
  }
  release_plan_90d?: { week?: string; focus?: string; tasks?: string[] }[]
  seo_keywords?: string[]
  taglines?: string[]
  raw?: string
}

/* ---------- Small UI helpers (theme-friendly) ---------- */
function ColorDot({ color }: { color: string }) {
  return (
    <div
      className="w-6 h-6 rounded-full border"
      style={{ backgroundColor: color, borderColor: 'var(--muted)' }}
      title={color}
    />
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="text-[var(--subtext)]">{children}</div>
    </section>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="badge mr-2 mb-2">{children}</span>
}

function ResultCard({ result }: { result: IdentityResult }) {
  const copyJson = () =>
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
  const copyTaglines = () =>
    navigator.clipboard.writeText((result.taglines || []).join('\n'))

  return (
    <div className="card max-w-3xl w-full p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">✨ Artist Identity Kit</h2>
        <div className="flex items-center gap-2">
          <button onClick={copyTaglines} className="btn-ghost">Copy Taglines</button>
          <button onClick={copyJson} className="btn-ghost">Copy Kit (JSON)</button>
        </div>
      </div>

      {result.brand_essence && (
        <Section title="Brand Essence">
          <p>{result.brand_essence}</p>
        </Section>
      )}

      {result.one_line_positioning && (
        <Section title="Positioning">
          <p>{result.one_line_positioning}</p>
        </Section>
      )}

      {result.bio_short && (
        <Section title="Short Bio">
          <p>{result.bio_short}</p>
        </Section>
      )}

      {(result.archetype?.primary || result.archetype?.secondary) && (
        <Section title="Archetype">
          <div className="flex flex-wrap gap-3">
            {result.archetype?.primary && <Badge>Primary: {result.archetype.primary}</Badge>}
            {result.archetype?.secondary && <Badge>Secondary: {result.archetype.secondary}</Badge>}
          </div>
        </Section>
      )}

      {result.audience_persona && (
        <Section title="Audience Persona">
          <div className="space-y-2">
            {result.audience_persona.nickname && <p><b>Nickname:</b> {result.audience_persona.nickname}</p>}
            {result.audience_persona.demographics && <p><b>Demographics:</b> {result.audience_persona.demographics}</p>}
            {result.audience_persona.psychographics && <p><b>Psychographics:</b> {result.audience_persona.psychographics}</p>}
            {result.audience_persona.adjacent_artists?.length ? (
              <p><b>Adjacent artists:</b> {result.audience_persona.adjacent_artists.join(', ')}</p>
            ) : null}
          </div>
        </Section>
      )}

      {result.value_props?.length ? (
        <Section title="Value Props">
          <ul className="list-disc list-inside">
            {result.value_props.map((v, i) => <li key={i}>{v}</li>)}
          </ul>
        </Section>
      ) : null}

      {result.tone_of_voice?.length ? (
        <Section title="Tone of Voice">
          <div className="flex flex-wrap gap-2">
            {result.tone_of_voice.map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
        </Section>
      ) : null}

      {(result.visual_aesthetics?.palette?.length ||
        result.visual_aesthetics?.mood_words?.length ||
        result.visual_aesthetics?.references?.length) && (
        <Section title="Visual Aesthetics">
          <div className="space-y-2">
            {result.visual_aesthetics?.palette?.length ? (
              <div className="flex gap-2 items-center">
                <span className="text-[var(--subtext)] mr-2">Palette:</span>
                {result.visual_aesthetics.palette.map((c) => <ColorDot key={c} color={c} />)}
              </div>
            ) : null}
            {result.visual_aesthetics?.mood_words?.length ? (
              <div><b>Mood:</b> {result.visual_aesthetics.mood_words.join(', ')}</div>
            ) : null}
            {result.visual_aesthetics?.references?.length ? (
              <div><b>References:</b> {result.visual_aesthetics.references.join(', ')}</div>
            ) : null}
          </div>
        </Section>
      )}

      {result.content_pillars?.length ? (
        <Section title="Content Pillars">
          <div className="grid gap-3 md:grid-cols-2">
            {result.content_pillars.map((p, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--muted)' }}
              >
                <p className="font-medium">{p.name}</p>
                {p.why && <p className="text-sm text-[var(--subtext)] mb-1">{p.why}</p>}
                {p.formats?.length ? (
                  <p className="text-sm text-[var(--subtext)]"><b>Formats:</b> {p.formats.join(', ')}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {result.platform_strategy && (
        <Section title="Platform Strategy">
          <div className="space-y-1">
            {result.platform_strategy.primary_platforms?.length ? (
              <p><b>Primary platforms:</b> {result.platform_strategy.primary_platforms.join(', ')}</p>
            ) : null}
            {result.platform_strategy.cadence && (
              <p><b>Cadence:</b> {result.platform_strategy.cadence}</p>
            )}
            {result.platform_strategy.cta_examples?.length ? (
              <>
                <p className="mt-2 font-medium">CTA examples</p>
                <ul className="list-disc list-inside">
                  {result.platform_strategy.cta_examples.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </>
            ) : null}
          </div>
        </Section>
      )}

      {result.release_plan_90d?.length ? (
        <Section title="90-Day Release Plan">
          <div className="space-y-2">
            {result.release_plan_90d.map((w, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--muted)' }}
              >
                <p className="font-medium">{w.week} — {w.focus}</p>
                {w.tasks?.length ? (
                  <ul className="list-disc list-inside text-sm mt-1">
                    {w.tasks.map((t, j) => <li key={j}>{t}</li>)}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {result.seo_keywords?.length ? (
        <Section title="SEO Keywords">
          <div className="flex flex-wrap gap-2">
            {result.seo_keywords.map((k) => <Badge key={k}>{k}</Badge>)}
          </div>
        </Section>
      ) : null}

      {result.taglines?.length ? (
        <Section title="Taglines">
          <ul className="list-disc list-inside">
            {result.taglines.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </Section>
      ) : null}
    </div>
  )
}

/* ---------- Page ---------- */
export default function KitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [kit, setKit] = useState<{
    artist_name?: string
    genre?: string
    created_at?: string
    result?: IdentityResult
  } | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Ensure user is logged in (RLS requires it)
        const { data: auth } = await supabase.auth.getSession()
        if (!auth.session) {
          router.replace('/login')
          return
        }
        const { data, error } = await supabase
          .from('identity_kits')
          .select('artist_name, genre, created_at, result')
          .eq('id', id)
          .single()

        if (error) throw error
        if (mounted) setKit(data || null)
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load kit')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id, router])

  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center">
        <p className="text-[var(--subtext)]">Loading…</p>
      </main>
    )
  }

  if (error || !kit) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="card p-8 max-w-xl w-full">
          <p className="text-red-300 mb-2">Could not load this kit.</p>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="mt-4">
            <Link href="/dashboard" className="btn">Back to Dashboard</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[70vh] flex flex-col items-center gap-6 py-10">
      {/* Header actions */}
      <div className="max-w-3xl w-full flex items-center justify-between">
        <div className="text-[var(--subtext)]">
          <div className="text-xl font-semibold text-white">
            {kit.artist_name || 'Untitled'}
          </div>
          <div className="text-sm">{kit.genre || '—'}</div>
          {kit.created_at && (
            <div className="text-xs">
              Generated {new Date(kit.created_at).toLocaleString()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="btn-ghost">Back</Link>
        </div>
      </div>

      {/* Result */}
      {kit.result ? (
        <ResultCard result={kit.result} />
      ) : (
        <div className="card max-w-3xl w-full p-6 text-[var(--subtext)]">
          This kit doesn’t have a stored result payload.
        </div>
      )}
    </main>
  )
}

