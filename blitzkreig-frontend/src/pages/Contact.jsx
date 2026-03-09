import { useState } from 'react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    // TODO: wire up to backend contact endpoint
    setSubmitted(true)
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
          <div className="rounded-2xl border border-vnit-blue/40 bg-vnit-blue/10 p-8 text-center space-y-2">
            <div className="text-4xl">♔</div>
            <h3 className="text-lg font-semibold text-vnit-gold">Message sent!</h3>
            <p className="text-slate-400 text-sm">We'll get back to you within 48 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                             text-slate-200 placeholder:text-slate-600 focus:outline-none
                             focus:border-vnit-blue transition-colors"
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
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700
                           text-slate-200 placeholder:text-slate-600 focus:outline-none
                           focus:border-vnit-blue transition-colors resize-none"
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
