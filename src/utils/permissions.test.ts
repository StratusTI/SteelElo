import { describe, expect, it } from 'vitest'
import {
    formatRoleName,
    getMostPermissiveRole,
    getPermissionsForRole,
    getRoleDescription,
    roleHasPermission,
    roleIsAtLeast,
} from './permissions'

describe('Permissions Utils', () => {
  describe('roleHasPermission', () => {
    it('should return true when role has permission', () => {
      expect(roleHasPermission('member', 'create_task')).toBe(true)
      expect(roleHasPermission('admin', 'edit_any_task')).toBe(true)
      expect(roleHasPermission('owner', 'delete_project')).toBe(true)
    })

    it('should return false when role lacks permission', () => {
      expect(roleHasPermission('viewer', 'create_task')).toBe(false)
      expect(roleHasPermission('member', 'delete_project')).toBe(false)
      expect(roleHasPermission('admin', 'transfer_ownership')).toBe(false)
    })
  })

  describe('roleIsAtLeast', () => {
    it('should return true for exact match', () => {
      expect(roleIsAtLeast('member', 'member')).toBe(true)
      expect(roleIsAtLeast('admin', 'admin')).toBe(true)
    })

    it('should return true for higher roles', () => {
      expect(roleIsAtLeast('admin', 'member')).toBe(true)
      expect(roleIsAtLeast('owner', 'admin')).toBe(true)
      expect(roleIsAtLeast('superadmin', 'owner')).toBe(true)
    })

    it('should return false for lower roles', () => {
      expect(roleIsAtLeast('viewer', 'member')).toBe(false)
      expect(roleIsAtLeast('member', 'admin')).toBe(false)
      expect(roleIsAtLeast('admin', 'owner')).toBe(false)
    })
  })

  describe('getMostPermissiveRole', () => {
    it('should return null for empty array', () => {
      expect(getMostPermissiveRole([])).toBeNull()
    })

    it('should return single role', () => {
      expect(getMostPermissiveRole(['member'])).toBe('member')
    })

    it('should return most permissive from multiple roles', () => {
      expect(getMostPermissiveRole(['viewer', 'member'])).toBe('member')
      expect(getMostPermissiveRole(['member', 'admin', 'viewer'])).toBe('admin')
      expect(getMostPermissiveRole(['owner', 'member', 'admin'])).toBe('owner')
    })

    it('should handle superadmin', () => {
      expect(getMostPermissiveRole(['superadmin', 'owner'])).toBe('superadmin')
    })
  })

  describe('getPermissionsForRole', () => {
    it('should return correct permissions for viewer', () => {
      const permissions = getPermissionsForRole('viewer')
      expect(permissions).toContain('read_project')
      expect(permissions).not.toContain('create_task')
    })

    it('should return correct permissions for member', () => {
      const permissions = getPermissionsForRole('member')
      expect(permissions).toContain('create_task')
      expect(permissions).toContain('edit_own_task')
      expect(permissions).not.toContain('edit_any_task')
    })

    it('should return correct permissions for admin', () => {
      const permissions = getPermissionsForRole('admin')
      expect(permissions).toContain('edit_any_task')
      expect(permissions).toContain('invite_member')
      expect(permissions).not.toContain('delete_project')
    })

    it('should return all permissions for owner', () => {
      const permissions = getPermissionsForRole('owner')
      expect(permissions).toContain('delete_project')
      expect(permissions).toContain('transfer_ownership')
    })
  })

  describe('formatRoleName', () => {
    it('should format role names correctly', () => {
      expect(formatRoleName('viewer')).toBe('Visualizador')
      expect(formatRoleName('member')).toBe('Membro')
      expect(formatRoleName('admin')).toBe('Administrador')
      expect(formatRoleName('owner')).toBe('Proprietário')
      expect(formatRoleName('superadmin')).toBe('Super Administrador')
    })
  })

  describe('getRoleDescription', () => {
    it('should return descriptions for all roles', () => {
      expect(getRoleDescription('viewer')).toContain('visualizar')
      expect(getRoleDescription('member')).toContain('criar')
      expect(getRoleDescription('admin')).toContain('gerenciar')
      expect(getRoleDescription('owner')).toContain('total')
      expect(getRoleDescription('superadmin')).toContain('todos os projetos')
    })
  })
})
