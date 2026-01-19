import { ProjetoStatus, TarefaStatus } from '@/src/generated/elo'

export const DEFAULT_PROJECT_COLUMNS = [
  { titulo: 'Rascunho', ordem: 0, status: ProjetoStatus.draft },
  { titulo: 'Planejamento', ordem: 1, status: ProjetoStatus.planning },
  { titulo: 'Execução', ordem: 2, status: ProjetoStatus.execution },
  { titulo: 'Monitoramento', ordem: 3, status: ProjetoStatus.monitoring },
  { titulo: 'Concluído', ordem: 4, status: ProjetoStatus.completed },
  { titulo: 'Cancelado', ordem: 5, status: ProjetoStatus.cancelled },
]

export const DEFAULT_TASK_COLUMNS = [
  { titulo: 'Backlog', ordem: 0, status: TarefaStatus.backlog },
  { titulo: 'A Fazer', ordem: 1, status: TarefaStatus.todo },
  { titulo: 'Em Progresso', ordem: 2, status: TarefaStatus.in_progress },
  { titulo: 'Concluído', ordem: 3, status: TarefaStatus.done },
]
