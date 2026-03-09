'use strict'

const express    = require('express')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const rateLimit  = require('express-rate-limit')
const { body, validationResult } = require('express-validator')
const { PrismaClient } = require('@prisma/client')

const { verifyToken } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// ── Stricter rate limit for login attempts ─────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      10,
  message:  { error: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

// ── Validation rules ───────────────────────────────────────────────
const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ max: 50 }).withMessage('Username too long.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
]

// ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { username, password }
// Returns: { token, user: { id, username, role } }
// ─────────────────────────────────────────────────────────────────────
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  // 1. Validate input
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const { username, password } = req.body

  try {
    // 2. Look up user
    const user = await prisma.user.findUnique({ where: { username } })

    // 3. Constant-time comparison even on miss (prevent username enumeration)
    const dummyHash = '$2a$12$invalidhashforenumerationprevention000000000000000000'
    const isMatch = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, dummyHash).then(() => false)

    if (!user || !isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' })
    }

    // 4. Sign JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    )

    return res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    })
  } catch (err) {
    console.error('[/api/auth/login]', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

// ─────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
// Returns the current authenticated user's profile.
// ─────────────────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.user.id },
      select: { id: true, username: true, role: true, created_at: true },
    })
    if (!user) return res.status(404).json({ error: 'User not found.' })
    return res.json({ user })
  } catch (err) {
    console.error('[/api/auth/me]', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

module.exports = router
