import { ProjetoPriority, ProjetoStatus } from "../generated/elo";

export interface CreateProjectRequest {
  nome: string;
  projectId?: string;
  descricao?: string;
  icone?: string;
  backgroundUrl?: string;
  dataInicio?: Date;
  dataFim?: Date;
  status?: ProjetoStatus;
  prioridade?: ProjetoPriority;
  acesso?: boolean;
}

export interface UpdateProjectRequest {
  nome?: string;
  projectId?: string;
  descricao?: string;
  icone?: string;
  backgroundUrl?: string;
  dataInicio?: Date;
  dataFim?: Date;
  status?: ProjetoStatus;
  prioridade?: ProjetoPriority;
  acesso?: boolean;
}

export interface ProjectFilters {
  search?: string;
  status?: ProjetoStatus[];
  prioridade?: ProjetoPriority[];
  ownerId?: number;
  memberId?: number;
  orderBy?: 'nome' | 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Project {
  id: number;
  nome: string;
  projectId: string | null;
  descricao: string | null;
  icone: string | null;
  backgroundUrl: string | null;
  dataInicio: Date | null;
  dataFim: Date | null;
  ownerId: number;
  idempresa: number;
  status: ProjetoStatus;
  prioridade: ProjetoPriority;
  acesso: boolean;
  createdAt: Date;
  updatedAt: Date;
}
