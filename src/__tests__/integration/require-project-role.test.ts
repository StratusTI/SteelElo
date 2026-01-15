import type { User } from '@/src/@types/user'
import { requireProjectRole } from '@/src/http/middlewares/require-project-role'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock do verifyJWT
vi.mock('@/src/http/middlewares/verify-jwt', () => ({
  verifyJWT: vi.fn(),
}))

// Mock do use case factory
vi.mock('@/src/use-cases/factories/make-check-user-permission', () => ({
  makeCheckUserPermissionUseCase: vi.fn(),
}))

import { verifyJWT } from '@/src/http/middlewares/verify-jwt'
import { makeCheckUserPermissionUseCase } from '@/src/use-cases/factories/make-check-user-permission'

describe('requireProjectRole Middleware - Integration Tests', () => {
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

  const mockCheckPermissionUseCase = {
    execute: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(makeCheckUserPermissionUseCase).mockReturnValue(
      mockCheckPermissionUseCase as any
    )
  })

  describe('Authentication checks', () => {
    it('should return 401 when user is not authenticated', async () => {
      vi.mocked(verifyJWT).mockResolvedValue({
        user: null,
        error: Response.json(
          {
            success: false,
            statusCode: 401,
            message: 'Authentication token not found',
            error: { code: 'UNAUTHORIZED' },
          },
          { status: 401 }
        ) as any,
      })

      const result = await requireProjectRole({
        projectId: 1,
        minimumRole: 'member',
      })

      expect(result.user).toBeNull()
      expect(result.error).toBeDefined()
      expect(mockCheckPermissionUseCase.execute).not.toHaveBeenCalled()
    })
  })

  describe('Authorization checks', () => {
    it('should allow access when user has required minimum role', async () => {
      vi.mocked(verifyJWT).mockResolvedValue({ user: mockUser })

      mockCheckPermissionUseCase.execute.mockResolvedValue({
        hasPermission: true,
        userRole: 'admin',
      })

      const result = await requireProjectRole({
        projectId: 1,
        minimumRole: 'member',
      })

      expect(result.user).toEqual(mockUser)
      expect(result.userRole).toBe('admin')
      expect(result.error).toBeUndefined()
    })

    it('should deny access when user lacks required role', async () => {
      vi.mocked(verifyJWT).mockResolvedValue({ user: mockUser })

      mockCheckPermissionUseCase.execute.mockResolvedValue({
        hasPermission: false,
        userRole: 'viewer',
        reason: "Role 'viewer' is below required 'admin'",
      })

      const result = await requireProjectRole({
        projectId: 1,
        minimumRole: 'admin',
      })

      expect(result.user).toBeNull()
      expect(result.userRole).toBe('viewer')
      expect(result.error).toBeDefined()

      const errorData = await result.error!.json()
      expect(errorData.statusCode).toBe(403)
      expect(errorData.error.code).toBe('INSUFFICIENT_PERMISSIONS')
    })

    it('should check specific permission when provided', async () => {
      vi.mocked(verifyJWT).mockResolvedValue({ user: mockUser })

      mockCheckPermissionUseCase.execute.mockResolvedValue({
        hasPermission: true,
        userRole: 'admin',
      })

      await requireProjectRole({
        projectId: 1,
        permission: 'edit_any_task',
      })

      expect(mockCheckPermissionUseCase.execute).toHaveBeenCalledWith({
        user: mockUser,
        projectId: 1,
        minimumRole: undefined,
        permission: 'edit_any_task',
      })
    })

    it('should include detailed error information on denial', async () => {
      vi.mocked(verifyJWT).mockResolvedValue({ user: mockUser })

      mockCheckPermissionUseCase.execute.mockResolvedValue({
        hasPermission: false,
        userRole: 'member',
        reason: "Role 'member' does not have permission 'delete_project'",
      })

      const result = await requireProjectRole({
        projectId: 42,
        permission: 'delete_project',
      })

      const errorData = await result.error!.json()
      expect(errorData.error.details).toMatchObject({
        projectId: 42,
        userRole: 'member',
        requiredPermission: 'delete_project',
      })
    })
  })

  describe('Superadmin bypass', () => {
    it('should allow superadmin to access any project', async () => {
      const superadminUser: User = { ...mockUser, superadmin: true }

      vi.mocked(verifyJWT).mockResolvedValue({ user: superadminUser })

      mockCheckPermissionUseCase.execute.mockResolvedValue({
        hasPermission: true,
        userRole: 'superadmin',
      })

      const result = await requireProjectRole({
        projectId: 1,
        minimumRole: 'owner',
      })

      expect(result.user).toEqual(superadminUser)
      expect(result.userRole).toBe('superadmin')
      expect(result.error).toBeUndefined()
    })
  })

  describe('Error handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(verifyJWT).mockResolvedValue({ user: mockUser })

      mockCheckPermissionUseCase.execute.mockRejectedValue(
        new Error('Database connection failed')
      )

      const result = await requireProjectRole({
        projectId: 1,
        minimumRole: 'member',
      })

      expect(result.user).toBeNull()
      expect(result.error).toBeDefined()

      const errorData = await result.error!.json()
      expect(errorData.statusCode).toBe(500)
      expect(errorData.error.code).toBe('INTERNAL_SERVER_ERROR')
    })
  })
})
