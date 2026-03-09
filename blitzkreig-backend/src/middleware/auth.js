'use strict'

const jwt = require('jsonwebtoken')

/**
 * verifyToken
 * Express middleware that validates the Bearer JWT in the Authorization header.
 * Attaches the decoded payload to req.user on success.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Authorization required.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded   // { id, username, role, iat, exp }
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' })
    }
    return res.status(401).json({ error: 'Invalid token.' })
  }
}

/**
 * requireRole
 * Factory that returns middleware ensuring the authenticated user has one of the allowed roles.
 * @param {...string} roles - allowed roles (e.g. 'ADMIN', 'SUPER_ADMIN')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' })
    }
    next()
  }
}

module.exports = { verifyToken, requireRole }
