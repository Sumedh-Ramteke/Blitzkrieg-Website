'use strict'

require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')

const path = require('path')

const authRoutes      = require('./routes/auth')
const eventRoutes     = require('./routes/events')
const committeeRoutes = require('./routes/committee')
const uploadRoutes    = require('./routes/upload')
const contactRoutes   = require('./routes/contact')

// ─── App Setup ────────────────────────────────────────────────────────
const app  = express()
const PORT = process.env.PORT || 4000

// ─── Security Middleware ──────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))

// ─── Global Rate Limiter ──────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests. Please try again later.' },
})
app.use(globalLimiter)

// ─── Body Parsing & Logging ───────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ─── Static Files (uploaded images) ──────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')))

// ─── Routes ───────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/events',    eventRoutes)
app.use('/api/committee', committeeRoutes)
app.use('/api/upload',    uploadRoutes)
app.use('/api/contact',   contactRoutes)

// ─── Health Check ─────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'Blitzkrieg Chess Club API',
    version: '1.0.0',
    time:    new Date().toISOString(),
  })
})

// ─── 404 Handler ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' })
})

// ─── Global Error Handler ─────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const isDev = process.env.NODE_ENV !== 'production'
  console.error('[ERROR]', err)
  res.status(err.status || 500).json({
    error:   err.message || 'Internal server error.',
    ...(isDev && { stack: err.stack }),
  })
})

// ─── Start ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Blitzkrieg API listening on http://localhost:${PORT}`)
  console.log(`📋  Health: http://localhost:${PORT}/api/health\n`)
})

module.exports = app
