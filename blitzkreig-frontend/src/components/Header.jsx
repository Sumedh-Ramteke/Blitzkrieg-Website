import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Home',      to: '/'          },
  { label: 'Events',    to: '/events'    },
  { label: 'Committee', to: '/committee' },
  { label: 'About Us',  to: '/about'     },
  { label: 'Contact',   to: '/contact'   },
]

export default function Header() {
  const [scrolled,      setScrolled]      = useState(false)
  const [mobileOpen,    setMobileOpen]    = useState(false)
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location])

  // Shrink header on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0d0d0d]/95 backdrop-blur-md border-b border-slate-800/60 py-3 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="section-container">
        <nav className="flex items-center justify-between">

          {/* ── Logo ── */}
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            {/* King piece SVG icon */}
            <span className="text-2xl select-none group-hover:animate-pulse-glow transition-all">
              ♔
            </span>
            <span className="leading-tight">
              <span className="block text-base font-extrabold tracking-tight text-white group-hover:text-vnit-gold-light transition-colors">
                Blitzkrieg
              </span>
              <span className="block text-[10px] font-semibold tracking-[0.2em] text-vnit-gold uppercase">
                Chess Club VNIT
              </span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <ul className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `nav-link pb-1 ${isActive ? 'text-vnit-gold active' : ''}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ── Desktop CTA ── */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/contact" className="btn-primary text-sm py-2 px-5">
              Join the Club
            </Link>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="Toggle navigation"
          >
            <span
              className={`block w-6 h-0.5 bg-slate-300 transition-transform duration-300 ${
                mobileOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-slate-300 transition-opacity duration-300 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-slate-300 transition-transform duration-300 ${
                mobileOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </nav>

        {/* ── Mobile Menu ── */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <ul className="border border-slate-800/60 rounded-xl bg-[#0d0d0d]/95 backdrop-blur-md divide-y divide-slate-800/60">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `block px-5 py-3.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-vnit-gold bg-slate-800/50'
                        : 'text-slate-300 hover:text-vnit-gold hover:bg-slate-800/30'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li className="p-4">
              <Link to="/contact" className="btn-primary w-full justify-center text-sm">
                Join the Club
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}
