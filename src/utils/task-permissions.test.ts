import { describe, expect, it } from 'vitest'
import {
    canUserDeleteComment,
    canUserDeleteTask,
    canUserEditComment,
    canUserEditTask,
    canUserMoveTask,
    getRequiredDeleteTaskPermission,
    getRequiredEditTaskPermission,
} from './task-permissions'

describe('Task Permissions Utils', () => {
  const mockTask = {
    createdBy: 1,
    projetoId: 10,
  }

  describe('canUserEditTask', () => {
    it('should allow admin to edit any task', () => {
      expect(canUserEditTask(999, 'admin', mockTask)).toBe(true)
    })

    it('should allow owner to edit any task', () => {
      expect(canUserEditTask(999, 'owner', mockTask)).toBe(true)
    })

    it('should allow superadmin to edit any task', () => {
      expect(canUserEditTask(999, 'superadmin', mockTask)).toBe(true)
    })

    it('should allow member to edit own task', () => {
      expect(canUserEditTask(1, 'member', mockTask)).toBe(true)
    })

    it('should deny member from editing others task', () => {
      expect(canUserEditTask(999, 'member', mockTask)).toBe(false)
    })

    it('should deny viewer from editing any task', () => {
      expect(canUserEditTask(1, 'viewer', mockTask)).toBe(false)
      expect(canUserEditTask(999, 'viewer', mockTask)).toBe(false)
    })

    it('should deny user with no role', () => {
      expect(canUserEditTask(1, null, mockTask)).toBe(false)
    })
  })

  describe('canUserDeleteTask', () => {
    it('should allow admin to delete any task', () => {
      expect(canUserDeleteTask(999, 'admin', mockTask)).toBe(true)
    })

    it('should allow member to delete own task', () => {
      expect(canUserDeleteTask(1, 'member', mockTask)).toBe(true)
    })

    it('should deny member from deleting others task', () => {
      expect(canUserDeleteTask(999, 'member', mockTask)).toBe(false)
    })

    it('should deny viewer from deleting any task', () => {
      expect(canUserDeleteTask(1, 'viewer', mockTask)).toBe(false)
    })
  })

  describe('canUserMoveTask', () => {
    it('should allow member to move tasks', () => {
      expect(canUserMoveTask('member')).toBe(true)
    })

    it('should allow admin to move tasks', () => {
      expect(canUserMoveTask('admin')).toBe(true)
    })

    it('should allow owner to move tasks', () => {
      expect(canUserMoveTask('owner')).toBe(true)
    })

    it('should deny viewer from moving tasks', () => {
      expect(canUserMoveTask('viewer')).toBe(false)
    })

    it('should deny user with no role', () => {
      expect(canUserMoveTask(null)).toBe(false)
    })
  })

  describe('canUserEditComment', () => {
    it('should allow user to edit own comment', () => {
      const comment = { usuarioId: 1 }
      expect(canUserEditComment(1, comment)).toBe(true)
    })

    it('should deny user from editing others comment', () => {
      const comment = { usuarioId: 1 }
      expect(canUserEditComment(999, comment)).toBe(false)
    })
  })

  describe('canUserDeleteComment', () => {
    it('should allow user to delete own comment', () => {
      const comment = { usuarioId: 1 }
      expect(canUserDeleteComment(1, comment)).toBe(true)
    })

    it('should deny user from deleting others comment', () => {
      const comment = { usuarioId: 1 }
      expect(canUserDeleteComment(999, comment)).toBe(false)
    })
  })

  describe('getRequiredEditTaskPermission', () => {
    it('should return edit_own_task for own task', () => {
      expect(getRequiredEditTaskPermission(1, mockTask)).toBe('edit_own_task')
    })

    it('should return edit_any_task for others task', () => {
      expect(getRequiredEditTaskPermission(999, mockTask)).toBe('edit_any_task')
    })
  })

  describe('getRequiredDeleteTaskPermission', () => {
    it('should return delete_own_task for own task', () => {
      expect(getRequiredDeleteTaskPermission(1, mockTask)).toBe(
        'delete_own_task'
      )
    })

    it('should return delete_any_task for others task', () => {
      expect(getRequiredDeleteTaskPermission(999, mockTask)).toBe(
        'delete_any_task'
      )
    })
  })
})
