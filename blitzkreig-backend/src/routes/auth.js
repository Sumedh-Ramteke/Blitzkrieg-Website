'use strict'

const express    = require('express')
const crypto     = require('crypto')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const rateLimit  = require('express-rate-limit')
const { body, validationResult } = require('express-validator')
const { PrismaClient } = require('@prisma/client')

const { verifyToken } = require('../middleware/auth')
const { sendMail }    = require('../utils/mailer')

const router = express.Router()
const prisma = new PrismaClient()
const CLUB_EMAIL = process.env.CLUB_EMAIL || 'blitzkriegchessclub@gmail.com'

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
// PATCH /api/auth/change-password  (protected)
// Body: { currentPassword, newPassword }
// ─────────────────────────────────────────────────────────────────────
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters.'),
]

router.patch('/change-password', verifyToken, changePasswordValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const { currentPassword, newPassword } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ error: 'User not found.' })

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' })

    const password_hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({ where: { id: user.id }, data: { password_hash } })

    return res.json({ message: 'Password changed successfully.' })
  } catch (err) {
    console.error('[/api/auth/change-password]', err)
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

// ─────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password  (public)
// Body: { username }
// Sends a reset link to the configured club email.
// ─────────────────────────────────────────────────────────────────────
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      5,
  message:  { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

router.post('/forgot-password', forgotLimiter, [
  body('username').trim().notEmpty().withMessage('Username is required.'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  // Always respond with the same message to prevent username enumeration
  const genericMsg = { message: 'If the account exists, a reset link has been sent to the club email.' }

  try {
    const user = await prisma.user.findUnique({ where: { username: req.body.username } })
    if (!user) return res.json(genericMsg)

    // Generate a secure reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data:  { reset_token: resetTokenHash, reset_token_expiry: expiry },
    })

    const frontendOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
    const resetUrl = `${frontendOrigin}/admin/reset-password?token=${resetToken}`

    await sendMail({
      to:      CLUB_EMAIL,
      subject: `Password Reset Request for "${user.username}"`,
      html: `
        <h2>Password Reset — Blitzkrieg Chess Club</h2>
        <p>A password reset was requested for the admin account <strong>${user.username}</strong>.</p>
        <p><a href="${resetUrl}" style="background:#1A56DB;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a></p>
        <p style="margin-top:16px;color:#888;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      `,
    })

    return res.json(genericMsg)
  } catch (err) {
    console.error('[/api/auth/forgot-password]', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

// ─────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password  (public)
// Body: { token, newPassword }
// ─────────────────────────────────────────────────────────────────────
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required.'),
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const { token, newPassword } = req.body
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  try {
    const user = await prisma.user.findFirst({
      where: {
        reset_token: tokenHash,
        reset_token_expiry: { gt: new Date() },
      },
    })

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' })
    }

    const password_hash = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data:  { password_hash, reset_token: null, reset_token_expiry: null },
    })

    return res.json({ message: 'Password has been reset successfully.' })
  } catch (err) {
    console.error('[/api/auth/reset-password]', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

module.exports = router
