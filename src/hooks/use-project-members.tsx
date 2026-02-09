import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from './use-projects';

export interface ProjectMember {
  id: number;
  userId: number;
  role: string;
  source: string;
  addedAt: string;
  user: {
    id: number;
    nome: string;
    sobrenome: string | null;
    email: string;
    foto: string | null;
  };
}

interface ProjectMembersResponse {
  success: boolean;
  data: {
    members: ProjectMember[];
  };
}

interface UseProjectMembersParams {
  projectId: number;
  enabled?: boolean;
}

export function useProjectMembers({ projectId, enabled = true }: UseProjectMembersParams) {
  return useQuery<ProjectMembersResponse>({
    queryKey: projectKeys.members(projectId),
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/members`);

      if (!response.ok) {
        throw new Error('Failed to fetch project members');
      }

      return response.json();
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

interface AddMemberData {
  userId: number;
  role: string;
}

export function useAddProjectMember(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddMemberData) => {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add member');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate members list
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
  });
}

export function useRemoveProjectMember(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove member');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate members list
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
  });
}

interface UpdateMemberRoleData {
  userId: number;
  role: string;
}

export function useUpdateProjectMemberRole(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: UpdateMemberRoleData) => {
      const response = await fetch(`/api/projects/${projectId}/members/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update member role');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate members list
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
  });
}
