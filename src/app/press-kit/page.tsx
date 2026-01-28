// src/app/press-kit/page.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { useWwProfile } from '@/hooks/useWwProfile'
import {
  Sparkles,
  Globe2,
  Wand2,
  Clipboard,
  Loader2,
  User,
  MapPin,
  Music2,
  Megaphone,
  Link2,
  Camera,
  Download,
} from 'lucide-react'
import {
  type PdfLine,
  type PdfLayout,
  normalizeText,
  renderPdfFromLines,
} from '@/lib/wwPdf'

// ---------- Types ----------

type PressKitState = {
  artistName: string
  tagline: string
  shortBio: string
  extendedBio: string
  location: string
  genre: string
  forFansOf: string
  keyAchievements: string
  notablePress: string
  liveHighlights: string
  pressAngle: string
  streamingLinks: string
  socialLinks: string
  contactName: string
  contactEmail: string
  contactPhone: string
  photoNotes: string
  heroPhotoUrl: string
  releaseTitle: string
}

type PressKitPatch = Partial<PressKitState>
type PressKitFromAi = PressKitPatch

// ---------- API helper ----------

async function callPressKitApi(
  mode: 'from_profile' | 'from_web' | 'bio_from_web',
  payload: any
): Promise<PressKitFromAi> {
  const res = await fetch('/api/press-kit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, ...payload }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Press kit API error')
  }

  const json = await res.json()
  if ('data' in json) {
    return (json as { data: PressKitFromAi }).data
  }
  return json as PressKitFromAi
}

// ---------- PDF Layout + Builder ----------

const LAYOUT: PdfLayout = {
  page: { unit: 'pt', format: 'a4' },
  marginX: 64,
  marginTop: 72,
  marginBottom: 64,
  maxWidthPadding: 0,

  titleSize: 28,
  subtitleSize: 12,
  sectionTitleSize: 12,
  bodySize: 11,

  titleLeading: 32,
  subtitleLeading: 18,
  sectionTitleLeading: 18,
  bodyLeading: 16,

  // spacing
  titleGapAfter: 6,
  gapAfterSubtitle: 18,

  dividerPadTop: 16,
  dividerPadBottom: 14,
  dividerExtraAfter: 6,

  // ✅ hard guarantee after divider
  dividerAfterLineGap: 18,

  gapAfterSectionTitle: 8,
  gapAfterParagraph: 10,
}

