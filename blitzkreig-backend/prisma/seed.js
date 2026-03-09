/**
 * prisma/seed.js
 * Creates a default SUPER_ADMIN user and sample events on first run.
 * Run with: npm run prisma:seed
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱  Seeding database …')

  // ── Default admin ──────────────────────────────────────────────────
  const password_hash = await bcrypt.hash('Admin@1234', 12)

  const admin = await prisma.user.upsert({
    where:  { username: 'admin' },
    update: {},
    create: {
      username:      'admin',
      password_hash,
      role:          'SUPER_ADMIN',
    },
  })
  console.log(`✅  Admin user ready (id=${admin.id})`)

  // ── Sample events ──────────────────────────────────────────────────
  const sampleEvents = [
    {
      title:       'Blitzkreig Rapid Championship 2024',
      date:        new Date('2024-11-15'),
      description: 'Our flagship annual rapid tournament drawing 80+ participants. 9 Swiss rounds, 15+10 time control.',
      image_url:   'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=640&q=80',
      is_published: true,
      created_by:   admin.id,
    },
    {
      title:       "Freshers' Chess League 2024",
      date:        new Date('2024-09-08'),
      description: 'Welcoming first-year students to competitive chess across three weekend rounds.',
      image_url:   'https://images.unsplash.com/photo-1560421683-6856ea585c78?w=640&q=80',
      is_published: true,
      created_by:   admin.id,
    },
    {
      title:       'Inter-NIT Online Invitational 2024',
      date:        new Date('2024-07-20'),
      description: 'Lichess arena blitz tournament connecting clubs from NIT Warangal, NIT Raipur, and VNIT.',
      image_url:   'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=640&q=80',
      is_published: true,
      created_by:   admin.id,
    },
  ]

  for (const ev of sampleEvents) {
    const existing = await prisma.event.findFirst({ where: { title: ev.title } })
    if (!existing) {
      await prisma.event.create({ data: ev })
      console.log(`✅  Event created: "${ev.title}"`)
    } else {
      console.log(`⏭   Event already exists: "${ev.title}"`)
    }
  }

  // ── Committee members (2025-26) ────────────────────────────────────
  const committeeMembers = [
    { name: 'Aarav Mehta',    role: 'President',              year_label: '2025-26', branch: 'CSE, 4th Year',  sort_order: 1  },
    { name: 'Priya Kulkarni', role: 'Vice President',         year_label: '2025-26', branch: 'ECE, 3rd Year',  sort_order: 2  },
    { name: 'Rohan Desai',    role: 'Secretary',              year_label: '2025-26', branch: 'MECH, 3rd Year', sort_order: 3  },
    { name: 'Neha Joshi',     role: 'Treasurer',              year_label: '2025-26', branch: 'CIVIL, 2nd Year',sort_order: 4  },
    { name: 'Vikram Singh',   role: 'Events Head',            year_label: '2025-26', branch: 'IT, 3rd Year',   sort_order: 5  },
    { name: 'Sana Sheikh',    role: 'Outreach Coordinator',   year_label: '2025-26', branch: 'EE, 2nd Year',   sort_order: 6  },
    { name: 'Karthik Rao',    role: 'Training Head',          year_label: '2025-26', branch: 'CSE, 3rd Year',  sort_order: 7  },
    { name: 'Ananya Iyer',    role: 'Design & Media',         year_label: '2025-26', branch: 'META, 2nd Year', sort_order: 8  },
  ]

  for (const member of committeeMembers) {
    const existing = await prisma.committeeMember.findFirst({
      where: { name: member.name, year_label: member.year_label },
    })
    if (!existing) {
      await prisma.committeeMember.create({ data: { ...member, is_active: true } })
      console.log(`✅  Committee member added: "${member.name}" (${member.year_label})`)
    } else {
      console.log(`⏭   Already exists: "${member.name}" (${member.year_label})`)
    }
  }

  console.log('🎉  Seeding complete.')
}

main()
  .catch(e => {
    console.error('❌  Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
