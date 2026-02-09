import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface QuickLink {
  id: number;
  usuarioId: number;
  url: string;
  titulo: string | null;
  createdAt: string;
  updatedAt: string;
}

interface QuickLinksResponse {
  success: boolean;
  data: {
    quickLinks: QuickLink[];
  };
}

interface QuickLinkResponse {
  success: boolean;
  data: {
    quickLink: QuickLink;
  };
}

// Query keys for cache management
export const quickLinkKeys = {
  all: ['quick-links'] as const,
  list: () => [...quickLinkKeys.all, 'list'] as const,
};

export function useQuickLinks() {
  return useQuery<QuickLinksResponse>({
    queryKey: quickLinkKeys.list(),
    queryFn: async () => {
      const response = await fetch('/api/quick-links');

      if (!response.ok) {
        throw new Error('Failed to fetch quick links');
      }

      return response.json();
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

interface CreateQuickLinkData {
  url: string;
  titulo?: string;
}

export function useCreateQuickLink() {
  const queryClient = useQueryClient();

  return useMutation<QuickLinkResponse, Error, CreateQuickLinkData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/quick-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quick link');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickLinkKeys.list() });
    },
  });
}

interface UpdateQuickLinkData {
  url?: string;
  titulo?: string;
}

export function useUpdateQuickLink() {
  const queryClient = useQueryClient();

  return useMutation<QuickLinkResponse, Error, { quickLinkId: number; data: UpdateQuickLinkData }>({
    mutationFn: async ({ quickLinkId, data }) => {
      const response = await fetch(`/api/quick-links/${quickLinkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quick link');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickLinkKeys.list() });
    },
  });
}

export function useDeleteQuickLink() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (quickLinkId) => {
      const response = await fetch(`/api/quick-links/${quickLinkId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete quick link');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quickLinkKeys.list() });
    },
  });
}
