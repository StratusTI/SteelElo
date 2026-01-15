import {
    ProjectPermission,
    ProjectRole,
    ROLE_HIERARCHY,
    ROLE_PERMISSIONS,
} from '../@types/project-role'

export function roleHasPermission(
  role: ProjectRole,
  permission: ProjectPermission
): boolean {
  const permissions = ROLE_PERMISSIONS[role]

  return permissions.includes(permission)
}

export function roleIsAtLeast(
  userRole: ProjectRole,
  minimumRole: ProjectRole
): boolean {
  const userLevel = ROLE_HIERARCHY[userRole]
  const requiredLevel = ROLE_HIERARCHY[minimumRole]

  return userLevel >= requiredLevel
}

export function getMostPermissiveRole(roles: ProjectRole[]): ProjectRole | null {
  if (roles.length === 0) return null

  return roles.reduce((highest, current) => {
    const currentLevel = ROLE_HIERARCHY[current]
    const highestLevel = ROLE_HIERARCHY[highest]

    return currentLevel > highestLevel ? current : highest
  })
}

export function getPermissionsForRole(role: ProjectRole): ProjectPermission[] {
  return ROLE_PERMISSIONS[role]
}

export function formatRoleName(role: ProjectRole): string {
  const names: Record<ProjectRole, string> = {
    viewer: 'Visualizador',
    member: 'Membro',
    admin: 'Administrador',
    owner: 'Proprietário',
    superadmin: 'Super Administrador'
  }

  return names[role]
}

export function getRoleDescription(role: ProjectRole): string {
  const descriptions: Record<ProjectRole, string> = {
    viewer: 'Pode visualizar o projeto e suas tarefas',
    member: 'Pode criar e editar suas próprias tarefas',
    admin: 'Pode gerenciar tarefas, membros e configurar o projeto',
    owner: 'Controle total do projeto, incluindo exclusão',
    superadmin: 'Acesso total a todos os projetos do sistema'
  }

  return descriptions[role]
}
