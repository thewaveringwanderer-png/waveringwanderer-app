'use client'

import React from 'react'

export type PressKitContact = {
  name?: string
  roleLabel?: string
  email?: string
  phone?: string
}

export type PressKitLink = {
  platform: string
  label?: string
  url: string
}

export type PressKitStat = {
  label: string
  value: string
}

export type PressKitTrack = {
  title: string
  description?: string
  platform?: string
  url?: string
}

export type PressKitVideo = {
  title: string
  type?: string // Official video, Live session, etc
  url?: string
}

export type PressKitQuote = {
  quote: string
  source?: string
}

export type PressKitRelease = {
  title?: string
  type?: string // single / EP / album
  releaseDate?: string
  artworkUrl?: string
  sellingPoints?: string[]
  links?: PressKitLink[]
}

export type PressKitPreviewModel = {
  artistName?: string
  tagline?: string
  location?: string
  genre?: string
  riyl?: string // “for fans of”
  heroPhotoUrl?: string

  stats?: PressKitStat[]

  bioShort?: string
  bioLong?: string

  priorityRelease?: PressKitRelease

  keyTracks?: PressKitTrack[]
  videos?: PressKitVideo[]

  pressQuotes?: PressKitQuote[]
  liveHighlights?: string[]

  liveSetupNotes?: string
  techNotesShort?: string

  management?: PressKitContact
  booking?: PressKitContact
  press?: PressKitContact

  socials?: PressKitLink[]
  websiteUrl?: string
}

/**
 * White “label-grade” A4-style press kit layout.
 * This component is deliberately dumb: it just renders whatever you pass in via `kit`.
 * Map your existing draft state into this shape in page.tsx.
 */
