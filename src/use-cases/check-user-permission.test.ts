import { beforeEach, describe, expect, it } from 'vitest'
import { User } from '../@types/user'
import { InMemoryProjectMembersRepository } from '../repositories/in-memory/in-memory-project-members-repository'
import { CheckUserPermissionUseCase } from './check-user-permission'

let projectMembersRepository: InMemoryProjectMembersRepository
let sut: CheckUserPermissionUseCase

const mockUser: User = {
  id: 1,
  nome: 'John',
  sobrenome: 'Doe',
  email: 'john@example.com',
  foto: '',
  telefone: '',
  admin: false,
  superadmin: false,
  idempresa: 1,
  departamento: 'Engineering',
  time: 'Backend',
  online: true,
}

describe('Check User Permission Use Case', () => {
  beforeEach(() => {
    projectMembersRepository = new InMemoryProjectMembersRepository()
    sut = new CheckUserPermissionUseCase(projectMembersRepository)
  })

  describe('Superadmin bypass (RN1.3)', () => {
    it('should allow superadmin to perform any action', async () => {
      const superadminUser: User = { ...mockUser, superadmin: true }

      const result = await sut.execute({
        user: superadminUser,
        projectId: 1,
        permission: 'delete_project',
      })

      expect(result.hasPermission).toBe(true)
      expect(result.userRole).toBe('superadmin')
    })
  })

  describe('Non-member denial', () => {
    it('should deny access if user is not a member', async () => {
      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        minimumRole: 'viewer',
      })

      expect(result.hasPermission).toBe(false)
      expect(result.userRole).toBeNull()
      expect(result.reason).toBe('User is not a member of this project')
    })
  })

  describe('Permission-based checks', () => {
    it('should allow viewer to read project', async () => {
      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'viewer',
      })

      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        permission: 'read_project',
      })

      expect(result.hasPermission).toBe(true)
      expect(result.userRole).toBe('viewer')
    })

    it('should deny viewer from creating tasks', async () => {
      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'viewer',
      })

      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        permission: 'create_task',
      })

      expect(result.hasPermission).toBe(false)
      expect(result.reason).toContain("does not have permission 'create_task'")
    })

    it('should allow member to create tasks', async () => {
      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'member',
      })

      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        permission: 'create_task',
      })

      expect(result.hasPermission).toBe(true)
    })

    it('should deny member from deleting project', async () => {
      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'member',
      })

      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        permission: 'delete_project',
      })

      expect(result.hasPermission).toBe(false)
    })

    it('should allow owner to delete project', async () => {
      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'owner',
      })

      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        permission: 'delete_project',
      })

      expect(result.hasPermission).toBe(true)
    })
  })

  describe('Role hierarchy checks (RN1.2)', () => {
    it('should allow admin when minimum role is member', async () => {
      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'admin',
      })

      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        minimumRole: 'member',
      })

      expect(result.hasPermission).toBe(true)
    })

    it('should deny member when minimum role is admin', async () => {
      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'member',
      })

      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        minimumRole: 'admin',
      })

      expect(result.hasPermission).toBe(false)
      expect(result.reason).toContain("is below required 'admin'")
    })

    it('should allow owner when minimum role is admin', async () => {
      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'owner',
      })

      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        minimumRole: 'admin',
      })

      expect(result.hasPermission).toBe(true)
    })

    it('should allow exact role match', async () => {
      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'member',
      })

      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        minimumRole: 'member',
      })

      expect(result.hasPermission).toBe(true)
    })
  })

  describe('Multiple roles - most permissive (RN1.1)', () => {
    it('should use admin role when user has both member and admin', async () => {
      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'member',
      })

      await projectMembersRepository.create({
        projectId: 1,
        userId: mockUser.id,
        role: 'admin',
      })

      const result = await sut.execute({
        user: mockUser,
        projectId: 1,
        permission: 'edit_any_task', // Apenas admin tem
      })

      expect(result.hasPermission).toBe(true)
      expect(result.userRole).toBe('admin')
    })
  })
})
