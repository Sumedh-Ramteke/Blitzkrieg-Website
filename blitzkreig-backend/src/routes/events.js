'use strict'

const express  = require('express')
const { body, param, query, validationResult } = require('express-validator')
const { PrismaClient } = require('@prisma/client')

const { verifyToken, requireRole } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// ── Helper: send validation errors ────────────────────────────────
function checkValidation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() })
    return true
  }
  return false
}

// ─────────────────────────────────────────────────────────────────────
// GET /api/events
// Public — returns all published events, newest first.
// Optional query: ?search=<string>
// ─────────────────────────────────────────────────────────────────────
router.get(
  '/',
  [
    query('search').optional().trim().isLength({ max: 100 }),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
  ],
  async (req, res) => {
    if (checkValidation(req, res)) return

    const search = req.query.search || ''
    const limit  = req.query.limit  || 20
    const page   = req.query.page   || 1
    const skip   = (page - 1) * limit

    try {
      const where = {
        is_published: true,
        ...(search && {
          OR: [
            { title:       { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      }

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          orderBy: { date: 'desc' },
          skip,
          take: limit,
          select: {
            id:                 true,
            title:              true,
            date:               true,
            description:        true,
            image_url:          true,
            participants_count: true,
            prize_fund:         true,
            chess_results_url:  true,
            brochure_url:       true,
            winners:            true,
            gallery:            true,
            created_at:         true,
          },
        }),
        prisma.event.count({ where }),
      ])

      return res.json({
        data:  events,
        meta:  { total, page, limit, pages: Math.ceil(total / limit) },
      })
    } catch (err) {
      console.error('[GET /api/events]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

// ─────────────────────────────────────────────────────────────────────
// GET /api/events/all            (ADMIN protected)
// Returns ALL events (including drafts), newest first.
// Query: ?search=<string>&limit=<n>&page=<n>
// ─────────────────────────────────────────────────────────────────────
router.get(
  '/all',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  [
    query('search').optional().trim().isLength({ max: 100 }),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
  ],
  async (req, res) => {
    if (checkValidation(req, res)) return

    const search = req.query.search || ''
    const limit  = req.query.limit  || 200
    const page   = req.query.page   || 1
    const skip   = (page - 1) * limit

    try {
      const where = search
        ? {
            OR: [
              { title:       { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}

      const [events, total] = await Promise.all([
        prisma.event.findMany({
          where,
          orderBy: { date: 'desc' },
          skip,
          take: limit,
          select: {
            id:                 true,
            title:              true,
            date:               true,
            description:        true,
            image_url:          true,
            is_published:       true,
            participants_count: true,
            prize_fund:         true,
            chess_results_url:  true,
            brochure_url:       true,
            winners:            true,
            gallery:            true,
            created_at:         true,
          },
        }),
        prisma.event.count({ where }),
      ])

      return res.json({
        data: events,
        meta: { total, page, limit, pages: Math.ceil(total / limit) },
      })
    } catch (err) {
      console.error('[GET /api/events/all]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

// ─────────────────────────────────────────────────────────────────────
// GET /api/events/:id
// Public — returns a single published event by id.
// ─────────────────────────────────────────────────────────────────────
router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).toInt()],
  async (req, res) => {
    if (checkValidation(req, res)) return

    try {
      const event = await prisma.event.findFirst({
        where: { id: req.params.id, is_published: true },
      })
      if (!event) return res.status(404).json({ error: 'Event not found.' })
      return res.json(event)
    } catch (err) {
      console.error('[GET /api/events/:id]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

// ── Shared body validation for create & update ─────────────────────
// NOTE: Do NOT mutate these chains (e.g. with .map(v => v.optional())).
// For PATCH, use patchEventValidation below which has all fields optional.
const eventBodyValidation = [
  body('title')
    .trim().notEmpty().withMessage('Title is required.')
    .isLength({ max: 200 }).withMessage('Title must be ≤ 200 characters.'),
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date.'),
  body('description')
    .trim().notEmpty().withMessage('Description is required.'),
  body('image_url')
    .optional({ values: 'falsy' })          // empty string "" treated as absent (express-validator v7)
    .custom(v => /^https?:\/\//.test(v) || /^\/uploads\//.test(v))
    .withMessage('image_url must be a valid URL or an uploaded file path.'),
  body('is_published')
    .optional()
    .isBoolean().withMessage('is_published must be boolean.'),
]

// Separate validator set for PATCH (all fields optional) — avoids mutating eventBodyValidation
const patchEventValidation = [
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title must be ≤ 200 characters.'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date.'),
  body('description').optional().trim(),
  body('image_url').optional({ values: 'falsy' })
    .custom(v => /^https?:\/\//.test(v) || /^\/uploads\//.test(v))
    .withMessage('image_url must be a valid URL or an uploaded file path.'),
  body('is_published').optional().isBoolean().withMessage('is_published must be boolean.'),
]

// ─────────────────────────────────────────────────────────────────────
// POST /api/events              (ADMIN protected)
// Create a new event.
// Body: { title, date, description, image_url?, is_published? }
// ─────────────────────────────────────────────────────────────────────
router.post(
  '/',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  eventBodyValidation,
  async (req, res) => {
    if (checkValidation(req, res)) return

    const { title, date, description, image_url, is_published,
            participants_count, prize_fund, chess_results_url,
            brochure_url, winners, gallery } = req.body

    try {
      const event = await prisma.event.create({
        data: {
          title,
          date:               new Date(date),
          description,
          image_url:          image_url          || null,
          is_published:       is_published !== undefined ? is_published : true,
          participants_count: participants_count || null,
          prize_fund:         prize_fund         || null,
          chess_results_url:  chess_results_url  || null,
          brochure_url:       brochure_url       || null,
          winners:            winners            || null,
          gallery:            gallery            || null,
          created_by:         req.user.id,
        },
      })
      return res.status(201).json(event)
    } catch (err) {
      console.error('[POST /api/events]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

// ─────────────────────────────────────────────────────────────────────
// PATCH /api/events/:id         (ADMIN protected)
// Update an existing event (partial update).
// ─────────────────────────────────────────────────────────────────────
router.patch(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  [param('id').isInt({ min: 1 }).toInt(), ...patchEventValidation],
  async (req, res) => {
    if (checkValidation(req, res)) return

    const { title, date, description, image_url, is_published,
            participants_count, prize_fund, chess_results_url,
            brochure_url, winners, gallery } = req.body

    try {
      const existing = await prisma.event.findUnique({ where: { id: req.params.id } })
      if (!existing) return res.status(404).json({ error: 'Event not found.' })

      const updated = await prisma.event.update({
        where: { id: req.params.id },
        data: {
          ...(title              !== undefined && { title }),
          ...(date               !== undefined && { date: new Date(date) }),
          ...(description        !== undefined && { description }),
          ...(image_url          !== undefined && { image_url }),
          ...(is_published       !== undefined && { is_published }),
          ...(participants_count !== undefined && { participants_count: participants_count || null }),
          ...(prize_fund         !== undefined && { prize_fund:         prize_fund        || null }),
          ...(chess_results_url  !== undefined && { chess_results_url:  chess_results_url || null }),
          ...(brochure_url       !== undefined && { brochure_url:       brochure_url      || null }),
          ...(winners            !== undefined && { winners }),
          ...(gallery            !== undefined && { gallery }),
        },
      })
      return res.json(updated)
    } catch (err) {
      console.error('[PATCH /api/events/:id]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/events/:id        (ADMIN protected)
// Permanently delete an event.
// ─────────────────────────────────────────────────────────────────────
router.delete(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  [param('id').isInt({ min: 1 }).toInt()],
  async (req, res) => {
    if (checkValidation(req, res)) return

    try {
      const existing = await prisma.event.findUnique({ where: { id: req.params.id } })
      if (!existing) return res.status(404).json({ error: 'Event not found.' })

      await prisma.event.delete({ where: { id: req.params.id } })
      return res.json({ message: 'Event deleted successfully.' })
    } catch (err) {
      console.error('[DELETE /api/events/:id]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

module.exports = router
