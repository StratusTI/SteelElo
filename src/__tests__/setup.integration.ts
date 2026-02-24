import { prisma } from '@/src/lib/prisma'
import { afterAll, afterEach } from 'vitest'

afterEach(async () => {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE sessions, accounts, verifications, users, workspaces CASCADE
  `)
})

afterAll(async () => {
  await prisma.$disconnect()
})
