export type ProjectRole = 'viewer' | 'member' | 'admin' | 'owner' | 'superadmin'

export const ROLE_HIERARCHY: Record<ProjectRole, number> = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
  superadmin: 5
} as const

export type ProjectPermission =
  | 'read_project'
  | 'read_tasks'
  | 'read_members'

  | 'create_task'
  | 'edit_own_task'
  | 'edit_any_task'
  | 'delete_own_task'
  | 'delete_any_task'
  | 'move_task'

  | 'create_comment'
  | 'edit_own_comment'
  | 'delete_own_comment'

  | 'view_members'
  | 'invite_member'
  | 'remove_member'
  | 'change_member_role'

  | 'edit_project'
  | 'configure_project'
  | 'archive_project'

  | 'delete_project'
  | 'transfer_ownership'

export const ROLE_PERMISSIONS: Record<ProjectRole, ProjectPermission[]> = {
  viewer: [
    'read_project',
    'read_tasks',
    'view_members'
  ],

  member: [
    'read_project',
    'read_tasks',
    'view_members',
    'create_task',
    'edit_own_task',
    'delete_own_task',
    'move_task',
    'create_comment',
    'edit_own_comment',
    'delete_own_comment'
  ],

  admin: [
    'read_project',
    'read_tasks',
    'view_members',
    'create_task',
    'edit_own_task',
    'delete_own_task',
    'move_task',
    'create_comment',
    'edit_own_comment',
    'delete_own_comment',
    'edit_any_task',
    'delete_any_task',
    'invite_member',
    'remove_member',
    'change_member_role',
    'edit_project',
    'configure_project',
  ],

  owner: [
    'read_project',
    'read_tasks',
    'view_members',
    'create_task',
    'edit_own_task',
    'delete_own_task',
    'move_task',
    'create_comment',
    'edit_own_comment',
    'delete_own_comment',
    'edit_any_task',
    'delete_any_task',
    'invite_member',
    'remove_member',
    'change_member_role',
    'edit_project',
    'configure_project',
    'archive_project',
    'delete_project',
    'transfer_ownership'
  ],

  superadmin: [
    // Toda as permissões (wildcard)
    'read_project',
    'read_tasks',
    'view_members',
    'create_task',
    'edit_own_task',
    'delete_own_task',
    'move_task',
    'create_comment',
    'edit_own_comment',
    'delete_own_comment',
    'edit_any_task',
    'delete_any_task',
    'invite_member',
    'remove_member',
    'change_member_role',
    'edit_project',
    'configure_project',
    'archive_project',
    'delete_project',
    'transfer_ownership',
  ]
}

export interface ProjectMember {
  id: number
  projetoId: number
  usuarioId: number
  role: ProjectRole
  adicionadoEm: Date
}

export interface PermissionCheckResult {
  hasPermission: boolean
  userRole: ProjectRole | null
  reason?: string
}
