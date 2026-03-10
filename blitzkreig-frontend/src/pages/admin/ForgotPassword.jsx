import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function ForgotPassword() {
  const [username, setUsername] = useState('')
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', { username })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96
                        rounded-full bg-vnit-blue/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-8 shadow-2xl space-y-7">
          <div className="text-center space-y-2">
            <div className="text-4xl">♔</div>
            <h1 className="text-2xl font-extrabold text-slate-100">Forgot Password</h1>
            <p className="text-slate-500 text-sm">
              Enter your admin username. A reset link will be sent to the club email.
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center space-y-2">
              <p className="text-green-400 text-sm font-medium">
                If the account exists, a reset link has been sent to the club email.
              </p>
              <Link to="/admin/login" className="text-vnit-blue-glow text-sm hover:underline">
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2.5 rounded-lg border border-red-500/30
                                bg-red-500/10 px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                               text-slate-200 placeholder:text-slate-600 focus:outline-none
                               focus:border-vnit-blue transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center">
                <Link to="/admin/login" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
                  ← Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
