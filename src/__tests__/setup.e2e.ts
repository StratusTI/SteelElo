import { prisma } from '@/src/lib/prisma'
import { afterAll, afterEach } from 'vitest'

export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

afterEach(async () => {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE sessions, accounts, verifications, users, workspaces CASCADE
  `)
})

afterAll(async () => {
  await prisma.$disconnect()
})