export function PressKitPreview({ kit }: { kit: PressKitPreviewModel }) {
  const {
    artistName = 'Artist Name',
    tagline = 'Short positioning line that captures your lane and energy.',
    location = 'City, Country',
    genre = 'Primary genre / lane',
    riyl = 'For fans of …',
    heroPhotoUrl,

    stats = [],

    bioShort,
    bioLong,

    priorityRelease,
    keyTracks = [],
    videos = [],

    pressQuotes = [],
    liveHighlights = [],

    liveSetupNotes,
    techNotesShort,

    management,
    booking,
    press,
    socials = [],
    websiteUrl,
  } = kit || {}

  // Fallback for stats so the layout doesn’t look empty in early drafts
  const effectiveStats =
    stats && stats.length
      ? stats
      : [
          { label: 'STREAMS', value: '—' },
          { label: 'FOLLOWERS', value: '—' },
          { label: 'RECENT HIGHLIGHT', value: '—' },
        ]

  return (
    <div className="h-full w-full overflow-y-auto rounded-3xl bg-black/60 p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white text-black shadow-[0_12px_45px_rgba(0,0,0,0.45)] overflow-hidden">
        {/* Top label bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-black/5 bg-neutral-50/80">
          <div className="text-[10px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
            Electronic Press Kit
          </div>
          <div className="text-[10px] text-neutral-400">
            Generated with <span className="font-semibold text-[#7c3aed]">Wavering Wanderers</span>
          </div>
        </div>

        <div className="px-6 pb-7 pt-6 md:px-8 md:pt-7 md:pb-8 space-y-7">
          {/* HERO SECTION */}
          <section className="grid gap-6 md:grid-cols-[1.1fr,1.3fr]">
            {/* Photo */}
            <div className="relative rounded-xl bg-neutral-100 overflow-hidden min-h-[200px]">
              {heroPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroPhotoUrl}
                  alt={artistName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-24 h-24 rounded-full border border-dashed border-neutral-300 flex items-center justify-center text-xs text-neutral-400 mb-3">
                    Artist photo
                  </div>
                  <p className="text-xs text-neutral-500">
                    Add a strong portrait or live shot here for the exported press kit.
                  </p>
                </div>
              )}
            </div>

            {/* Name + core info */}
            <div className="flex flex-col gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900">
                  {artistName}
                </h1>
                <p className="mt-1 text-sm text-neutral-700">{tagline}</p>
              </div>

              <div className="flex flex-col gap-1 text-xs text-neutral-600">
                <p>
                  <span className="font-semibold text-neutral-800">Location:</span>{' '}
                  {location}
                </p>
                <p>
                  <span className="font-semibold text-neutral-800">Genre:</span>{' '}
                  {genre}
                </p>
                {riyl && (
                  <p>
                    <span className="font-semibold text-neutral-800">For fans of:</span>{' '}
                    {riyl}
                  </p>
                )}
              </div>

              {/* Stats row */}
              <div className="mt-2 flex flex-wrap gap-2">
                {effectiveStats.map((s, idx) => (
                  <div
                    key={`${s.label}-${idx}`}
                    className="inline-flex flex-col rounded-lg border border-violet-200 bg-violet-50/80 px-3 py-2 min-w-[120px]"
                  >
                    <span className="text-[10px] font-semibold tracking-[0.16em] text-violet-700 uppercase">
                      {s.label}
                    </span>
                    <span className="text-sm font-semibold text-neutral-900">
                      {s.value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* BIOGRAPHY */}
          {(bioShort || bioLong) && (
            <section className="space-y-3 border-t border-black/5 pt-5">
              <h2 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Biography
              </h2>

              {bioShort && (
                <p className="text-sm text-neutral-900 leading-relaxed">
                  {bioShort}
                </p>
              )}

              {bioLong && (
                <p className="text-[13px] text-neutral-800 leading-relaxed">
                  {bioLong}
                </p>
              )}
            </section>
          )}

          {/* PRIORITY RELEASE */}
          {priorityRelease && (priorityRelease.title || priorityRelease.artworkUrl) && (
            <section className="border-t border-black/5 pt-5">
              <h2 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase mb-3">
                Current Focus Release
              </h2>

              <div className="grid gap-4 md:grid-cols-[auto,1fr] items-start">
                {/* Artwork */}
                <div className="w-28 h-28 rounded-md bg-neutral-100 overflow-hidden flex-shrink-0">
                  {priorityRelease.artworkUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={priorityRelease.artworkUrl}
                      alt={priorityRelease.title || 'Release artwork'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-neutral-400">
                      Artwork
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {priorityRelease.title || 'Title TBD'}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {(priorityRelease.type || 'Single') +
                        (priorityRelease.releaseDate
                          ? ` · Released ${priorityRelease.releaseDate}`
                          : '')}
                    </p>
                  </div>

                  {priorityRelease.sellingPoints && priorityRelease.sellingPoints.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[13px] text-neutral-800 list-disc list-inside">
                      {priorityRelease.sellingPoints.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  )}

                  {priorityRelease.links && priorityRelease.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {priorityRelease.links.map((link, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-[11px] font-medium text-neutral-700"
                        >
                          {link.platform || link.label || 'Link'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* KEY TRACKS + VIDEOS */}
          {(keyTracks.length > 0 || videos.length > 0) && (
            <section className="border-t border-black/5 pt-5 grid gap-6 md:grid-cols-2">
              {/* Key tracks */}
              {keyTracks.length > 0 && (
                <div>
                  <h2 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase mb-2">
                    Key Tracks
                  </h2>
                  <ul className="space-y-2">
                    {keyTracks.map((track, idx) => (
                      <li key={idx} className="text-[13px] text-neutral-800">
                        <span className="font-semibold text-neutral-900">
                          {track.title || 'Untitled track'}
                        </span>
                        {track.description && (
                          <>
                            <span className="text-neutral-500"> · </span>
                            <span>{track.description}</span>
                          </>
                        )}
                        {track.platform && (
                          <span className="ml-1 text-neutral-500">
                            ({track.platform})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Videos */}
              {videos.length > 0 && (
                <div>
                  <h2 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase mb-2">
                    Video Highlights
                  </h2>
                  <ul className="space-y-2">
                    {videos.map((v, idx) => (
                      <li key={idx} className="text-[13px] text-neutral-800">
                        <span className="font-semibold text-neutral-900">
                          {v.title || 'Video'}
                        </span>
                        {v.type && (
                          <>
                            <span className="text-neutral-500"> · </span>
                            <span>{v.type}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* PRESS & LIVE */}
          {(pressQuotes.length > 0 || liveHighlights.length > 0) && (
            <section className="border-t border-black/5 pt-5 grid gap-6 md:grid-cols-2">
              {/* Press quotes */}
              {pressQuotes.length > 0 && (
                <div>
                  <h2 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase mb-2">
                    Press & Support
                  </h2>
                  <div className="space-y-3">
                    {pressQuotes.map((q, idx) => (
                      <figure
                        key={idx}
                        className="border-l-2 border-violet-300/80 pl-3"
                      >
                        <p className="text-[13px] italic text-neutral-800 leading-snug">
                          “{q.quote}”
                        </p>
                        {q.source && (
                          <figcaption className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-neutral-500 uppercase">
                            {q.source}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              )}

              {/* Live highlights */}
              {liveHighlights.length > 0 && (
                <div>
                  <h2 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase mb-2">
                    Live Highlights
                  </h2>
                  <ul className="space-y-1 text-[13px] text-neutral-800 list-disc list-inside">
                    {liveHighlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* LIVE / TECH NOTES */}
          {(liveSetupNotes || techNotesShort) && (
            <section className="border-t border-black/5 pt-5">
              <h2 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase mb-2">
                Live Setup & Technical
              </h2>
              <div className="space-y-2 text-[13px] text-neutral-800">
                {liveSetupNotes && (
                  <p>
                    <span className="font-semibold text-neutral-900">
                      Live setup:
                    </span>{' '}
                    {liveSetupNotes}
                  </p>
                )}
                {techNotesShort && (
                  <p>
                    <span className="font-semibold text-neutral-900">
                      Technical notes:
                    </span>{' '}
                    {techNotesShort}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* CONTACT & LINKS */}
          {(management || booking || press || socials.length > 0 || websiteUrl) && (
            <section className="border-t border-black/5 pt-5">
              <div className="grid gap-4 md:grid-cols-[2fr,1.4fr] items-start">
                {/* Contacts */}
                <div className="space-y-3 text-[13px] text-neutral-800">
                  <h2 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                    Contacts
                  </h2>
                  {management && (management.email || management.name) && (
                    <ContactLine contact={management} defaultRole="Management" />
                  )}
                  {booking && (booking.email || booking.name) && (
                    <ContactLine contact={booking} defaultRole="Bookings" />
                  )}
                  {press && (press.email || press.name) && (
                    <ContactLine contact={press} defaultRole="Press" />
                  )}
                </div>

                {/* Links */}
                <div className="space-y-2 text-[13px] text-neutral-800">
                  <h2 className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                    Links
                  </h2>
                  {websiteUrl && (
                    <p className="text-neutral-800">
                      <span className="font-semibold">Website:</span>{' '}
                      {websiteUrl}
                    </p>
                  )}
                  {socials.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {socials.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-[11px] font-medium text-neutral-700"
                        >
                          {s.platform}
                          {s.label && <span className="ml-1 text-neutral-500">· {s.label}</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function ContactLine({
  contact,
  defaultRole,
}: {
  contact: PressKitContact
  defaultRole: string
}) {
  const role =
    contact.roleLabel ||
    defaultRole

  return (
    <p>
      <span className="font-semibold text-neutral-900">
        {role}:
      </span>{' '}
      {contact.name && <span>{contact.name} · </span>}
      {contact.email && (
        <span className="text-neutral-800">{contact.email}</span>
      )}
      {contact.phone && (
        <span className="text-neutral-500"> · {contact.phone}</span>
      )}
    </p>
  )
}
