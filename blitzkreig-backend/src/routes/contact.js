'use strict'

const express   = require('express')
const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')

const { verifyToken } = require('../middleware/auth')
const { sendMail }    = require('../utils/mailer')
const { readJson, writeJson, nextId } = require('../utils/contentStore')

const router = express.Router()

const CLUB_EMAIL = process.env.CLUB_EMAIL || 'blitzkriegchessclub@gmail.com'
const CONTACT_MESSAGES_FILE = 'contactMessages.json'

// ── Rate limit for public contact form ─────────────────────────────
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      5,
  message:  { error: 'Too many messages. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

// ── Validation ─────────────────────────────────────────────────────
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required.').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ max: 5000 }),
]

// ─────────────────────────────────────────────────────────────────────
// POST /api/contact  (public)
// Body: { name, email, message }
// ─────────────────────────────────────────────────────────────────────
router.post('/', contactLimiter, contactValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const { name, email, message } = req.body

  try {
    // Read existing messages
    const messages = await readJson(CONTACT_MESSAGES_FILE, [])

    // Create new message
    const newMessage = {
      id: nextId(messages),
      name,
      email,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    }

    // Save to file
    messages.push(newMessage)
    await writeJson(CONTACT_MESSAGES_FILE, messages)

    // Send email notification (fire-and-forget — don't block response)
    sendMail({
      to:      CLUB_EMAIL,
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New message from the Blitzkrieg website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <hr/>
        <p>${message.replace(/\n/g, '<br/>')}</p>
        <hr/>
        <p style="color:#888;font-size:12px;">Message ID: ${newMessage.id} · ${new Date().toISOString()}</p>
      `,
    }).catch(err => console.error('[Contact email notification failed]', err))

    return res.status(201).json({ message: 'Message sent successfully.' })
  } catch (err) {
    console.error('[POST /api/contact]', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

// ─────────────────────────────────────────────────────────────────────
// GET /api/contact/messages  (admin)
// Returns all contact messages, newest first.
// ─────────────────────────────────────────────────────────────────────
router.get('/messages', verifyToken, async (_req, res) => {
  try {
    const messages = await readJson(CONTACT_MESSAGES_FILE, [])
    // Sort by created_at descending (newest first)
    const sorted = messages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return res.json({ messages: sorted })
  } catch (err) {
    console.error('[GET /api/contact/messages]', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

// ─────────────────────────────────────────────────────────────────────
// PATCH /api/contact/messages/:id/read  (admin)
// Marks a message as read.
// ─────────────────────────────────────────────────────────────────────
router.patch('/messages/:id/read', verifyToken, async (req, res) => {
  try {
    const messages = await readJson(CONTACT_MESSAGES_FILE, [])
    const msgIndex = messages.findIndex(m => m.id === Number(req.params.id))

    if (msgIndex === -1) {
      return res.status(404).json({ error: 'Message not found.' })
    }

    messages[msgIndex].is_read = true
    await writeJson(CONTACT_MESSAGES_FILE, messages)

    return res.json({ message: 'Marked as read.' })
  } catch (err) {
    console.error('[PATCH /api/contact/messages/:id/read]', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/contact/messages/:id  (admin)
// ─────────────────────────────────────────────────────────────────────
router.delete('/messages/:id', verifyToken, async (req, res) => {
  try {
    const messages = await readJson(CONTACT_MESSAGES_FILE, [])
    const filtered = messages.filter(m => m.id !== Number(req.params.id))

    if (filtered.length === messages.length) {
      return res.status(404).json({ error: 'Message not found.' })
    }

    await writeJson(CONTACT_MESSAGES_FILE, filtered)
    return res.json({ message: 'Message deleted.' })
  } catch (err) {
    console.error('[DELETE /api/contact/messages/:id]', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

module.exports = router
