'use strict'

const bcrypt = require('bcryptjs')
const { readJson, writeJson } = require('./utils/contentStore')

async function seedAdmin() {
  try {
    const USERS_FILE = 'users.json'
    let users = await readJson(USERS_FILE, [])
    let changed = false

    if (users.length === 0) {
      console.log('🌱 Seeding default admin user...')
      const password_hash = await bcrypt.hash('Blitzkrieg@123', 12)
      const adminUser = {
        id: 1,
        username: 'admin',
        password_hash,
        role: 'ADMIN',
        created_at: new Date().toISOString()
      }
      users = [adminUser]
      changed = true
      console.log('✅ Default admin user created: admin / Blitzkrieg@123')
    } else {
      // Fix existing users with lowercase 'admin' role
      users = users.map(u => {
        if (u.role === 'admin') {
          u.role = 'ADMIN'
          changed = true
        }
        return u
      })
      if (changed) console.log('🔧 Fixed existing admin roles to uppercase.')
    }

    if (changed) {
      await writeJson(USERS_FILE, users)
    }
  } catch (err) {
    console.error('❌ Error seeding admin:', err)
  }
}

module.exports = seedAdmin
