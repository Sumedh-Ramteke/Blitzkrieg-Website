import { useState, useEffect } from 'react'
import axios from 'axios'

/* ── Role pill colour mapping ─────────────────────────────────────── */
const ROLE_COLORS = {
  'President':            'bg-vnit-gold/20 text-vnit-gold border-vnit-gold/30',
  'Vice President':       'bg-vnit-blue/20 text-vnit-blue-glow border-vnit-blue/30',
  'Secretary':            'bg-purple-500/15 text-purple-300 border-purple-500/25',
  'Treasurer':            'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  'Events Head':          'bg-orange-500/15 text-orange-300 border-orange-500/25',
  'Outreach Coordinator': 'bg-pink-500/15 text-pink-300 border-pink-500/25',
  'Training Head':        'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  'Design & Media':       'bg-rose-500/15 text-rose-300 border-rose-500/25',
}
const DEFAULT_ROLE_COLOR = 'bg-slate-700/40 text-slate-300 border-slate-600/40'

/* ── Single Member Card ───────────────────────────────────────────── */
function MemberCard({ member, index }) {
  const roleColor = ROLE_COLORS[member.role] || DEFAULT_ROLE_COLOR
  const initials  = member.name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className="group rounded-2xl border border-slate-800 bg-slate-800/50 p-6
                 hover:border-vnit-blue/40 hover:shadow-card-hover hover:-translate-y-1
                 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 0.07}s`, opacity: 0 }}
    >
      {/* Avatar */}
      <div className="mb-5">
        {member.image_url ? (
          <img
            src={member.image_url}
            alt={member.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-slate-700
                       group-hover:border-vnit-blue/50 transition-colors"
          />
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold
                          bg-gradient-to-br from-vnit-blue to-vnit-gold text-slate-900
                          border-2 border-transparent group-hover:border-vnit-blue/50 transition-colors select-none">
            {initials}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-lg font-bold text-slate-100 leading-snug mb-1">
        {member.name}
      </h3>

      {/* Role pill */}
      <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${roleColor} mb-3`}>
        {member.role}
      </span>

      {/* Branch */}
      {member.branch && (
        <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-1">
          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0v6m-6-3l6 3 6-3" />
          </svg>
          {member.branch}
        </p>
      )}
    </div>
  )
}

/* ── Skeleton Loader ──────────────────────────────────────────────── */
function MemberSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6 animate-pulse space-y-3">
      <div className="w-20 h-20 rounded-full bg-slate-700" />
      <div className="h-4 w-3/4 bg-slate-700 rounded" />
      <div className="h-3 w-1/2 bg-slate-700 rounded" />
      <div className="h-3 w-2/3 bg-slate-700 rounded" />
    </div>
  )
}

/* ── Committee Page ───────────────────────────────────────────────── */
export default function Committee() {
  const [yearLabel,  setYearLabel]  = useState(null)
  const [availYears, setAvailYears] = useState([])
  const [members,    setMembers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  /* Fetch available years on mount */
  useEffect(() => {
    axios.get('/api/committee/years')
      .then(res => { if (res.data?.length) setAvailYears(res.data) })
      .catch(() => setAvailYears([]))
  }, [])

  /* Fetch members whenever selected year changes */
  useEffect(() => {
    setLoading(true)
    setError(null)
    const url = yearLabel ? `/api/committee?year=${yearLabel}` : '/api/committee'
    axios.get(url)
      .then(res => {
        if (res.data?.data?.length) {
          setMembers(res.data.data)
          if (!yearLabel) setYearLabel(res.data.year_label)
        } else {
          setMembers([])
          if (!yearLabel && res.data?.year_label) setYearLabel(res.data.year_label)
        }
      })
      .catch(() => {
        setMembers([])
        setError('Unable to load committee members. Please check your connection and try again.')
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearLabel])

  return (
    <div className="pt-32 pb-20">
      <div className="section-container space-y-10">

        {/* ── Header ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-vnit-blue to-transparent" />
            <span className="text-vnit-blue-glow text-xs font-semibold tracking-[0.25em] uppercase">
              Club Leadership
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Our <span className="text-gradient-blue-gold">Committee</span>
          </h1>
          <p className="text-slate-400 max-w-xl text-base">
            The dedicated team steering Blitzkreig Chess Club through every season —
            organising tournaments, training sessions, and outreach initiatives.
          </p>
        </div>

        {/* ── Year Selector ── */}
        {availYears.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-500 text-sm font-medium">Academic Year:</span>
            {availYears.map(yr => (
              <button
                key={yr}
                onClick={() => setYearLabel(yr)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  yr === yearLabel
                    ? 'bg-vnit-blue border-vnit-blue text-white shadow-blue-glow'
                    : 'border-slate-700 text-slate-400 hover:border-vnit-blue/50 hover:text-vnit-blue-glow'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        )}

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <MemberSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl opacity-20">♞</div>
            <p className="text-slate-300 text-lg font-semibold">Couldn't load committee</p>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">{error}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="text-6xl opacity-20">♞</div>
            <p className="text-slate-300 text-lg font-semibold">No members listed yet</p>
            <p className="text-slate-500 text-sm">
              {yearLabel ? `No committee data available for ${yearLabel}.` : 'Committee details have not been added yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((m, i) => (
              <MemberCard key={m.id} member={m} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
