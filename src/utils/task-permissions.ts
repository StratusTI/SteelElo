import { ProjectRole } from "@/src/@types/project-role";
import { roleIsAtLeast } from "./permissions";

interface TaskWithOwnership {
  createdBy: number
  projetoId?: number
}

/**
 * Verifica se o usuário pode editar uma tarefa específica
 *
 * Regras:
 * - Admin ou superior: pode editar qualquer tarefa
 * - Member: pode editar apenas tarefas próprias
 * - Viewer: não pode editar nenhuma tarefa
 *
 * @param userId - ID do usuário
 * @param userRole - Role do usuário no projeto
 * @param task - Tarefa a ser editada
 * @returns true se pode editar, false caso contrário
 */
export function canUserEditTask(
  userId: number,
  userRole: ProjectRole | null,
  task: TaskWithOwnership
): boolean {
  // Sem role = sem permissão
  if (!userRole) return false

  // Admin ou superior pode editar qualquer tarefa
  if (roleIsAtLeast(userRole, 'admin')) {
    return true
  }

  // Member pode editar apenas tarefas próprias
  if (userRole === 'member') {
    return task.createdBy === userId
  }

  // Viewer não pode editar
  return false
}

/**
 * Verifica se o usuário pode deletar uma tarefa específica
 *
 * Regras:
 * - Admin ou superior: pode deletar qualquer tarefa
 * - Member: pode deletar apenas tarefas próprias
 * - Viewer: não pode deletar nenhuma tarefa
 *
 * @param userId - ID do usuário
 * @param userRole - Role do usuário no projeto
 * @param task - Tarefa a ser deletada
 * @returns true se pode deletar, false caso contrário
 */
export function canUserDeleteTask(
  userId: number,
  userRole: ProjectRole | null,
  task: TaskWithOwnership
): boolean {
  // Mesma lógica de edição
  return canUserEditTask(userId, userRole, task)
}

/**
 * Verifica se o usuário pode mover uma tarefa (mudar coluna)
 *
 * Regras:
 * - Admin ou superior: pode mover qualquer tarefa
 * - Member: pode mover qualquer tarefa (mesmo de outros)
 * - Viewer: não pode mover nenhuma tarefa
 *
 * @param userRole - Role do usuário no projeto
 * @returns true se pode mover, false caso contrário
 */
export function canUserMoveTask(userRole: ProjectRole | null): boolean {
  if (!userRole) return false

  // Member ou superior pode mover tarefas
  return roleIsAtLeast(userRole, 'member')
}

/**
 * Verifica se o usuário pode editar um comentário específico
 *
 * Regras:
 * - Qualquer um pode editar apenas comentários próprios
 *
 * @param userId - ID do usuário
 * @param comment - Comentário a ser editado
 * @returns true se pode editar, false caso contrário
 */
export function canUserEditComment(
  userId: number,
  comment: { usuarioId: number }
): boolean {
  return comment.usuarioId === userId
}

/**
 * Verifica se o usuário pode deletar um comentário específico
 *
 * Regras:
 * - Qualquer um pode deletar apenas comentários próprios
 *
 * @param userId - ID do usuário
 * @param comment - Comentário a ser deletado
 * @returns true se pode deletar, false caso contrário
 */
export function canUserDeleteComment(
  userId: number,
  comment: { usuarioId: number }
): boolean {
  return comment.usuarioId === userId
}

/**
 * Retorna a permissão necessária para editar uma tarefa
 * com base no ownership
 *
 * @param userId - ID do usuário
 * @param task - Tarefa a ser editada
 * @returns 'edit_own_task' ou 'edit_any_task'
 */
export function getRequiredEditTaskPermission(
  userId: number,
  task: TaskWithOwnership
): 'edit_own_task' | 'edit_any_task' {
  return task.createdBy === userId ? 'edit_own_task' : 'edit_any_task'
}

/**
 * Retorna a permissão necessária para deletar uma tarefa
 * com base no ownership
 *
 * @param userId - ID do usuário
 * @param task - Tarefa a ser deletada
 * @returns 'delete_own_task' ou 'delete_any_task'
 */
export function getRequiredDeleteTaskPermission(
  userId: number,
  task: TaskWithOwnership
): 'delete_own_task' | 'delete_any_task' {
  return task.createdBy === userId ? 'delete_own_task' : 'delete_any_task'
}
