import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/admin'

  const [form,    setForm]    = useState({ username: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96
                        rounded-full bg-vnit-blue/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-8 shadow-2xl space-y-7">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="text-4xl">♔</div>
            <h1 className="text-2xl font-extrabold text-slate-100">Admin Login</h1>
            <p className="text-slate-500 text-sm">Blitzkrieg Chess Club VNIT</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-lg border border-red-500/30
                            bg-red-500/10 px-4 py-3 text-red-400 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Username', name: 'username', type: 'text',     placeholder: 'admin'      },
              { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••'  },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name} className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  autoComplete={name === 'password' ? 'current-password' : 'username'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                             text-slate-200 placeholder:text-slate-600 focus:outline-none
                             focus:border-vnit-blue transition-colors"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-slate-600 text-xs">
            This area is restricted to authorised club administrators.
          </p>
          <p className="text-center">
            <Link to="/admin/forgot-password" className="text-slate-500 hover:text-vnit-blue-glow text-sm transition-colors">
              Forgot Password?
            </Link>
          </p>
        </div>

        {/* Back to site */}
        <div className="mt-5 text-center">
          <a href="/" className="text-slate-600 hover:text-slate-400 text-sm transition-colors">
            ← Back to main site
          </a>
        </div>
      </div>
    </div>
  )
}
