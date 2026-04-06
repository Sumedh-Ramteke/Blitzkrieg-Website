import { useState, useEffect } from 'react'

/* ── Social Media Section: YouTube & Instagram Channel Feeds ────────────────────── */

function YouTubeChannelFeed() {
  const [videoData, setVideoData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY
  const youtubeHandle = import.meta.env.VITE_YOUTUBE_HANDLE || 'BlitzkriegVNIT'

  useEffect(() => {
    const fetchYouTubeData = async () => {
      if (!youtubeApiKey) {
        setError('YouTube API key is missing. Set VITE_YOUTUBE_API_KEY in .env.local')
        setLoading(false)
        return
      }

      try {
        // 1) Resolve channel by handle
        const channelResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(youtubeHandle)}&key=${youtubeApiKey}`
        )

        if (!channelResponse.ok) {
          throw new Error(`YouTube channel lookup failed (${channelResponse.status})`)
        }

        const channelJson = await channelResponse.json()
        const channelItem = channelJson?.items?.[0]
        const channelId = channelItem?.snippet?.channelId || channelItem?.id?.channelId

        if (!channelId) {
          throw new Error('Could not find YouTube channel id')
        }

        // 2) Fetch latest video for that channel
        const latestResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channelId)}&order=date&type=video&maxResults=1&key=${youtubeApiKey}`
        )

        if (!latestResponse.ok) {
          throw new Error(`YouTube latest video fetch failed (${latestResponse.status})`)
        }

        const latestJson = await latestResponse.json()
        const latestItem = latestJson?.items?.[0]

        if (!latestItem?.id?.videoId) {
          throw new Error('No latest video found for channel')
        }

        const latestVideoId = latestItem.id.videoId
        const latestSnippet = latestItem.snippet

        setVideoData({
          channelName: latestSnippet.channelTitle || youtubeHandle,
          channelUrl: `https://www.youtube.com/channel/${channelId}`,
          latestVideoTitle: latestSnippet.title,
          latestVideoUrl: `https://www.youtube.com/watch?v=${latestVideoId}`,
          latestVideoThumbnail:
            latestSnippet?.thumbnails?.high?.url ||
            latestSnippet?.thumbnails?.medium?.url ||
            latestSnippet?.thumbnails?.default?.url ||
            '',
        })
      } catch (err) {
        console.error('[YouTube feed]', err)
        setError('Could not fetch latest YouTube video right now.')
        setVideoData({
          channelName: youtubeHandle,
          channelUrl: 'https://www.youtube.com/@BlitzkriegVNIT',
          latestVideoTitle: 'Open the channel to watch the newest upload',
          latestVideoUrl: 'https://www.youtube.com/@BlitzkriegVNIT/videos',
          latestVideoThumbnail: '',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchYouTubeData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <h3 className="text-2xl font-bold text-slate-100">YouTube Channel</h3>
        </div>
        <div className="h-48 bg-slate-800 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        <div>
          <h3 className="text-2xl font-bold text-slate-100">YouTube Channel</h3>
          <p className="text-sm text-red-400">{videoData?.channelName}</p>
        </div>
      </div>

      {/* Video Card */}
      <a 
        href={videoData?.latestVideoUrl}
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl overflow-hidden border border-slate-800 hover:border-red-500/50 transition-all hover:shadow-lg hover:shadow-red-500/20 group"
      >
        <div className="bg-slate-800 aspect-video relative flex items-center justify-center group-hover:bg-slate-700 transition-colors">
          {videoData?.latestVideoThumbnail && (
            <img 
              src={videoData.latestVideoThumbnail}
              alt="Latest video"
              className="w-full h-full object-cover"
            />
          )}
          <svg className="w-16 h-16 text-red-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <div className="bg-slate-900 p-4">
          <p className="text-sm text-slate-300 font-semibold line-clamp-2 group-hover:text-red-400 transition-colors">
            {videoData?.latestVideoTitle}
          </p>
        </div>
      </a>

      {error && (
        <p className="text-xs text-amber-400">{error}</p>
      )}

      <a 
        href={videoData?.channelUrl}
        target="_blank" 
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                   border border-red-500/30 text-red-400 hover:text-red-300
                   hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10
                   transition-all duration-200 font-semibold"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        View All Videos →
      </a>
    </div>
  )
}

function InstagramProfileCard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
        </svg>
        <div>
          <h3 className="text-2xl font-bold text-slate-100">Instagram</h3>
          <p className="text-sm text-pink-400">@blitzkrieg_vnit</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-lg hover:border-pink-500/20 transition-colors p-6 bg-gradient-to-br from-slate-900 to-slate-950">
        <div className="text-center space-y-4">
          <div className="w-32 h-32 rounded-full mx-auto border-4 border-pink-500/30 flex items-center justify-center bg-gradient-to-br from-pink-900/20 to-slate-800">
            <svg className="w-16 h-16 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
            </svg>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-100">blitzkrieg_vnit</p>
            <p className="text-sm text-slate-400">VNIT Chess Team</p>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Tournament updates • Training tips • Team moments • Community events
          </p>
          <p className="text-xs text-slate-500">
            Instagram auto-latest feed needs Meta Graph API (Business/Creator account).
          </p>
        </div>
      </div>

      <a 
        href="https://www.instagram.com/blitzkrieg_vnit" 
        target="_blank" 
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                   border border-pink-500/30 text-pink-400 hover:text-pink-300
                   hover:border-pink-500/60 bg-pink-500/5 hover:bg-pink-500/10
                   transition-all duration-200 font-semibold"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
        </svg>
        Follow on Instagram →
      </a>
    </div>
  )
}

export default function SocialMediaSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#0d0d0d]">
      <div className="section-container space-y-16">
        
        {/* Header */}
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-vnit-gold to-transparent" />
            <span className="text-vnit-gold text-xs font-semibold tracking-[0.25em] uppercase">
              Follow Us
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent via-vnit-gold to-transparent" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Latest from <span className="text-gradient-blue-gold">Blitzkrieg</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            Stay updated with tournament highlights, training sessions, and community moments on our social channels
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <YouTubeChannelFeed />
          <InstagramProfileCard />
        </div>
      </div>
    </section>
  )
}
