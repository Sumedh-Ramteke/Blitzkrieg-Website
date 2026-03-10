import { useState, useEffect } from 'react'
import axios from 'axios'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)

  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/contact/messages')
      setMessages(res.data.messages)
    } catch (err) {
      console.error('Failed to load messages', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMessages() }, [])

  const markRead = async (id) => {
    try {
      await axios.patch(`/api/contact/messages/${id}/read`)
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await axios.delete(`/api/contact/messages/${id}`)
      setMessages(prev => prev.filter(m => m.id !== id))
    } catch (err) {
      console.error('Failed to delete message', err)
    }
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center text-slate-500">
        Loading messages…
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
          <p className="text-slate-500 text-sm mt-1">
            {messages.length} message{messages.length !== 1 && 's'}
            {unreadCount > 0 && <span className="text-vnit-gold ml-1">· {unreadCount} unread</span>}
          </p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-500">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl border p-5 transition-colors ${
                msg.is_read
                  ? 'border-slate-800 bg-slate-900/40'
                  : 'border-vnit-blue/30 bg-vnit-blue/5'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-white text-sm">{msg.name}</span>
                    {!msg.is_read && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-vnit-blue/20 text-vnit-blue-glow border border-vnit-blue/30">
                        NEW
                      </span>
                    )}
                  </div>
                  <a href={`mailto:${msg.email}`} className="text-xs text-vnit-blue-glow hover:underline">
                    {msg.email}
                  </a>
                  <p className="text-slate-400 text-sm mt-2 whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-slate-600 text-xs mt-2">
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!msg.is_read && (
                    <button
                      onClick={() => markRead(msg.id)}
                      title="Mark as read"
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-green-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    title="Delete"
                    className="p-2 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
