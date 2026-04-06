import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

function StatCard({ label, value, icon, to, color }) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6
                 hover:border-slate-700 hover:shadow-card-hover transition-all duration-200 group"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <p className={`text-4xl font-extrabold mt-1 ${color}`}>
            {value ?? <span className="text-2xl text-slate-600 animate-pulse">…</span>}
          </p>
        </div>
        <div className={`text-3xl opacity-60 group-hover:opacity-100 transition-opacity`}>{icon}</div>
      </div>
      <p className="text-slate-600 text-xs mt-4 flex items-center gap-1 group-hover:text-slate-400 transition-colors">
        Manage →
      </p>
    </Link>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [counts, setCounts] = useState({ events: null, committee: null })

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [evRes, cmRes] = await Promise.all([
          axios.get('/api/events/all?limit=1'),
          axios.get('/api/committee/years'),
        ])
        setCounts({
          events:    evRes.data?.meta?.total ?? '—',
          committee: cmRes.data?.length ?? '—',
        })
      } catch {
        setCounts({ events: '—', committee: '—' })
      }
    }
    fetchCounts()
  }, [])

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-100">
          Welcome back, <span className="text-gradient-blue-gold">{user?.username}</span>
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage your chess club content from here.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard label="Total Events"      value={counts.events}    icon="♟" to="/admin/events"    color="text-vnit-gold" />
        <StatCard label="Committee Years"   value={counts.committee} icon="♞" to="/admin/committee" color="text-vnit-gold"      />
        <StatCard label="Admin Role"        value={user?.role}       icon="♔" to="/admin"           color="text-slate-300"     />
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-800/30 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/events#new"    className="btn-primary text-sm py-2 px-4">+ Add Event</Link>
          <Link to="/admin/committee#new" className="btn-ghost  text-sm py-2 px-4">+ Add Member</Link>
          <a href="/"  target="_blank" rel="noreferrer" className="btn-ghost text-sm py-2 px-4">
            View Public Site ↗
          </a>
        </div>
      </div>
    </div>
  )
}