function buildPdfLines(pressKit: PressKitState): PdfLine[] {
  const lines: PdfLine[] = []

  const title = normalizeText(
    pressKit.artistName || pressKit.releaseTitle || 'Electronic Press Kit'
  )
  lines.push({ kind: 'title', text: title.toUpperCase() })

  lines.push({
    kind: 'subtitle',
    text: 'Wavering Wanderers — Electronic Press Kit',
  })

  lines.push({ kind: 'divider' })

  // ARTIST
  const artistHeader: string[] = []
  if (pressKit.artistName) artistHeader.push(normalizeText(pressKit.artistName))
  if (pressKit.releaseTitle) artistHeader.push(normalizeText(pressKit.releaseTitle))
  else if (pressKit.tagline) artistHeader.push(normalizeText(pressKit.tagline))

  lines.push({ kind: 'sectionTitle', text: 'ARTIST' })
  if (artistHeader.length) {
    for (const t of artistHeader) lines.push({ kind: 'body', text: t })
  } else {
    lines.push({ kind: 'body', text: 'Add your artist name and tagline.' })
  }

  // OVERVIEW & BIO
  lines.push({ kind: 'divider' })
  lines.push({ kind: 'sectionTitle', text: 'OVERVIEW & BIO' })

  const facts: string[] = []
  if (pressKit.location) facts.push(`Location: ${normalizeText(pressKit.location)}`)
  if (pressKit.genre) facts.push(`Genre: ${normalizeText(pressKit.genre)}`)
  if (pressKit.forFansOf)
    facts.push(`For fans of: ${normalizeText(pressKit.forFansOf)}`)

  for (const f of facts) lines.push({ kind: 'body', text: f })

  if (pressKit.shortBio) lines.push({ kind: 'body', text: normalizeText(pressKit.shortBio) })
  if (pressKit.extendedBio)
    lines.push({ kind: 'body', text: normalizeText(pressKit.extendedBio) })

  if (!facts.length && !pressKit.shortBio && !pressKit.extendedBio) {
    lines.push({
      kind: 'body',
      text: 'Add your location, genre, and a short bio.',
    })
  }

  // KEY ACHIEVEMENTS
  if (pressKit.keyAchievements) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'KEY ACHIEVEMENTS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.keyAchievements) })
  }

  // NOTABLE PRESS
  if (pressKit.notablePress) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'NOTABLE PRESS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.notablePress) })
  }

  // LIVE HIGHLIGHTS
  if (pressKit.liveHighlights) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'LIVE HIGHLIGHTS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.liveHighlights) })
  }

  // PRESS ANGLE
  if (pressKit.pressAngle) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'PRESS ANGLE / STORY HOOK' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.pressAngle) })
  }

  // LINKS
  if (pressKit.streamingLinks) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'STREAMING LINKS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.streamingLinks) })
  }

  if (pressKit.socialLinks) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'SOCIALS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.socialLinks) })
  }

  // CONTACT
  if (pressKit.contactName || pressKit.contactEmail || pressKit.contactPhone) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'CONTACT' })
    if (pressKit.contactName) lines.push({ kind: 'body', text: normalizeText(pressKit.contactName) })
    if (pressKit.contactEmail) lines.push({ kind: 'body', text: normalizeText(pressKit.contactEmail) })
    if (pressKit.contactPhone) lines.push({ kind: 'body', text: normalizeText(pressKit.contactPhone) })
  }

  // PRESS PHOTOS
  if (pressKit.photoNotes) {
    lines.push({ kind: 'divider' })
    lines.push({ kind: 'sectionTitle', text: 'PRESS PHOTOS' })
    lines.push({ kind: 'body', text: normalizeText(pressKit.photoNotes) })
  }

  return lines
}

// ---------- Component ----------

