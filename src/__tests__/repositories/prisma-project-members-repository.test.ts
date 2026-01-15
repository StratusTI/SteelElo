import { prismaElo } from '@/src/lib/prisma'
import { PrismaProjectMembersRepository } from '@/src/repositories/prisma/prisma-project-members-repository'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanupTestData, seedTestData, setupDatabase } from '../setup-database'

describe('PrismaProjectMembersRepository - Integration Tests', () => {
  const repository = new PrismaProjectMembersRepository()

  // Setup do banco
  setupDatabase()

  let testprojetoId: number

  beforeAll(async () => {
    // Cria dados de seed
    const { testProject } = await seedTestData()
    testprojetoId = testProject.id
  })

  afterAll(async () => {
    // Limpa dados de seed
    await cleanupTestData()
  })

  beforeEach(async () => {
    // Garante estado limpo antes de cada teste
    await prismaElo.projetoMembro.deleteMany({
      where: {
        id: { gte: 900100 }, // IDs de teste deste arquivo
      },
    })
  })

  describe('findByUserAndProject', () => {
    it('should return empty array when user is not a member', async () => {
      const members = await repository.findByUserAndProject(999, testprojetoId)

      expect(members).toEqual([])
    })

    it('should return user membership when user is a member', async () => {
      // Cria membro de teste
      await prismaElo.projetoMembro.create({
        data: {
          id: 900101,
          projetoId: testprojetoId,
          usuarioId: 200,
          role: 'member',
        },
      })

      const members = await repository.findByUserAndProject(200, testprojetoId)

      expect(members).toHaveLength(1)
      expect(members[0]).toMatchObject({
        usuarioId: 200,
        projetoId: testprojetoId,
        role: 'member',
      })
    })

    it('should return multiple memberships for user with multiple roles (RN1.1)', async () => {
      // User 201 tem duas associações: member e admin
      await prismaElo.projetoMembro.create({
        data: {
          id: 900102,
          projetoId: testprojetoId,
          usuarioId: 201,
          role: 'member',
          source: 'direct'
        },
      })

      await prismaElo.projetoMembro.create({
        data: {
          id: 900103,
          projetoId: testprojetoId,
          usuarioId: 201,
          role: 'admin',
          source: 'team'
        },
      })

      const members = await repository.findByUserAndProject(201, testprojetoId)

      expect(members).toHaveLength(2)
      expect(members.map((m) => m.role)).toContain('member')
      expect(members.map((m) => m.role)).toContain('admin')
    })
  })

  describe('findByProject', () => {
    it('should return all members of a project', async () => {
      // Cria múltiplos membros
      await prismaElo.projetoMembro.createMany({
        data: [
          {
            id: 900104,
            projetoId: testprojetoId,
            usuarioId: 300,
            role: 'viewer',
          },
          {
            id: 900105,
            projetoId: testprojetoId,
            usuarioId: 301,
            role: 'member',
          },
          {
            id: 900106,
            projetoId: testprojetoId,
            usuarioId: 302,
            role: 'admin',
          },
        ],
      })

      const members = await repository.findByProject(testprojetoId)

      expect(members.length).toBeGreaterThanOrEqual(3)

      const testMembers = members.filter((m) => m.usuarioId >= 300)
      expect(testMembers).toHaveLength(3)
    })
  })

  describe('create', () => {
    it('should create a new member', async () => {
      const member = await repository.create({
        projectId: testprojetoId,
        userId: 400,
        role: 'member',
      })

      expect(member).toMatchObject({
        projetoId: testprojetoId,
        usuarioId: 400,
        role: 'member',
      })
      expect(member.id).toBeDefined()
      expect(member.adicionadoEm).toBeInstanceOf(Date)
    })

    it('should create member with different roles', async () => {
      const viewer = await repository.create({
        projectId: testprojetoId,
        userId: 401,
        role: 'viewer',
      })

      const admin = await repository.create({
        projectId: testprojetoId,
        userId: 402,
        role: 'admin',
      })

      const owner = await repository.create({
        projectId: testprojetoId,
        userId: 403,
        role: 'owner',
      })

      expect(viewer.role).toBe('viewer')
      expect(admin.role).toBe('admin')
      expect(owner.role).toBe('owner')
    })
  })

  describe('updateRole', () => {
    it('should update member role', async () => {
      // Cria membro
      const member = await prismaElo.projetoMembro.create({
        data: {
          id: 900107,
          projetoId: testprojetoId,
          usuarioId: 500,
          role: 'member',
        },
      })

      // Atualiza para admin
      const updated = await repository.updateRole(member.id, 'admin')

      expect(updated.role).toBe('admin')
      expect(updated.id).toBe(member.id)

      // Verifica no banco
      const fromDb = await prismaElo.projetoMembro.findUnique({
        where: { id: member.id },
      })
      expect(fromDb?.role).toBe('admin')
    })
  })

  describe('delete', () => {
    it('should delete member', async () => {
      // Cria membro
      const member = await prismaElo.projetoMembro.create({
        data: {
          id: 900108,
          projetoId: testprojetoId,
          usuarioId: 600,
          role: 'member',
        },
      })

      // Deleta
      await repository.delete(member.id)

      // Verifica que não existe mais
      const fromDb = await prismaElo.projetoMembro.findUnique({
        where: { id: member.id },
      })
      expect(fromDb).toBeNull()
    })

    it('should throw error when deleting non-existent member', async () => {
      await expect(repository.delete(999999)).rejects.toThrow()
    })
  })
})
