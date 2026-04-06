'use strict'

const express = require('express')
const multer  = require('multer')
const sharp   = require('sharp')
const path    = require('path')
const crypto  = require('crypto')

const { verifyToken } = require('../middleware/auth')

const router = express.Router()

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads')

/* ── multer: hold the raw bytes in memory so sharp can process them ── */
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 15 * 1024 * 1024 },   // 15 MB hard cap on raw upload
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true)
    cb(new Error('Only image files are allowed.'))
  },
})

/**
 * POST /api/upload
 * Protected — admin only.
 * Accepts: multipart/form-data with field "image"
 * Query:   ?type=cover (default) | gallery | avatar
 * Returns: { url: "/uploads/<uuid>.webp" }
 *
 * Compression profiles (all output WebP, EXIF stripped):
 *   cover   — max 1200×900, quality 80, effort 5  (~40–80 KB)
 *   gallery — max 900×900,  quality 72, effort 6  (~20–50 KB)  ← tighter, grid-displayed
 *   avatar  — max 400×400,  quality 75, effort 6  (~10–25 KB)
 */
const PROFILES = {
  cover:   { width: 1200, height: 900,  quality: 80, effort: 5 },
  gallery: { width: 900,  height: 900,  quality: 72, effort: 6 },
  avatar:  { width: 400,  height: 400,  quality: 75, effort: 6 },
}

router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' })
    }

    const profile    = PROFILES[req.query.type] || PROFILES.cover
    const filename   = `${crypto.randomUUID()}.webp`
    const outputPath = path.join(UPLOADS_DIR, filename)

    await sharp(req.file.buffer)
      .rotate()                                                   // auto-orient from EXIF
      .resize(profile.width, profile.height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: profile.quality, effort: profile.effort })
      .toFile(outputPath)

    return res.status(201).json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error('[upload]', err.message)
    return res.status(500).json({ error: 'Failed to process image.' })
  }
})

module.exports = router
