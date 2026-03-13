import { useState } from 'react'
import axios from 'axios'

export default function AdminChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (form.newPassword.length < 6) {
      return setError('New password must be at least 6 characters.')
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match.')
    }

    setLoading(true)
    try {
      const res = await axios.patch('/api/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      setSuccess(res.data.message)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-lg">
      <h1 className="text-2xl font-bold text-white mb-6">Change Password</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
            className="field-surface w-full rounded-lg px-4 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
            minLength={6}
            className="field-surface w-full rounded-lg px-4 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1.5">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            className="field-surface w-full rounded-lg px-4 py-2.5 text-sm text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-vnit-gold hover:bg-vnit-gold-light text-slate-900 font-semibold py-2.5 text-sm
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating…' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}
