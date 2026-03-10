'use strict'

const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send an email via Resend.
 * @param {{ to: string, subject: string, html: string }} opts
 */
async function sendMail({ to, subject, html }) {
  return resend.emails.send({
    from: 'Blitzkrieg Chess Club <onboarding@resend.dev>',
    to,
    subject,
    html,
  })
}

module.exports = { sendMail }
