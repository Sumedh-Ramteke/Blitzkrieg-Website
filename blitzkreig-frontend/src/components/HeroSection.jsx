import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/* ── 3-D Chess Board SVG Illustration ─────────────────────────────── */
function ChessBoardIllustration() {
  return (
    <div className="relative flex items-center justify-center w-full h-full select-none">
      {/* Backdrop glow rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-vnit-blue/20 blur-3xl animate-pulse-glow" />
        <div className="absolute w-48 h-48 rounded-full bg-vnit-gold/15 blur-2xl animate-pulse-glow [animation-delay:1.2s]" />
      </div>

      {/* Board Container */}
      <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 lg:w-[360px] lg:h-[360px] animate-float">
        {/* Glow border */}
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-vnit-blue/50 to-vnit-gold/30 blur-lg opacity-70" />

        {/* Chess board */}
        <div className="relative rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl">
          <svg
            viewBox="0 0 320 320"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Board background */}
            <rect width="320" height="320" fill="#1e293b" />

            {/* 8×8 squares */}
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 8 }).map((_, col) => {
                const isDark = (row + col) % 2 === 1
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={col * 40}
                    y={row * 40}
                    width="40"
                    height="40"
                    fill={isDark ? '#1A56DB22' : '#ffffff08'}
                    stroke="#1A56DB18"
                    strokeWidth="0.5"
                  />
                )
              })
            )}

            {/* Dark squares with subtle blue tint */}
            {Array.from({ length: 8 }).map((_, row) =>
              Array.from({ length: 8 }).map((_, col) => {
                const isDark = (row + col) % 2 === 1
                if (!isDark) return null
                return (
                  <rect
                    key={`dark-${row}-${col}`}
                    x={col * 40}
                    y={row * 40}
                    width="40"
                    height="40"
                    fill="#1A56DB"
                    opacity="0.12"
                  />
                )
              })
            )}

            {/* ── Chess Pieces (symbolic, Unicode-based text) ── */}
            {/* White King */}
            <text x="160" y="172" textAnchor="middle" fontSize="30" fill="#EAB308" opacity="0.9">♔</text>
            {/* White Queen */}
            <text x="120" y="212" textAnchor="middle" fontSize="26" fill="#f1f5f9" opacity="0.85">♕</text>
            {/* Black King */}
            <text x="160" y="132" textAnchor="middle" fontSize="30" fill="#60A5FA" opacity="0.9">♚</text>
            {/* White Rook */}
            <text x="200" y="252" textAnchor="middle" fontSize="24" fill="#f1f5f9" opacity="0.75">♖</text>
            {/* Black Knight */}
            <text x="80"  y="92"  textAnchor="middle" fontSize="24" fill="#60A5FA" opacity="0.8">♞</text>
            {/* White Bishop */}
            <text x="240" y="172" textAnchor="middle" fontSize="22" fill="#f1f5f9" opacity="0.7">♗</text>
            {/* White Pawns */}
            {[40, 80, 120, 200, 240].map((x, i) => (
              <text key={i} x={x} y="292" textAnchor="middle" fontSize="18" fill="#94a3b8" opacity="0.55">♙</text>
            ))}
            {/* Black Pawns */}
            {[80, 120, 160, 200, 240, 280].map((x, i) => (
              <text key={i} x={x} y="52" textAnchor="middle" fontSize="18" fill="#60A5FA" opacity="0.5">♟</text>
            ))}

            {/* Glowing highlight on King squares */}
            <circle cx="160" cy="160" r="22" fill="#EAB308" opacity="0.08" />
            <circle cx="160" cy="120" r="18" fill="#1A56DB" opacity="0.12" />
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ── Main Hero Section ─────────────────────────────────────────────── */
export default function HeroSection() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/events?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient">

      {/* ── Background decorative elements ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large background glow */}
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-vnit-blue/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-vnit-gold/8 blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(#60A5FA 1px, transparent 1px),
              linear-gradient(90deg, #60A5FA 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="section-container relative z-10 w-full py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left Column: Text Content ── */}
          <div className="space-y-8 animate-slide-up">

            {/* Club badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
                            border border-vnit-blue/40 bg-vnit-blue/10 text-vnit-blue-glow
                            text-xs font-semibold tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-vnit-blue animate-pulse" />
              Blitzkreig Chess Club · VNIT Nagpur
            </div>

            {/* Main headline */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tighter">
                <span className="block text-slate-100">The Chess</span>
                <span className="block text-gradient-blue-gold">Club of VNIT.</span>
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-lg">
              Strategy, precision, and competitive spirit — forged on 64 squares.
              From blitz battles to classical showdowns, we play to win.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="space-y-3">
              <p className="text-slate-500 text-sm font-medium">
                Search past tournaments & events
              </p>
              <div className="flex items-center gap-0 max-w-md rounded-xl
                              border border-slate-700 bg-slate-800/60 backdrop-blur-sm
                              focus-within:border-vnit-blue/60 focus-within:shadow-blue-glow/30
                              focus-within:shadow-lg transition-all duration-200 overflow-hidden">
                {/* Search icon */}
                <div className="pl-4 text-slate-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g. Rapid Championship 2024..."
                  className="flex-1 bg-transparent px-3 py-3.5 text-sm text-slate-200
                             placeholder:text-slate-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="m-1.5 px-5 py-2.5 rounded-lg bg-vnit-blue hover:bg-vnit-blue-light
                             text-white text-sm font-semibold transition-colors duration-200 shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a href="#events" className="btn-primary">
                View Events
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <a href="/committee" className="btn-ghost">
                Meet the Team
              </a>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-8 pt-4 border-t border-slate-800">
              {[
                { value: '200+', label: 'Members' },
                { value: '30+',  label: 'Tournaments' },
                { value: '5+',   label: 'Years Active' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-extrabold text-vnit-gold">{value}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column: 3D Chess Graphic ── */}
          <div className="relative h-[360px] sm:h-[440px] lg:h-[520px] animate-fade-in">
            <ChessBoardIllustration />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5
                      text-slate-600 text-xs tracking-widest animate-bounce">
        <span>SCROLL</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
