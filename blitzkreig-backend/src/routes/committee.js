'use strict'

const express = require('express')
const { body, param, query, validationResult } = require('express-validator')
const { PrismaClient } = require('@prisma/client')

const { verifyToken, requireRole } = require('../middleware/auth')

const router = express.Router()
const prisma  = new PrismaClient()

function checkValidation(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) { res.status(422).json({ errors: errors.array() }); return true }
  return false
}

// ─────────────────────────────────────────────────────────────────────
// GET /api/committee
// Public — returns committee members for a given year (default: latest).
// Query: ?year=2025-26
// ─────────────────────────────────────────────────────────────────────
router.get(
  '/',
  [query('year').optional().trim().isLength({ max: 10 })],
  async (req, res) => {
    if (checkValidation(req, res)) return

    try {
      // If no year given, use the most recent year_label in the DB
      let yearLabel = req.query.year
      if (!yearLabel) {
        const latest = await prisma.committeeMember.findFirst({
          where:   { is_active: true },
          orderBy: { year_label: 'desc' },
          select:  { year_label: true },
        })
        yearLabel = latest?.year_label || null
      }

      if (!yearLabel) return res.json({ year_label: null, data: [] })

      const members = await prisma.committeeMember.findMany({
        where:   { year_label: yearLabel, is_active: true },
        orderBy: { sort_order: 'asc' },
        select: {
          id:         true,
          name:       true,
          role:       true,
          year_label: true,
          branch:     true,
          image_url:  true,
          sort_order: true,
        },
      })

      return res.json({ year_label: yearLabel, data: members })
    } catch (err) {
      console.error('[GET /api/committee]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

// ─────────────────────────────────────────────────────────────────────
// GET /api/committee/years
// Public — returns list of distinct year_labels available.
// ─────────────────────────────────────────────────────────────────────
router.get('/years', async (_req, res) => {
  try {
    const rows = await prisma.committeeMember.groupBy({
      by:      ['year_label'],
      where:   { is_active: true },
      orderBy: { year_label: 'desc' },
    })
    return res.json(rows.map(r => r.year_label))
  } catch (err) {
    console.error('[GET /api/committee/years]', err)
    return res.status(500).json({ error: 'Internal server error.' })
  }
})

// ── Shared body validation ─────────────────────────────────────────
// NOTE: Do NOT mutate these chains (e.g. .map(v => v.optional())).
// For PATCH, use patchMemberValidation which has separate optional chains.
const memberBodyValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('role').trim().notEmpty().withMessage('Role is required.').isLength({ max: 100 }),
  body('year_label').trim().notEmpty().withMessage('year_label is required (e.g. 2025-26)').isLength({ max: 20 }),
  body('branch').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('image_url').optional({ values: 'falsy' })
    .custom(v => /^https?:\/\//.test(v) || /^\/uploads\//.test(v))
    .withMessage('image_url must be a valid URL or an uploaded file path.'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('sort_order must be a non-negative integer.'),
  body('is_active').optional().isBoolean(),
]

// Separate validator for PATCH (all fields optional) — avoids mutating memberBodyValidation
const patchMemberValidation = [
  body('name').optional().trim().isLength({ max: 100 }),
  body('role').optional().trim().isLength({ max: 100 }),
  body('year_label').optional().trim().isLength({ max: 20 }),
  body('branch').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('image_url').optional({ values: 'falsy' })
    .custom(v => /^https?:\/\//.test(v) || /^\/uploads\//.test(v))
    .withMessage('image_url must be a valid URL or an uploaded file path.'),
  body('sort_order').optional().isInt({ min: 0 }).withMessage('sort_order must be a non-negative integer.'),
  body('is_active').optional().isBoolean(),
]

// ─────────────────────────────────────────────────────────────────────
// POST /api/committee             (ADMIN protected)
// ─────────────────────────────────────────────────────────────────────
router.post(
  '/',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  memberBodyValidation,
  async (req, res) => {
    if (checkValidation(req, res)) return
    const { name, role, year_label, branch, image_url, sort_order, is_active } = req.body
    try {
      const member = await prisma.committeeMember.create({
        data: {
          name, role, year_label,
          branch:     branch     ?? null,
          image_url:  image_url  ?? null,
          sort_order: sort_order ?? 100,
          is_active:  is_active  !== undefined ? is_active : true,
        },
      })
      return res.status(201).json(member)
    } catch (err) {
      console.error('[POST /api/committee]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

// ─────────────────────────────────────────────────────────────────────
// PATCH /api/committee/:id        (ADMIN protected)
// ─────────────────────────────────────────────────────────────────────
router.patch(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  [param('id').isInt({ min: 1 }).toInt(), ...patchMemberValidation],
  async (req, res) => {
    if (checkValidation(req, res)) return
    const { name, role, year_label, branch, image_url, sort_order, is_active } = req.body
    try {
      const existing = await prisma.committeeMember.findUnique({ where: { id: req.params.id } })
      if (!existing) return res.status(404).json({ error: 'Member not found.' })

      const updated = await prisma.committeeMember.update({
        where: { id: req.params.id },
        data: {
          ...(name        !== undefined && { name }),
          ...(role        !== undefined && { role }),
          ...(year_label  !== undefined && { year_label }),
          ...(branch      !== undefined && { branch }),
          ...(image_url   !== undefined && { image_url }),
          ...(sort_order  !== undefined && { sort_order }),
          ...(is_active   !== undefined && { is_active }),
        },
      })
      return res.json(updated)
    } catch (err) {
      console.error('[PATCH /api/committee/:id]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

// ─────────────────────────────────────────────────────────────────────
// DELETE /api/committee/:id       (ADMIN protected)
// ─────────────────────────────────────────────────────────────────────
router.delete(
  '/:id',
  verifyToken,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  [param('id').isInt({ min: 1 }).toInt()],
  async (req, res) => {
    if (checkValidation(req, res)) return
    try {
      const existing = await prisma.committeeMember.findUnique({ where: { id: req.params.id } })
      if (!existing) return res.status(404).json({ error: 'Member not found.' })
      await prisma.committeeMember.delete({ where: { id: req.params.id } })
      return res.json({ message: 'Member deleted successfully.' })
    } catch (err) {
      console.error('[DELETE /api/committee/:id]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

module.exports = router
