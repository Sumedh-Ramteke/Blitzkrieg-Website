import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [form, setForm]       = useState({ newPassword: '', confirmPassword: '' })
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.newPassword.length < 6) {
      return setError('Password must be at least 6 characters.')
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError('Passwords do not match.')
    }

    setLoading(true)
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword: form.newPassword })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center space-y-4 max-w-md">
          <p className="text-red-400">Invalid reset link. No token provided.</p>
          <Link to="/admin/login" className="text-vnit-blue-glow text-sm hover:underline">
            ← Back to login
          </Link>
        </div>
      </div>
    )
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
            <h1 className="text-2xl font-extrabold text-slate-100">Reset Password</h1>
            <p className="text-slate-500 text-sm">Choose a new password for your account.</p>
          </div>

          {success ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center space-y-2">
              <p className="text-green-400 text-sm font-medium">Password reset successfully!</p>
              <Link to="/admin/login" className="text-vnit-blue-glow text-sm hover:underline">
                Sign in with your new password →
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
                  <label className="text-sm font-medium text-slate-300">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                               text-slate-200 placeholder:text-slate-600 focus:outline-none
                               focus:border-vnit-blue transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
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
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
