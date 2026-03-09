import { useRef, useState } from 'react'
import axios from 'axios'

/**
 * ImagePicker — reusable image field for admin forms.
 *
 * Props:
 *   value      {string}   current image_url (controlled)
 *   onChange   {fn}       called with the new URL string whenever it changes
 *   type       {string}   upload profile: 'cover' (default) | 'gallery' | 'avatar'
 *                         Passed as ?type= to the upload endpoint so the server
 *                         can apply the right compression profile.
 *
 * Behaviour:
 *   • "Upload" tab — drag-and-drop or click to pick a local file.
 *       Large images are pre-shrunk client-side via Canvas (max 2000px, JPEG 90%)
 *       before sending to POST /api/upload (multer → sharp → WebP).
 *       This cuts upload bandwidth significantly for large source files.
 *   • "URL" tab — paste an external URL directly into a text input.
 *   • Live preview is shown below both tabs whenever a URL exists.
 *   • The "Clear" button wipes to empty (onChange(''))
 */

/** Client-side pre-shrink: reduces upload size for large source images.
 *  Cap: 2000px on the longest side, JPEG 90% (further compressed server-side).
 *  Falls through unchanged for images already within the limit. */
function preshrink(file, maxPx = 2000) {
  return new Promise((resolve) => {
    // Non-raster or very small files: skip canvas entirely
    const skipTypes = ['image/gif', 'image/svg+xml', 'image/webp']
    if (skipTypes.includes(file.type)) return resolve(file)

    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { naturalWidth: w, naturalHeight: h } = img
      if (w <= maxPx && h <= maxPx) return resolve(file)   // already small enough

      const scale  = maxPx / Math.max(w, h)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.90)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export default function ImagePicker({ value, onChange, type = 'cover' }) {
  const [tab,        setTab]        = useState('upload')   // 'upload' | 'url'
  const [uploading,  setUploading]  = useState(false)
  const [uploadErr,  setUploadErr]  = useState(null)
  const [dragOver,   setDragOver]   = useState(false)
  const inputRef = useRef(null)

  /* ── helpers ── */
  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadErr('Please pick an image file (JPEG, PNG, WebP, etc.).')
      return
    }
    setUploading(true)
    setUploadErr(null)
    try {
      const ready = await preshrink(file)          // client-side pre-shrink
      const fd = new FormData()
      fd.append('image', ready)
      const res = await axios.post(`/api/upload?type=${type}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(res.data.url)
    } catch (e) {
      setUploadErr(e.response?.data?.error || 'Upload failed. Try again.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onFileInput  = e => handleFile(e.target.files[0])
  const onDrop       = e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }
  const onDragOver   = e => { e.preventDefault(); setDragOver(true)  }
  const onDragLeave  = ()  => setDragOver(false)

  return (
    <div className="space-y-3">
      {/* ── Tabs ── */}
      <div className="flex rounded-xl overflow-hidden border border-slate-700 text-xs font-semibold w-fit">
        {['upload', 'url'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setUploadErr(null) }}
            className={`px-4 py-1.5 transition-colors capitalize ${
              tab === t
                ? 'bg-vnit-blue text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'upload' ? '⬆ Upload File' : '🔗 Enter URL'}
          </button>
        ))}
      </div>

      {/* ── Upload tab ── */}
      {tab === 'upload' && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
                      px-6 py-7 cursor-pointer select-none transition-colors
                      ${dragOver
                        ? 'border-vnit-blue bg-vnit-blue/10'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-800/40'
                      }
                      ${uploading ? 'pointer-events-none opacity-70' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileInput}
          />

          {uploading ? (
            <>
              <svg className="w-6 h-6 text-vnit-blue-glow animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              <span className="text-slate-400 text-xs">Processing &amp; uploading…</span>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-slate-400 text-xs text-center leading-relaxed">
                <span className="text-vnit-blue-glow font-semibold">Click to browse</span>
                {' '}or drag &amp; drop<br/>
                <span className="text-slate-600">JPEG · PNG · WebP · GIF — max 15 MB</span>
              </p>
              <p className="text-[10px] text-slate-600">Saved as WebP · auto-resized · client pre-shrunk</p>
            </>
          )}
        </div>
      )}

      {/* ── URL tab ── */}
      {tab === 'url' && (
        <input
          type="url"
          value={value || ''}
          onChange={e => { setUploadErr(null); onChange(e.target.value) }}
          placeholder="https://example.com/photo.jpg"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200
                     placeholder:text-slate-600 focus:outline-none focus:border-vnit-blue transition-colors text-sm"
        />
      )}

      {/* ── Upload error ── */}
      {uploadErr && (
        <p className="text-red-400 text-xs flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 8v4m0 4h.01"/>
          </svg>
          {uploadErr}
        </p>
      )}

      {/* ── Preview ── */}
      {value && (
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
          <img
            src={value}
            alt="Preview"
            className="w-full max-h-48 object-cover"
            onError={e => { e.target.style.display = 'none' }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 rounded-lg
                       bg-black/60 hover:bg-red-600/80 text-white text-[11px] font-semibold
                       backdrop-blur-sm transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
