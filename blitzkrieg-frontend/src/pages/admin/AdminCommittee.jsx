import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import ImagePicker from '../../components/admin/ImagePicker'

/* ── Modal wrapper ────────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="panel-surface w-full max-w-lg rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">{title}</h3>
          <button onClick={onClose}
            className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-[#1a1510]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

/* ── Member Form ──────────────────────────────────────────────────── */
const EMPTY = { name: '', role: '', year_label: '', branch: '', image_url: '', sort_order: 100, is_active: true }

function MemberForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = e => { e.preventDefault(); onSave(form) }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2">
          <label className="text-sm font-medium text-slate-300">Full Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Arjun Mehta"
            className="field-surface w-full px-4 py-2.5 rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Role / Position *</label>
          <input required value={form.role} onChange={e => set('role', e.target.value)}
            placeholder="e.g. President"
            className="field-surface w-full px-4 py-2.5 rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Academic Year *</label>
          <input required value={form.year_label} onChange={e => set('year_label', e.target.value)}
            placeholder="e.g. 2025-26"
            className="field-surface w-full px-4 py-2.5 rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Branch & Year</label>
          <input value={form.branch || ''} onChange={e => set('branch', e.target.value)}
            placeholder="e.g. CSE, 3rd Year"
            className="field-surface w-full px-4 py-2.5 rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Sort Order</label>
          <input type="number" min={0} value={form.sort_order}
            onChange={e => set('sort_order', parseInt(e.target.value, 10))}
            className="field-surface w-full px-4 py-2.5 rounded-xl" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-300">Photo</label>
        <ImagePicker value={form.image_url || ''} onChange={v => set('image_url', v)} />
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_active}
          onChange={e => set('is_active', e.target.checked)}
          className="w-4 h-4 accent-vnit-gold rounded" />
        <span className="text-sm text-slate-300 font-medium">Active (shown on site)</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">
          {saving ? 'Saving…' : 'Save Member'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost flex-1 justify-center">Cancel</button>
      </div>
    </form>
  )
}

