import { beforeEach, describe, expect, it } from 'vitest'
import { User } from '../@types/user'
import { InMemoryProjectMembersRepository } from '../repositories/in-memory/in-memory-project-members-repository'
import { GetUserProjectRoleUseCase } from './get-user-project-role'

let projectMembersRepository: InMemoryProjectMembersRepository
let sut: GetUserProjectRoleUseCase

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

describe('Get User Project Role Use Case', () => {
  beforeEach(() => {
    projectMembersRepository = new InMemoryProjectMembersRepository()
    sut = new GetUserProjectRoleUseCase(projectMembersRepository)
  })

  it('should return superadmin role for superadmin users', async () => {
    const superadminUser: User = { ...mockUser, superadmin: true }

    const { role, isUserSuperAdmin } = await sut.execute({
      user: superadminUser,
      projectId: 1,
    })

    expect(role).toBe('superadmin')
    expect(isUserSuperAdmin).toBe(true)
  })

  it('should return null role when user is not a member', async () => {
    const { role, isUserSuperAdmin } = await sut.execute({
      user: mockUser,
      projectId: 1,
    })

    expect(role).toBeNull()
    expect(isUserSuperAdmin).toBe(false)
  })

  it('should return user role when user is a member', async () => {
    await projectMembersRepository.create({
      projectId: 1,
      userId: mockUser.id,
      role: 'member',
    })

    const { role, isUserSuperAdmin } = await sut.execute({
      user: mockUser,
      projectId: 1,
    })

    expect(role).toBe('member')
    expect(isUserSuperAdmin).toBe(false)
  })

  it('should return most permissive role when user has multiple memberships (RN1.1)', async () => {
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

    const { role } = await sut.execute({
      user: mockUser,
      projectId: 1,
    })

    expect(role).toBe('admin')
  })

  it('should return owner when user has owner and member roles', async () => {
    await projectMembersRepository.create({
      projectId: 1,
      userId: mockUser.id,
      role: 'member',
    })

    await projectMembersRepository.create({
      projectId: 1,
      userId: mockUser.id,
      role: 'owner',
    })

    const { role } = await sut.execute({
      user: mockUser,
      projectId: 1,
    })

    expect(role).toBe('owner')
  })

  it('should not confuse projects when checking role', async () => {
    await projectMembersRepository.create({
      projectId: 1,
      userId: mockUser.id,
      role: 'admin',
    })

    await projectMembersRepository.create({
      projectId: 2,
      userId: mockUser.id,
      role: 'viewer',
    })

    const resultProject1 = await sut.execute({
      user: mockUser,
      projectId: 1,
    })

    const resultProject2 = await sut.execute({
      user: mockUser,
      projectId: 2,
    })

    expect(resultProject1.role).toBe('admin')
    expect(resultProject2.role).toBe('viewer')
  })

  it('should bypass database check for superadmin', async () => {
    const superadminUser: User = { ...mockUser, superadmin: true }

    const { role } = await sut.execute({
      user: superadminUser,
      projectId: 999,
    })

    expect(role).toBe('superadmin')
    expect(projectMembersRepository.items).toHaveLength(0)
  })
})
