import { ProjetoStatus, TarefaStatus } from '@/src/generated/elo'

export const DEFAULT_PROJECT_COLUMNS = [
  { titulo: 'Rascunho', ordem: 0, cor: '#64748b' },
  { titulo: 'Planejamento', ordem: 1, cor: '#3b82f6' },
  { titulo: 'Execução', ordem: 2, cor: '#f59e0b' },
  { titulo: 'Monitoramento', ordem: 3, cor: '#8b5cf6' },
  { titulo: 'Concluído', ordem: 4, cor: '#10b981' },
  { titulo: 'Cancelado', ordem: 5, cor: '#ef4444' },
] as const

export const DEFAULT_TASK_COLUMNS = [
  { titulo: 'Backlog', ordem: 0, cor: '#94a3b8' },
  { titulo: 'A Fazer', ordem: 1, cor: '#3b82f6' },
  { titulo: 'Em Progresso', ordem: 2, cor: '#f59e0b' },
  { titulo: 'Concluído', ordem: 3, cor: '#10b981' },
] as const

export const PROJECT_STATUS_TO_COLUMN: Record<ProjetoStatus, string> = {
  [ProjetoStatus.draft]: 'Rascunho',
  [ProjetoStatus.planning]: 'Planejamento',
  [ProjetoStatus.execution]: 'Execução',
  [ProjetoStatus.monitoring]: 'Monitoramento',
  [ProjetoStatus.completed]: 'Concluído',
  [ProjetoStatus.cancelled]: 'Cancelado',
}

export const TASK_STATUS_TO_COLUMN: Record<TarefaStatus, string> = {
  [TarefaStatus.backlog]: 'Backlog',
  [TarefaStatus.todo]: 'A Fazer',
  [TarefaStatus.in_progress]: 'Em Progresso',
  [TarefaStatus.done]: 'Concluído',
  [TarefaStatus.cancelled]: 'Cancelado',
}
