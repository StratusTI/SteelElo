import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjetoPriority, ProjetoStatus } from '@/src/generated/elo';
import type { IconSvgObject } from '../@types/icon-svg-object';

export interface Project {
  id: number;
  nome: string;
  projectId: string | null;
  descricao: string | null;
  icone: IconSvgObject;
  backgroundUrl: string | null;
  status: ProjetoStatus;
  prioridade: ProjetoPriority;
  ownerId: number;
  createdAt: string;
}

interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
    total: number;
  };
}

interface UseProjectsParams {
  enterpriseId: number;
  search?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

// Query keys for cache management
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: Omit<UseProjectsParams, 'enabled'>) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: number) => [...projectKeys.details(), id] as const,
  members: (projectId: number) => ['project-members', projectId] as const,
};

export function useProjects({
  enterpriseId,
  search,
  status,
  priority,
  page = 1,
  limit = 50,
  enabled = true,
}: UseProjectsParams) {
  return useQuery<ProjectsResponse>({
    queryKey: projectKeys.list({ enterpriseId, search, status, priority, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('enterpriseId', enterpriseId.toString());

      if (search) params.set('search', search);
      if (status) params.set('status', status);
      if (priority) params.set('prioridade', priority);
      if (page) params.set('page', page.toString());
      if (limit) params.set('limit', limit.toString());

      const response = await fetch(`/api/projects?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      return response.json();
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface CreateProjectData {
  nome: string;
  projectId?: string;
  descricao?: string;
  icone?: string;
  status?: ProjetoStatus;
  prioridade?: ProjetoPriority;
}

export function useCreateProject(enterpriseId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          idempresa: enterpriseId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all project lists
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

interface UpdateProjectData {
  nome?: string;
  projectId?: string;
  descricao?: string;
  icone?: string;
  status?: ProjetoStatus;
  prioridade?: ProjetoPriority;
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: number; data: UpdateProjectData }) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update project');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific project and lists
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: number) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete project');
      }

      return response.json();
    },
    onSuccess: (_, projectId) => {
      // Invalidate specific project and lists
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
