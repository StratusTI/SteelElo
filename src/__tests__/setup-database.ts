import { afterAll, beforeAll, beforeEach } from "vitest";
import { prismaElo } from "../lib/prisma";

export async function setupDatabase() {
  beforeAll(async () => {
    const databaseUrl = process.env.DATABASE_ELO_URL

    if (!databaseUrl?.includes('test')) {
      throw new Error(
        'Atenção: Use um banco de TESTE! Configure DATABASE_ELO_URL com sufixo "_test"'
      )
    }
  })

  beforeEach(async () => {
    await prismaElo.projetoMembro.deleteMany({
      where: {
        id: { gte: 900000  }
      }
    })
  })

  afterAll(async () => {
    await prismaElo.projetoMembro.deleteMany({
      where: { id: { gte: 900000 }}
    })

    await prismaElo.$disconnect()
  })
}

export async function seedTestData() {
  const testProject = await prismaElo.projeto.upsert({
    where: { id: 900001 },
    update: {},
    create: {
      id: 900001,
      nome: 'Projeto Teste',
      ownerId: 1,
    },
  })

  const testMemberViewer = await prismaElo.projetoMembro.create({
    data: {
      id: 900001,
      projetoId: testProject.id,
      usuarioId: 100,
      role: 'viewer',
    },
  })

  const testMemberMember = await prismaElo.projetoMembro.create({
    data: {
      id: 900002,
      projetoId: testProject.id,
      usuarioId: 101,
      role: 'member',
    },
  })

  const testMemberAdmin = await prismaElo.projetoMembro.create({
    data: {
      id: 900003,
      projetoId: testProject.id,
      usuarioId: 102,
      role: 'admin',
    },
  })

  return {
    testProject,
    testMemberViewer,
    testMemberMember,
    testMemberAdmin,
  }
}

export async function cleanupTestData() {
  await prismaElo.projetoMembro.deleteMany({
    where: { id: { gte: 900000 } },
  })

  await prismaElo.projeto.deleteMany({
    where: { id: { gte: 900000 } },
  })
}
