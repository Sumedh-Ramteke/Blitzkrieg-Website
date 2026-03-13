import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import ImagePicker from '../../components/admin/ImagePicker'

/* ── Reusable Modal ───────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="panel-surface w-full max-w-2xl rounded-2xl shadow-2xl
                      flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <button onClick={onClose}
            className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-[#1a1510]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

/* ── Event Form ───────────────────────────────────────────────────── */
const EMPTY_FORM = {
  title: '', date: '', description: '', image_url: '', is_published: true,
  participants_count: '', prize_fund: '',
  chess_results_url: '', brochure_url: '',
  winners: [],
  gallery: [],
}

const IC = 'field-surface w-full px-4 py-2.5 rounded-xl text-sm'

function SecLabel({ children }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[11px] font-bold tracking-widest uppercase text-vnit-blue-glow">{children}</span>
      <div className="flex-1 h-px bg-vnit-gold/15" />
    </div>
  )
}

function EventForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => initial || EMPTY_FORM)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addWinner    = () => set('winners', [...(form.winners || []), { position: (form.winners || []).length + 1, name: '', rating: '', category: '' }])
  const removeWinner = i  => set('winners', form.winners.filter((_, j) => j !== i))
  const setWinner    = (i, k, v) => set('winners', form.winners.map((w, j) => j === i ? { ...w, [k]: v } : w))

  const addGallery    = () => set('gallery', [...(form.gallery || []), ''])
  const removeGallery = i  => set('gallery', form.gallery.filter((_, j) => j !== i))
  const setGallery    = (i, v) => set('gallery', form.gallery.map((u, j) => j === i ? v : u))

  const handleSubmit = e => { e.preventDefault(); onSave(form) }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Basic info */}
      <SecLabel>Basic Info</SecLabel>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Title *</label>
        <input required value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="e.g. Spring Rapid 2026" className={IC} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Date *</label>
          <input required type="date" value={form.date ? form.date.slice(0, 10) : ''}
            onChange={e => set('date', e.target.value)}
            className={IC + ' [color-scheme:dark]'} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Participants</label>
          <input type="number" min="0" value={form.participants_count || ''}
            onChange={e => set('participants_count', e.target.value)}
            placeholder="e.g. 80" className={IC} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Description *</label>
        <textarea required rows={4} value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Describe the event..."
          className={IC + ' resize-none'} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Cover Image</label>
        <ImagePicker value={form.image_url || ''} onChange={v => set('image_url', v)} />
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" checked={!!form.is_published}
          onChange={e => set('is_published', e.target.checked)}
          className="w-4 h-4 accent-vnit-gold rounded" />
        <span className="text-sm text-slate-300 font-medium">Published (visible on public site)</span>
      </label>

      {/* Event details */}
      <SecLabel>Event Details</SecLabel>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Prize Fund (&#8377;)</label>
          <input type="number" min="0" value={form.prize_fund || ''}
            onChange={e => set('prize_fund', e.target.value)}
            placeholder="e.g. 15000" className={IC} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Chess-Results URL</label>
          <input type="url" value={form.chess_results_url || ''}
            onChange={e => set('chess_results_url', e.target.value)}
            placeholder="https://chess-results.com/..." className={IC} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Brochure / Notice URL</label>
        <input type="url" value={form.brochure_url || ''}
          onChange={e => set('brochure_url', e.target.value)}
          placeholder="https://..." className={IC} />
      </div>

      {/* Winners */}
      <SecLabel>Winners</SecLabel>

      <div className="space-y-2.5">
        {(form.winners || []).map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="number" min="1" value={w.position}
              onChange={e => setWinner(i, 'position', e.target.value)}
              title="Position"
              className="field-surface w-12 px-2 py-2 rounded-xl text-sm text-center" />
            <input value={w.name} onChange={e => setWinner(i, 'name', e.target.value)}
              placeholder="Name"
              className="field-surface flex-1 px-3 py-2 rounded-xl text-sm" />
            <input value={w.rating || ''} onChange={e => setWinner(i, 'rating', e.target.value)}
              placeholder="Rating"
              className="field-surface w-20 px-3 py-2 rounded-xl text-sm" />
            <input value={w.category || ''} onChange={e => setWinner(i, 'category', e.target.value)}
              placeholder="Category"
              className="field-surface w-28 px-3 py-2 rounded-xl text-sm" />
            <button type="button" onClick={() => removeWinner(i)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {(form.winners || []).length > 0 && (
          <p className="text-[11px] text-slate-600">Pos · Name · FIDE Rating (optional) · Category (optional)</p>
        )}
        <button type="button" onClick={addWinner}
          className="text-sm text-vnit-blue-glow hover:text-vnit-gold transition-colors font-medium">
          + Add Winner
        </button>
      </div>

      {/* Gallery */}
      <SecLabel>Photo Gallery</SecLabel>

      <div className="space-y-4">
        {(form.gallery || []).map((url, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Photo {i + 1}</span>
              <button type="button" onClick={() => removeGallery(i)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
            </div>
            <ImagePicker value={url} onChange={v => setGallery(i, v)} type="gallery" />
          </div>
        ))}
        <button type="button" onClick={addGallery}
          className="text-sm text-vnit-blue-glow hover:text-vnit-gold transition-colors font-medium">
          + Add Photo
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-800">
        <button type="submit" disabled={saving}
          className="btn-primary flex-1 justify-center disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Event'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost flex-1 justify-center">
          Cancel
        </button>
      </div>
    </form>
  )
}

/* ── Confirm Delete Dialog ────────────────────────────────────────── */
function ConfirmDelete({ title, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Delete Event" onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-slate-300 text-sm">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold text-slate-100">"{title}"</span>?
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm
                       font-semibold transition-colors disabled:opacity-60">
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
          <button onClick={onCancel} className="btn-ghost flex-1 justify-center text-sm">Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Admin Events Page ────────────────────────────────────────────── */
export default function AdminEvents() {
  const [events,    setEvents]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)   // null | 'new' | { type:'edit'|'delete', event }
  const [saving,    setSaving]    = useState(false)
  const [toast,     setToast]     = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/events/all?limit=200')
      setEvents(res.data?.data || res.data || [])
    } catch { setEvents([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const extractError = (e, fallback) => {
    const data = e.response?.data
    if (!data) return fallback
    if (data.errors?.length) return data.errors.map(err => err.msg).join('  •  ')
    return data.error || fallback
  }

  const sanitizeEvent = (form) => ({
    ...form,
    date:               new Date(form.date).toISOString(),
    image_url:          form.image_url?.trim()          || null,
    participants_count: form.participants_count !== '' ? Number(form.participants_count) : null,
    prize_fund:         form.prize_fund         !== '' ? Number(form.prize_fund)         : null,
    chess_results_url:  form.chess_results_url?.trim() || null,
    brochure_url:       form.brochure_url?.trim()       || null,
    winners:            (form.winners  || []).filter(w => w.name?.trim()).map(w => ({
                          position: Number(w.position) || 1,
                          name:     w.name.trim(),
                          ...(w.rating   && { rating:   Number(w.rating) }),
                          ...(w.category && { category: w.category.trim() }),
                        })),
    gallery:            (form.gallery || []).filter(u => u?.trim()),
  })

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await axios.post('/api/events', sanitizeEvent(form))
      showToast('Event created successfully.')
      setModal(null)
      fetchEvents()
    } catch (e) {
      showToast(extractError(e, 'Failed to create event.'), 'error')
    } finally { setSaving(false) }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await axios.patch(`/api/events/${modal.event.id}`, sanitizeEvent(form))
      showToast('Event updated successfully.')
      setModal(null)
      fetchEvents()
    } catch (e) {
      showToast(extractError(e, 'Failed to update event.'), 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await axios.delete(`/api/events/${modal.event.id}`)
      showToast('Event deleted.')
      setModal(null)
      fetchEvents()
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to delete event.', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-medium shadow-lg
                         border transition-all duration-300 ${
                           toast.type === 'error'
                             ? 'bg-red-900/90 border-red-700 text-red-200'
                             : 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
                         }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">Events</h1>
          <p className="text-slate-500 text-sm mt-0.5">{events.length} total event{events.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">
          + Add Event
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm animate-pulse">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="text-5xl opacity-20">♟</div>
            <p className="text-slate-400">No events yet. Add your first one!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="text-left px-6 py-3">Title</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">Date</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Status</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map(ev => (
                <tr key={ev.id} className="hover:bg-[#1a1510]/70 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                      {ev.title}
                    </div>
                    <div className="text-slate-500 text-xs mt-0.5 line-clamp-1 sm:hidden">
                      {new Date(ev.date).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 hidden sm:table-cell whitespace-nowrap">
                    {new Date(ev.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      ev.is_published
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                        : 'bg-slate-700/40 text-slate-400 border-slate-600/40'
                    }`}>
                      {ev.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setModal({ type: 'edit', event: ev })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-vnit-gold
                                   bg-vnit-gold/10 hover:bg-vnit-gold/20 border border-vnit-gold/20
                                   transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setModal({ type: 'delete', event: ev })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400
                                   bg-red-500/10 hover:bg-red-500/20 border border-red-500/20
                                   transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {modal === 'new' && (
        <Modal title="Add New Event" onClose={() => setModal(null)}>
          <EventForm onSave={handleCreate} onCancel={() => setModal(null)} saving={saving} />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title="Edit Event" onClose={() => setModal(null)}>
          <EventForm
            initial={{
              ...modal.event,
              date:               modal.event.date?.slice(0, 10),
              participants_count: modal.event.participants_count ?? '',
              prize_fund:         modal.event.prize_fund         ?? '',
              chess_results_url:  modal.event.chess_results_url  ?? '',
              brochure_url:       modal.event.brochure_url        ?? '',
              winners:            Array.isArray(modal.event.winners) ? modal.event.winners : [],
              gallery:            Array.isArray(modal.event.gallery) ? modal.event.gallery : [],
            }}
            onSave={handleUpdate}
            onCancel={() => setModal(null)}
            saving={saving}
          />
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <ConfirmDelete
          title={modal.event.title}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={saving}
        />
      )}
    </div>
  )
}
