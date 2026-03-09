import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

/* ── Medal colours ─────────────────────────────────────────────── */
const MEDAL = {
  1: { bg: 'bg-amber-400/15 border-amber-400/30', text: 'text-amber-300', label: '🥇' },
  2: { bg: 'bg-slate-400/15 border-slate-400/30', text: 'text-slate-300', label: '🥈' },
  3: { bg: 'bg-orange-600/15 border-orange-600/30', text: 'text-orange-300', label: '🥉' },
}
const medalFor = n => MEDAL[n] || { bg: 'bg-slate-700/30 border-slate-600/30', text: 'text-slate-400', label: `#${n}` }

/* ── Lightbox ──────────────────────────────────────────────────── */
function Lightbox({ images, index, onClose }) {
  const [cur, setCur] = useState(index)
  const prev = () => setCur(c => (c - 1 + images.length) % images.length)
  const next = () => setCur(c => (c + 1) % images.length)

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
         onClick={onClose}>
      <button onClick={onClose}
              className="absolute top-5 right-5 text-white/70 hover:text-white text-3xl leading-none">
        ×
      </button>
      {images.length > 1 && (
        <>
          <button onClick={e => { e.stopPropagation(); prev() }}
                  className="absolute left-4 text-white/70 hover:text-white text-4xl font-light px-3 py-2">‹</button>
          <button onClick={e => { e.stopPropagation(); next() }}
                  className="absolute right-4 text-white/70 hover:text-white text-4xl font-light px-3 py-2">›</button>
        </>
      )}
      <img
        src={images[cur]}
        alt={`Gallery ${cur + 1}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
      <p className="absolute bottom-5 text-white/50 text-sm">{cur + 1} / {images.length}</p>
    </div>
  )
}

/* ── Skeleton ──────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="pt-32 pb-20 animate-pulse">
      <div className="section-container space-y-8 max-w-4xl">
        <div className="h-6 w-24 bg-slate-800 rounded" />
        <div className="h-10 w-3/4 bg-slate-800 rounded" />
        <div className="h-64 bg-slate-800 rounded-2xl" />
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-4 bg-slate-800 rounded" />)}
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function EventDetail() {
  const { id } = useParams()
  const [event,    setEvent]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [lightbox, setLightbox] = useState(null)   // index | null

  useEffect(() => {
    axios.get(`/api/events/${id}`)
      .then(res => setEvent(res.data))
      .catch(err => setError(err.response?.status === 404 ? 'Event not found.' : 'Failed to load event.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="pt-40 pb-20 text-center space-y-4">
        <div className="text-6xl opacity-20">♟</div>
        <p className="text-slate-300 text-xl font-semibold">{error}</p>
        <Link to="/events" className="btn-ghost inline-flex">← Back to Events</Link>
      </div>
    )
  }

  const gallery  = Array.isArray(event.gallery) ? event.gallery : []
  const winners  = Array.isArray(event.winners) ? event.winners : []
  const fmtDate  = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const fmtPrize = event.prize_fund ? `₹${Number(event.prize_fund).toLocaleString('en-IN')}` : null

  return (
    <div className="pt-32 pb-24">
      <div className="section-container max-w-4xl space-y-12">

        {/* ── Back link ── */}
        <Link to="/events"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-vnit-blue-glow
                         text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </Link>

        {/* ── Hero ── */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <svg className="w-3.5 h-3.5 text-vnit-gold" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {fmtDate}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {event.title}
          </h1>

          {/* ── Quick stats row ── */}
          {(event.participants_count || fmtPrize) && (
            <div className="flex flex-wrap gap-3">
              {event.participants_count && (
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl
                                 border border-slate-700 bg-slate-800/50 text-sm text-slate-300">
                  <span className="text-vnit-blue-glow font-bold text-lg">{event.participants_count}</span>
                  Participants
                </span>
              )}
              {fmtPrize && (
                <span className="flex items-center gap-2 px-4 py-2 rounded-xl
                                 border border-vnit-gold/30 bg-vnit-gold/10 text-sm text-vnit-gold">
                  <span className="font-bold text-lg">{fmtPrize}</span>
                  Prize Fund
                </span>
              )}
            </div>
          )}

          {/* ── External links ── */}
          <div className="flex flex-wrap gap-3">
            {event.chess_results_url && (
              <a href={event.chess_results_url} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-2 btn-ghost text-sm py-2 px-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Results
              </a>
            )}
            {event.brochure_url && (
              <a href={event.brochure_url} target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-2 btn-ghost text-sm py-2 px-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Brochure / Notice
              </a>
            )}
          </div>
        </div>

        {/* ── Cover image ── */}
        {event.image_url && (
          <div className="rounded-2xl overflow-hidden border border-slate-800 max-h-[420px]">
            <img src={event.image_url} alt={event.title}
                 className="w-full h-full object-cover" />
          </div>
        )}

        {/* ── Description ── */}
        <div className="prose prose-invert prose-slate max-w-none
                        prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-base lg:prose-p:text-lg">
          <p>{event.description}</p>
        </div>

        {/* ── Winners podium ── */}
        {winners.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>🏆</span> Winners
            </h2>
            <div className="space-y-3">
              {winners.map((w, i) => {
                const m = medalFor(w.position ?? i + 1)
                return (
                  <div key={i}
                       className={`flex items-center gap-4 px-5 py-4 rounded-2xl border ${m.bg}`}>
                    <span className={`text-2xl w-8 text-center font-extrabold ${m.text}`}>
                      {m.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-100 text-base truncate">{w.name}</p>
                      {w.category && (
                        <p className="text-xs text-slate-500 mt-0.5">{w.category}</p>
                      )}
                    </div>
                    {w.rating && (
                      <span className="text-xs text-slate-500 font-mono shrink-0">Rating {w.rating}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Photo gallery ── */}
        {gallery.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>📷</span> Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((url, i) => (
                <button key={i} onClick={() => setLightbox(i)}
                        className="relative overflow-hidden rounded-xl aspect-video bg-slate-800
                                   hover:ring-2 hover:ring-vnit-blue/50 transition-all duration-200 group">
                  <img src={url} alt={`Photo ${i + 1}`}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                       loading="lazy" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <Lightbox images={gallery} index={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}
