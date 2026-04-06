'use strict'

const express = require('express')
const { body, param, query, validationResult } = require('express-validator')

const { verifyToken, requireRole } = require('../middleware/auth')
const { nextId, readJson, writeJson } = require('../utils/contentStore')

const router = express.Router()
const COMMITTEE_FILE = 'committee.json'

function normalizeMember(member) {
  return {
    id: Number(member.id),
    name: member.name,
    role: member.role,
    year_label: member.year_label,
    branch: member.branch ?? null,
    image_url: member.image_url ?? null,
    sort_order: Number(member.sort_order) || 100,
    is_active: member.is_active !== false,
    created_at: member.created_at || new Date().toISOString(),
    updated_at: member.updated_at || new Date().toISOString(),
  }
}

async function loadMembers() {
  const rows = await readJson(COMMITTEE_FILE, [])
  return Array.isArray(rows) ? rows.map(normalizeMember) : []
}

async function saveMembers(rows) {
  return writeJson(COMMITTEE_FILE, rows.map(normalizeMember))
}

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
      const rows = await loadMembers()

      // If no year given, use the most recent year_label with active members
      let yearLabel = req.query.year
      if (!yearLabel) {
        const latest = rows
          .filter(member => member.is_active)
          .sort((a, b) => b.year_label.localeCompare(a.year_label))[0]
        yearLabel = latest?.year_label || null
      }

      if (!yearLabel) return res.json({ year_label: null, data: [] })

      const members = rows
        .filter(member => member.year_label === yearLabel && member.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(member => ({
          id:         member.id,
          name:       member.name,
          role:       member.role,
          year_label: member.year_label,
          branch:     member.branch,
          image_url:  member.image_url,
          sort_order: member.sort_order,
        }))

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
    const rows = await loadMembers()
    const years = [...new Set(rows.filter(member => member.is_active).map(member => member.year_label))]
      .sort((a, b) => b.localeCompare(a))
    return res.json(years)
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
      const members = await loadMembers()
      const now = new Date().toISOString()
      const member = normalizeMember({
        id: nextId(members),
        name,
        role,
        year_label,
        branch: branch ?? null,
        image_url: image_url ?? null,
        sort_order: sort_order ?? 100,
        is_active: is_active !== undefined ? is_active : true,
        created_at: now,
        updated_at: now,
      })
      members.push(member)
      await saveMembers(members)
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
      const members = await loadMembers()
      const existing = members.find(member => member.id === req.params.id)
      if (!existing) return res.status(404).json({ error: 'Member not found.' })

      const updated = normalizeMember({
        ...existing,
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(year_label !== undefined && { year_label }),
        ...(branch !== undefined && { branch }),
        ...(image_url !== undefined && { image_url }),
        ...(sort_order !== undefined && { sort_order }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date().toISOString(),
      })

      const updatedMembers = members.map(member => member.id === req.params.id ? updated : member)
      await saveMembers(updatedMembers)
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
      const members = await loadMembers()
      const existing = members.find(member => member.id === req.params.id)
      if (!existing) return res.status(404).json({ error: 'Member not found.' })
      await saveMembers(members.filter(member => member.id !== req.params.id))
      return res.json({ message: 'Member deleted successfully.' })
    } catch (err) {
      console.error('[DELETE /api/committee/:id]', err)
      return res.status(500).json({ error: 'Internal server error.' })
    }
  }
)

module.exports = router
