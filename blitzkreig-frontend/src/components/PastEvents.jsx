import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

/* ── helpers ─────────────────────────────────────────────────────── */
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=640&q=80'

function startOfToday() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d
}

/** Returns a human-readable "in X days" / "Tomorrow" / "Today!" label */
function daysFromNow(dateStr) {
  const diff = Math.round((new Date(dateStr) - startOfToday()) / 86400000)
  if (diff === 0) return 'Today!'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} day${diff !== 1 ? 's' : ''}`
}

/* ── Tag Badge ────────────────────────────────────────────────────── */
function TagBadge({ label }) {
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide
                     bg-vnit-blue/15 text-vnit-blue-glow border border-vnit-blue/25">
      {label}
    </span>
  )
}

/* ── Upcoming Event Card ──────────────────────────────────────────── */
function UpcomingCard({ event, index }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const countdown = daysFromNow(event.date)
  const isToday   = countdown === 'Today!'

  return (
    <article
      className="relative rounded-2xl overflow-hidden border border-vnit-gold/30
                 bg-gradient-to-br from-slate-800/80 via-slate-900 to-slate-800/60
                 shadow-[0_0_40px_-8px_rgba(212,175,55,0.18)]
                 flex flex-col sm:flex-row animate-fade-in group"
      style={{ animationDelay: `${index * 0.12}s`, opacity: 0 }}
    >
      {/* Gold glow left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-vnit-gold via-vnit-gold/60 to-transparent" />

      {/* Image */}
      <div className="sm:w-[35%] shrink-0 overflow-hidden bg-slate-800 relative">
        <div className="relative h-56 sm:h-full min-h-[220px]">
          <img
            src={event.image_url || FALLBACK_IMG}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover
                       group-hover:scale-105 transition-transform duration-500 brightness-90"
            loading="lazy"
            onError={e => { e.target.src = FALLBACK_IMG }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/30 hidden sm:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 sm:hidden" />

          {/* Countdown pill over image */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider
                           uppercase shadow-lg backdrop-blur-sm border
                           ${isToday
                             ? 'bg-vnit-gold text-slate-900 border-vnit-gold/80 animate-pulse'
                             : 'bg-slate-900/80 text-vnit-gold border-vnit-gold/40'}`}>
            {countdown}
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="sm:w-[65%] flex flex-col justify-between p-6 lg:p-8 gap-4 pl-8">
        {/* Badge row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold
                           tracking-widest uppercase bg-vnit-gold/15 text-vnit-gold border border-vnit-gold/30">
            <span className={`w-1.5 h-1.5 rounded-full bg-vnit-gold ${isToday ? 'animate-pulse' : ''}`} />
            Upcoming Event
          </span>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
            <svg className="w-3.5 h-3.5 text-vnit-gold/70" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {formattedDate}
          </div>
        </div>

        {/* Title + description */}
        <div className="space-y-2.5">
          <h3 className="text-2xl lg:text-3xl font-extrabold text-white leading-snug tracking-tight">
            {event.title}
          </h3>
          <p className="text-slate-400 text-sm lg:text-base leading-relaxed line-clamp-3">
            {event.description}
          </p>
        </div>

        {/* Meta + CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-vnit-gold/20 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
            {event.participants_count && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
                {event.participants_count} players
              </span>
            )}
            {event.prize_fund && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ₹{event.prize_fund.toLocaleString('en-IN')} prize
              </span>
            )}
          </div>
          <Link to={`/events/${event.id}`}
            className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm
                       bg-vnit-gold text-slate-900 hover:bg-vnit-gold/90
                       transition-colors duration-200 shadow-md group/btn">
            View Details
            <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}

/* ── Past Event Card (30:70 image:text ratio on desktop) ─────────── */
function EventCard({ event, index }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article
      className="event-card flex-col sm:flex-row animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s`, opacity: 0 }}
    >
      {/* ── Image Column — 30% desktop ── */}
      <div className="sm:w-[30%] shrink-0 overflow-hidden bg-slate-800">
        <div className="relative h-52 sm:h-full min-h-[200px]">
          <img
            src={event.image_url || FALLBACK_IMG}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover
                       group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={e => { e.target.src = FALLBACK_IMG }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/20 sm:block hidden" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/40 sm:hidden" />
        </div>
      </div>

      {/* ── Text Column — 70% desktop ── */}
      <div className="sm:w-[70%] flex flex-col justify-between p-6 lg:p-8 gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <svg className="w-3.5 h-3.5 text-vnit-gold" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {formattedDate}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(event.tags || []).map(tag => <TagBadge key={tag} label={tag} />)}
          </div>
        </div>

        <div className="space-y-2.5">
          <h3 className="text-xl lg:text-2xl font-bold text-slate-100 leading-snug
                         hover:text-vnit-gold transition-colors duration-200 cursor-default">
            {event.title}
          </h3>
          <p className="text-slate-400 text-sm lg:text-base leading-relaxed line-clamp-4">
            {event.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-vnit-gold/60" />
            Tournament · VNIT Nagpur
          </div>
          <Link to={`/events/${event.id}`}
                className="text-vnit-blue-glow hover:text-vnit-gold text-sm font-semibold
                           flex items-center gap-1.5 transition-colors duration-200 group">
            Read more
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                 fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}

/* ── Skeleton Loader ──────────────────────────────────────────────── */
function EventSkeleton() {
  return (
    <div className="event-card flex-col sm:flex-row animate-pulse">
      <div className="sm:w-[30%] bg-slate-800 min-h-[200px] sm:min-h-full rounded-l-2xl" />
      <div className="sm:w-[70%] p-6 lg:p-8 space-y-4">
        <div className="flex gap-3">
          <div className="h-3 w-24 bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-700 rounded" />
        </div>
        <div className="h-6 w-3/4 bg-slate-700 rounded" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-700 rounded w-full" />
          <div className="h-3 bg-slate-700 rounded w-5/6" />
          <div className="h-3 bg-slate-700 rounded w-4/6" />
        </div>
        <div className="h-px bg-slate-700" />
        <div className="flex justify-between">
          <div className="h-3 w-28 bg-slate-700 rounded" />
          <div className="h-3 w-20 bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  )
}

/* ── Sub-section label ────────────────────────────────────────────── */
function SubHeading({ accent, children, sub }) {
  return (
    <div className="mb-8 space-y-2">
      <div className="flex items-center gap-3">
        <div className={`h-px flex-1 max-w-[60px] bg-gradient-to-r ${accent} to-transparent`} />
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-500">{sub}</span>
      </div>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">{children}</h2>
    </div>
  )
}

/* ── Events Section (upcoming + past) ───────────────────────────── */
export default function PastEvents({ searchQuery = '' }) {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        const params = new URLSearchParams({ limit: 100 })
        if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
        const res = await axios.get(`/api/events?${params}`)
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        setEvents(list)
      } catch {
        setEvents([])
        setError('Unable to load events. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [debouncedSearch])

  /* ── Split by today ── */
  const today    = startOfToday()
  const upcoming = events
    .filter(e => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))   // soonest first
  const past = events
    .filter(e => new Date(e.date) < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date))   // newest first

  const isSearching = !!searchQuery

  return (
    <section id="events" className="py-20 lg:py-28 bg-slate-900">
      <div className="section-container space-y-20">

        {/* ── Loading / Error states ── */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <EventSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl opacity-20">♟</div>
            <p className="text-slate-300 text-lg font-semibold">Couldn't load events</p>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl opacity-20">♟</div>
            {isSearching ? (
              <>
                <p className="text-slate-300 text-lg font-semibold">No results found</p>
                <p className="text-slate-500 text-sm">No events match &quot;{searchQuery}&quot;. Try a different search.</p>
              </>
            ) : (
              <>
                <p className="text-slate-300 text-lg font-semibold">No events yet</p>
                <p className="text-slate-500 text-sm">Events will appear here once they are added.</p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* ── UPCOMING EVENTS ── */}
            {upcoming.length > 0 && (
              <div>
                <SubHeading accent="from-vnit-gold" sub="On the Horizon">
                  Upcoming{' '}
                  <span className="text-gradient-blue-gold">Events</span>
                </SubHeading>
                {isSearching && (
                  <p className="text-slate-500 text-sm mb-6">
                    Showing <span className="text-vnit-gold font-semibold">{upcoming.length}</span> upcoming
                    {' '}result{upcoming.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                  </p>
                )}
                <div className="space-y-6">
                  {upcoming.map((event, i) => (
                    <UpcomingCard key={event.id} event={event} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* ── PAST EVENTS ── */}
            {past.length > 0 && (
              <div>
                <SubHeading accent="from-vnit-blue" sub="Tournament History">
                  Past{' '}
                  <span className="text-gradient-blue-gold">Events</span>
                </SubHeading>
                {isSearching && (
                  <p className="text-slate-500 text-sm mb-6">
                    Showing <span className="text-vnit-gold font-semibold">{past.length}</span> past
                    {' '}result{past.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                  </p>
                )}
                <p className="text-slate-400 text-base lg:text-lg max-w-2xl -mt-4 mb-8">
                  A chronicle of battles hard-fought across the board — rapid, blitz, and classical
                  tournaments that have shaped the competitive spirit of VNIT.
                </p>
                <div className="space-y-6">
                  {past.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} />
                  ))}
                </div>

                {!isSearching && past.length >= 4 && (
                  <div className="mt-12 text-center">
                    <a href="/events" className="btn-ghost">
                      View All Events
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Edge case: only upcoming events exist (no past yet) */}
            {past.length === 0 && upcoming.length > 0 && !isSearching && (
              <p className="text-slate-600 text-sm text-center">
                No past events yet — check back after the tournament!
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