/* ── Confirm Delete ───────────────────────────────────────────────── */
function ConfirmDelete({ name, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Remove Member" onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-slate-300 text-sm">
          Remove <span className="font-semibold text-slate-100">"{name}"</span> from the committee?
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm
                       font-semibold transition-colors disabled:opacity-60">
            {loading ? 'Removing…' : 'Yes, Remove'}
          </button>
          <button onClick={onCancel} className="btn-ghost flex-1 justify-center text-sm">Cancel</button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Admin Committee Page ─────────────────────────────────────────── */
export default function AdminCommittee() {
  const [yearLabel,  setYearLabel]  = useState(null)
  const [years,      setYears]      = useState([])
  const [members,    setMembers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [toast,      setToast]      = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* Fetch available years */
  useEffect(() => {
    axios.get('/api/committee/years').then(r => setYears(r.data || [])).catch(() => {})
  }, [])

  /* Fetch members for selected year */
  const fetchMembers = useCallback(async (yr) => {
    setLoading(true)
    try {
      const url = yr ? `/api/committee?year=${yr}` : '/api/committee'
      const res = await axios.get(url)
      setMembers(res.data?.data || [])
      if (!yr && res.data?.year_label) setYearLabel(res.data.year_label)
    } catch { setMembers([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMembers(yearLabel) }, [yearLabel, fetchMembers])

  /* Refresh years list after mutations */
  const refreshYears = async () => {
    try { const r = await axios.get('/api/committee/years'); setYears(r.data || []) } catch {}
  }

  // Helper: extract a readable error string from axios error response
  const extractError = (e, fallback) => {
    const data = e.response?.data
    if (!data) return fallback
    if (data.errors?.length) return data.errors.map(err => err.msg).join('  \u2022  ')
    return data.error || fallback
  }

  // Helper: sanitize form — empty strings → null, guard NaN sort_order
  const sanitizeMember = (form) => ({
    ...form,
    image_url:  form.image_url?.trim()  || null,
    branch:     form.branch?.trim()     || null,
    sort_order: isNaN(Number(form.sort_order)) ? 100 : Number(form.sort_order),
  })

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await axios.post('/api/committee', sanitizeMember(form))
      showToast('Member added successfully.')
      setModal(null)
      await refreshYears()
      fetchMembers(form.year_label)
      setYearLabel(form.year_label)
    } catch (e) {
      showToast(extractError(e, 'Failed to add member.'), 'error')
    } finally { setSaving(false) }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await axios.patch(`/api/committee/${modal.member.id}`, sanitizeMember(form))
      showToast('Member updated successfully.')
      setModal(null)
      fetchMembers(yearLabel)
    } catch (e) {
      showToast(extractError(e, 'Failed to update member.'), 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await axios.delete(`/api/committee/${modal.member.id}`)
      showToast('Member removed.')
      setModal(null)
      fetchMembers(yearLabel)
    } catch (e) {
      showToast(e.response?.data?.error || 'Failed to remove member.', 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-medium shadow-lg border ${
          toast.type === 'error'
            ? 'bg-red-900/90 border-red-700 text-red-200'
            : 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100">Committee</h1>
          <p className="text-slate-500 text-sm mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''} for {yearLabel || '…'}</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary">+ Add Member</button>
      </div>

      {/* Year switcher */}
      {years.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-slate-500 text-sm font-medium">Academic Year:</span>
          {years.map(yr => (
            <button key={yr} onClick={() => setYearLabel(yr)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                yr === yearLabel
                  ? 'bg-vnit-gold border-vnit-gold text-slate-900 shadow-gold-glow'
                  : 'border-slate-700 text-slate-400 hover:border-vnit-gold/50 hover:text-vnit-gold'
              }`}>
              {yr}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm animate-pulse">Loading members…</div>
        ) : members.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="text-5xl opacity-20">♞</div>
            <p className="text-slate-400">No members for this year. Add the first one!</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">Role</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Branch</th>
                <th className="text-left px-6 py-3 hidden lg:table-cell">Order</th>
                <th className="text-left px-6 py-3 hidden md:table-cell">Status</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map(m => (
                <tr key={m.id} className="hover:bg-[#1a1510]/70 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {m.image_url ? (
                        <img src={m.image_url} alt={m.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vnit-gold-dark to-vnit-gold
                                        flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">
                          {m.name.split(' ').map(w => w[0]).slice(0,2).join('')}
                        </div>
                      )}
                      <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                        {m.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 hidden sm:table-cell">{m.role}</td>
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell text-xs">{m.branch || '—'}</td>
                  <td className="px-6 py-4 text-slate-600 hidden lg:table-cell text-xs">{m.sort_order}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      m.is_active
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                        : 'bg-slate-700/40 text-slate-400 border-slate-600/40'
                    }`}>{m.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setModal({ type: 'edit', member: m })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-vnit-gold
                                   bg-vnit-gold/10 hover:bg-vnit-gold/20 border border-vnit-gold/20 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setModal({ type: 'delete', member: m })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400
                                   bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-colors">
                        Remove
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
        <Modal title="Add Committee Member" onClose={() => setModal(null)}>
          <MemberForm
            initial={{ ...EMPTY, year_label: yearLabel || '' }}
            onSave={handleCreate} onCancel={() => setModal(null)} saving={saving} />
        </Modal>
      )}
      {modal?.type === 'edit' && (
        <Modal title="Edit Member" onClose={() => setModal(null)}>
          <MemberForm initial={modal.member} onSave={handleUpdate} onCancel={() => setModal(null)} saving={saving} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <ConfirmDelete name={modal.member.name} onConfirm={handleDelete} onCancel={() => setModal(null)} loading={saving} />
      )}
    </div>
  )
}
