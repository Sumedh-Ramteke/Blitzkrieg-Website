import { useState } from 'react'
import axios from 'axios'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post('/api/contact', form)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-32 pb-20">
      <div className="section-container max-w-2xl space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold mb-3">
            Get in <span className="text-gradient-blue-gold">Touch</span>
          </h1>
          <p className="text-slate-400">
            Interested in joining, sponsoring, or collaborating? Drop us a message.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-vnit-gold/40 bg-vnit-gold/10 p-8 text-center space-y-2">
            <div className="text-4xl">♔</div>
            <h3 className="text-lg font-semibold text-vnit-gold">Message sent!</h3>
            <p className="text-slate-400 text-sm">We'll get back to you within 48 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            {[
              { label: 'Your Name',     name: 'name',    type: 'text',  placeholder: 'Arjun Kulkarni'       },
              { label: 'Email Address', name: 'email',   type: 'email', placeholder: 'you@students.vnit.ac.in' },
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
                  className="field-surface w-full px-4 py-3 rounded-xl"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us why you want to join or collaborate..."
                required
                rows={5}
              className="field-surface w-full px-4 py-3 rounded-xl resize-none"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
