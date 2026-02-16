import { afterAll, beforeAll, beforeEach } from "vitest";
import { prismaElo } from "../lib/prisma";

const TEST_PREFIX = 'test_'

export async function setupDatabase() {
  beforeAll(async () => {
    const databaseUrl = "mysql://root:M7a64tl0@10.25.100.10:3306/easyretro_test?protocol=mysql"

    if (!databaseUrl?.includes('test')) {
      throw new Error(
        'Atenção: Use um banco de TESTE! Configure DATABASE_ELO_URL com sufixo "_test"'
      )
    }
  })

  beforeEach(async () => {
    await prismaElo.projetoMembro.deleteMany({
      where: {
        id: { startsWith: TEST_PREFIX }
      }
    })
  })

  afterAll(async () => {
    await prismaElo.projetoMembro.deleteMany({
      where: { id: { startsWith: TEST_PREFIX } }
    })

    await prismaElo.$disconnect()
  })
}

export async function seedTestData() {
  const testProject = await prismaElo.projeto.upsert({
    where: { id: `${TEST_PREFIX}project_001` },
    update: {},
    create: {
      id: `${TEST_PREFIX}project_001`,
      nome: 'Projeto Teste',
      ownerId: 1,
      idempresa: 1
    },
  })

  const testMemberViewer = await prismaElo.projetoMembro.create({
    data: {
      id: `${TEST_PREFIX}member_001`,
      projetoId: testProject.id,
      usuarioId: 100,
      role: 'viewer',
    },
  })

  const testMemberMember = await prismaElo.projetoMembro.create({
    data: {
      id: `${TEST_PREFIX}member_002`,
      projetoId: testProject.id,
      usuarioId: 101,
      role: 'member',
    },
  })

  const testMemberAdmin = await prismaElo.projetoMembro.create({
    data: {
      id: `${TEST_PREFIX}member_003`,
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
    where: { id: { startsWith: TEST_PREFIX } },
  })

  await prismaElo.projeto.deleteMany({
    where: { id: { startsWith: TEST_PREFIX } },
  })
}
