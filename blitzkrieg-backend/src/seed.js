'use strict'

const bcrypt = require('bcryptjs')
const { readJson, writeJson } = require('./utils/contentStore')

async function seedAdmin() {
  try {
    const USERS_FILE = 'users.json'
    const users = await readJson(USERS_FILE, [])

    if (users.length === 0) {
      console.log('🌱 Seeding default admin user...')
      const password_hash = await bcrypt.hash('Blitzkrieg@123', 12)
      const adminUser = {
        id: 1,
        username: 'admin',
        password_hash,
        role: 'admin',
        created_at: new Date().toISOString()
      }
      await writeJson(USERS_FILE, [adminUser])
      console.log('✅ Default admin user created: admin / Blitzkrieg@123')
    } else {
      console.log('ℹ️ Users already exist, skipping seed.')
    }
  } catch (err) {
    console.error('❌ Error seeding admin:', err)
  }
}

module.exports = seedAdmin