export default function PressKitPage() {
  const { profile, hasAnyProfile, applyTo, save } = useWwProfile()

  const [pressKit, setPressKit] = useState<PressKitState>({
    artistName: '',
    tagline: '',
    shortBio: '',
    extendedBio: '',
    location: '',
    genre: '',
    forFansOf: '',
    keyAchievements: '',
    notablePress: '',
    liveHighlights: '',
    pressAngle: '',
    streamingLinks: '',
    socialLinks: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    photoNotes: '',
    heroPhotoUrl: '',
    releaseTitle: '',
  })

  const [loadingProfileFill, setLoadingProfileFill] = useState(false)
  const [loadingWebFill, setLoadingWebFill] = useState(false)
  const [loadingBioFromWeb, setLoadingBioFromWeb] = useState(false)

  const [copying, setCopying] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const [heroPhotoFileUrl, setHeroPhotoFileUrl] = useState<string | null>(null)

  // ✅ gentle hydration from shared profile (only if fields are empty)
  useEffect(() => {
    setPressKit(prev => ({
      ...prev,
      artistName: prev.artistName || profile.artistName || '',
      genre: prev.genre || profile.genre || '',
      pressAngle:
        prev.pressAngle ||
        (profile.goal ? `Press focus: ${profile.goal}` : ''),
      // audience isn't a direct PK field, so we don't auto-map it
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const hasCoreIdentity =
    !!pressKit.artistName && !!pressKit.genre && !!pressKit.location

  function updateField<K extends keyof PressKitState>(key: K, value: string) {
    setPressKit(prev => ({ ...prev, [key]: value }))
  }

  function applyProfileLocally() {
    applyTo({
      setArtistName: (v: string) => setPressKit(p => ({ ...p, artistName: p.artistName || v })),
      setGenre: (v: string) => setPressKit(p => ({ ...p, genre: p.genre || v })),
      setGoal: (v: string) =>
        setPressKit(p => ({ ...p, pressAngle: p.pressAngle || `Press focus: ${v}` })),
    })
    toast.success('WW profile applied to press kit fields ✅')
  }

  async function applyAiPatch(patch: PressKitPatch, scope?: 'bio_only') {
    setPressKit(prev => {
      if (scope === 'bio_only') {
        return {
          ...prev,
          shortBio: patch.shortBio ?? prev.shortBio,
          extendedBio: patch.extendedBio ?? prev.extendedBio,
        }
      }
      return { ...prev, ...patch }
    })
  }

  async function handleSmartFillFromProfile() {
    if (!hasAnyProfile && !pressKit.artistName) {
      toast.error('Add an artist name or use one of your other tools first.')
      return
    }

    // ✅ save back to shared profile (keeps tools in sync)
    void save({
      artistName: pressKit.artistName || undefined,
      genre: pressKit.genre || undefined,
      goal: profile.goal || undefined,
    })

    setLoadingProfileFill(true)
    try {
      const patch = await callPressKitApi('from_profile', {
        artistName: pressKit.artistName || profile.artistName,
        profile,
        current: pressKit,
      })
      await applyAiPatch(patch)
      toast.success('Press kit enriched from WW profile ✨')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Could not fill from profile')
    } finally {
      setLoadingProfileFill(false)
    }
  }

  async function handleSmartFillFromWeb() {
    if (!hasCoreIdentity) {
      toast.error('Add artist name, genre, and location before using this AI helper.')
      return
    }

    void save({
      artistName: pressKit.artistName || undefined,
      genre: pressKit.genre || undefined,
    })

    setLoadingWebFill(true)
    try {
      const patch = await callPressKitApi('from_web', {
        artistName: pressKit.artistName,
        genre: pressKit.genre,
        location: pressKit.location,
        current: pressKit,
      })
      await applyAiPatch(patch)
      toast.success('AI-shaped press kit draft created ✨')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Could not create an AI-shaped draft')
    } finally {
      setLoadingWebFill(false)
    }
  }

  async function handleGenerateBioFromWeb() {
    if (!pressKit.artistName) {
      toast.error('Add your artist name before generating a bio')
      return
    }

    void save({ artistName: pressKit.artistName || undefined })

    setLoadingBioFromWeb(true)
    try {
      const patch = await callPressKitApi('bio_from_web', {
        artistName: pressKit.artistName,
        current: pressKit,
      })
      await applyAiPatch(patch, 'bio_only')
      toast.success('Bio generated ✨')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Could not generate bio')
    } finally {
      setLoadingBioFromWeb(false)
    }
  }

  const pdfLines = useMemo(() => buildPdfLines(pressKit), [pressKit])

  function assemblePressKitText(): string {
    const blocks: string[] = []
    for (const l of pdfLines) {
      if (l.kind === 'divider' || l.kind === 'spacer') continue
      if (l.kind === 'title') blocks.push(l.text)
      if (l.kind === 'subtitle') blocks.push(l.text)
      if (l.kind === 'sectionTitle') blocks.push(`\n${l.text}\n`)
      if (l.kind === 'body') blocks.push(l.text)
    }
    return blocks.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  }

  async function handleCopyPressKit() {
    setCopying(true)
    try {
      const text = assemblePressKitText()
      await navigator.clipboard.writeText(text || '(Empty press kit)')
      toast.success('Press kit copied to clipboard ✅')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Could not copy press kit')
    } finally {
      setCopying(false)
    }
  }

  async function handleDownloadPdf() {
    setDownloadingPdf(true)
    try {
      const filenameBase = pressKit.artistName || pressKit.releaseTitle || 'press-kit'
      renderPdfFromLines({
        lines: pdfLines,
        filenameBase,
        layout: LAYOUT,
      })
      toast.success('Press kit downloaded as PDF ✅')
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Could not generate PDF')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const primaryButtonClass =
    'inline-flex items-center gap-2 px-4 h-9 rounded-full bg-ww-violet text-xs md:text-sm font-semibold ' +
    'shadow-[0_0_16px_rgba(186,85,211,0.7)] hover:shadow-[0_0_22px_rgba(186,85,211,0.9)] ' +
    'active:scale-95 transition disabled:opacity-60'

  const inputClass =
    'w-full px-3 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white placeholder-white/35 ' +
    'focus:border-ww-violet focus:outline-none'

  const labelClass = 'text-xs text-white/50 flex items-center gap-1'

  return (
    <main className="min-h-screen bg-black text-white">
      <Toaster position="top-center" richColors />

      <section className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Electronic Press Kit
          </h1>
          <p className="text-white/70 max-w-2xl">
            Fill it manually or use AI helpers — export a clean, consistent PDF.
          </p>
        </div>

        {hasAnyProfile && (
          <div className="p-3 rounded-2xl border border-ww-violet/40 bg-ww-violet/10 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/80">
              We recognised your Wavering Wanderers profile. Use it as a starting point?
            </span>
            <button type="button" onClick={applyProfileLocally} className={primaryButtonClass}>
              <Sparkles className="w-3 h-3" />
              Apply WW profile
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)]">
          {/* LEFT */}
          <section className="rounded-3xl border border-white/10 bg-black/75 p-5 md:p-6 space-y-5">
            {/* AI helpers */}
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-white/50">
                AI helpers
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSmartFillFromProfile}
                  disabled={loadingProfileFill}
                  className={primaryButtonClass}
                >
                  {loadingProfileFill ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Filling…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Smart-fill from WW profile
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSmartFillFromWeb}
                  disabled={loadingWebFill || !hasCoreIdentity}
                  className={primaryButtonClass}
                  title={
                    hasCoreIdentity
                      ? 'Build a draft using name, genre & location'
                      : 'Add artist name, genre, and location first'
                  }
                >
                  {loadingWebFill ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Drafting…
                    </>
                  ) : (
                    <>
                      <Globe2 className="w-3 h-3" />
                      AI-shaped draft
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateBioFromWeb}
                  disabled={loadingBioFromWeb}
                  className={primaryButtonClass}
                >
                  {loadingBioFromWeb ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Bio…
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3" />
                      Generate bio
                    </>
                  )}
                </button>
              </div>

              <p className="text-[0.7rem] text-white/50">
                These helpers draft copy from your inputs/profile — you stay in control.
              </p>
            </div>

            {/* Core fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className={labelClass}>
                  <User className="w-3 h-3" /> Artist name
                </p>
                <input
                  value={pressKit.artistName}
                  onChange={e => updateField('artistName', e.target.value)}
                  className={inputClass}
                  placeholder="Artist / project name"
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>Tagline</p>
                <input
                  value={pressKit.tagline}
                  onChange={e => updateField('tagline', e.target.value)}
                  className={inputClass}
                  placeholder="One-line descriptor"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className={labelClass}>Release title</p>
                <input
                  value={pressKit.releaseTitle}
                  onChange={e => updateField('releaseTitle', e.target.value)}
                  className={inputClass}
                  placeholder='e.g. “Swing Of The Sword”'
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>
                  <MapPin className="w-3 h-3" /> Location
                </p>
                <input
                  value={pressKit.location}
                  onChange={e => updateField('location', e.target.value)}
                  className={inputClass}
                  placeholder="City / region"
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>
                  <Music2 className="w-3 h-3" /> Genre / lane
                </p>
                <input
                  value={pressKit.genre}
                  onChange={e => updateField('genre', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. introspective UK rap"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className={labelClass}>For fans of</p>
                <input
                  value={pressKit.forFansOf}
                  onChange={e => updateField('forFansOf', e.target.value)}
                  className={inputClass}
                  placeholder="Similar artists"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className={labelClass}>Short bio</p>
                <textarea
                  value={pressKit.shortBio}
                  onChange={e => updateField('shortBio', e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="1–3 sentences"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className={labelClass}>Extended bio</p>
                <textarea
                  value={pressKit.extendedBio}
                  onChange={e => updateField('extendedBio', e.target.value)}
                  rows={5}
                  className={inputClass}
                  placeholder="Full story"
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>Key achievements</p>
                <textarea
                  value={pressKit.keyAchievements}
                  onChange={e => updateField('keyAchievements', e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>Notable press</p>
                <textarea
                  value={pressKit.notablePress}
                  onChange={e => updateField('notablePress', e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>Live highlights</p>
                <textarea
                  value={pressKit.liveHighlights}
                  onChange={e => updateField('liveHighlights', e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>
                  <Megaphone className="w-3 h-3" /> Press angle / story hook
                </p>
                <textarea
                  value={pressKit.pressAngle}
                  onChange={e => updateField('pressAngle', e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>
                  <Link2 className="w-3 h-3" /> Streaming links
                </p>
                <textarea
                  value={pressKit.streamingLinks}
                  onChange={e => updateField('streamingLinks', e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Spotify, Apple Music, SoundCloud…"
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>
                  <Link2 className="w-3 h-3" /> Social links
                </p>
                <textarea
                  value={pressKit.socialLinks}
                  onChange={e => updateField('socialLinks', e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder="Instagram, TikTok, YouTube…"
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>Contact name</p>
                <input
                  value={pressKit.contactName}
                  onChange={e => updateField('contactName', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <p className={labelClass}>Contact email</p>
                <input
                  value={pressKit.contactEmail}
                  onChange={e => updateField('contactEmail', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className={labelClass}>Contact phone</p>
                <input
                  value={pressKit.contactPhone}
                  onChange={e => updateField('contactPhone', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className={labelClass}>
                  <Camera className="w-3 h-3" /> Hero photo URL (optional)
                </p>
                <input
                  value={pressKit.heroPhotoUrl}
                  onChange={e => updateField('heroPhotoUrl', e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className={labelClass}>Upload hero photo (local preview only)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = URL.createObjectURL(file)
                    setHeroPhotoFileUrl(url)
                  }}
                  className="block w-full rounded-xl bg-black px-3 py-2.5 text-xs text-white border border-white/15 cursor-pointer focus:border-ww-violet focus:outline-none"
                />

                {(heroPhotoFileUrl || pressKit.heroPhotoUrl) && (
                  <div className="mt-2 rounded-2xl border border-white/10 bg-black/40 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroPhotoFileUrl || pressKit.heroPhotoUrl}
                      alt="Hero preview"
                      className="w-full h-44 object-cover rounded-xl"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1 md:col-span-2">
                <p className={labelClass}>Photo notes</p>
                <textarea
                  value={pressKit.photoNotes}
                  onChange={e => updateField('photoNotes', e.target.value)}
                  rows={2}
                  className={inputClass}
                  placeholder="What photos are available / usage notes"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyPressKit}
                disabled={copying}
                className={primaryButtonClass}
              >
                {copying ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Copying…
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3 h-3" />
                    Copy full press kit
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className={primaryButtonClass}
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    PDF…
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    Download as PDF
                  </>
                )}
              </button>
            </div>
          </section>

          {/* RIGHT: Preview (simple, PDF-mirror text) */}
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 p-5 md:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 mb-4">
              <div className="space-y-1">
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/40">
                  Preview
                </p>
                <p className="text-xs text-white/60">
                  This preview mirrors the PDF sections (text-first).
                </p>
              </div>
            </div>

            <PdfPreview lines={pdfLines} />
          </section>
        </div>
      </section>
    </main>
  )
}

function PdfPreview({ lines }: { lines: PdfLine[] }) {
  return (
    <div className="bg-white text-black rounded-2xl p-6 md:p-8 max-h-[78vh] overflow-y-auto">
      {lines.map((l, idx) => {
        if (l.kind === 'divider') {
          return <hr key={idx} className="my-5 border-black/10" />
        }
        if (l.kind === 'title') {
          return (
            <h2 key={idx} className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {l.text}
            </h2>
          )
        }
        if (l.kind === 'subtitle') {
          return (
            <p key={idx} className="text-sm text-black/60 mt-1">
              {l.text}
            </p>
          )
        }
        if (l.kind === 'sectionTitle') {
          return (
            <p
              key={idx}
              className="mt-2 text-xs font-extrabold tracking-[0.2em] text-black/70"
            >
              {l.text}
            </p>
          )
        }
        if (l.kind === 'body') {
          return (
            <p key={idx} className="text-sm text-black/85 leading-relaxed whitespace-pre-wrap">
              {l.text}
            </p>
          )
        }
        return null
      })}
    </div>
  )
}
