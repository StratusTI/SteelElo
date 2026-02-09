import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { StickyColor } from '@/src/@types/sticky';

export interface Sticky {
  id: number;
  usuarioId: number;
  content: string;
  backgroundColor: StickyColor;
  isBold: boolean;
  isItalic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StickiesResponse {
  success: boolean;
  data: {
    stickies: Sticky[];
  };
}

interface StickyResponse {
  success: boolean;
  data: {
    sticky: Sticky;
  };
}

export const stickyKeys = {
  all: ['stickies'] as const,
  list: (search?: string) => [...stickyKeys.all, 'list', { search }] as const,
};

export function useStickies(search?: string) {
  return useQuery<StickiesResponse>({
    queryKey: stickyKeys.list(search),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) {
        params.set('search', search);
      }

      const url = `/api/stickies${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch stickies');
      }

      return response.json();
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

interface CreateStickyData {
  content?: string;
  backgroundColor?: StickyColor;
  isBold?: boolean;
  isItalic?: boolean;
}

export function useCreateSticky() {
  const queryClient = useQueryClient();

  return useMutation<StickyResponse, Error, CreateStickyData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/stickies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create sticky');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stickyKeys.all });
    },
  });
}

interface UpdateStickyData {
  content?: string;
  backgroundColor?: StickyColor;
  isBold?: boolean;
  isItalic?: boolean;
}

export function useUpdateSticky() {
  const queryClient = useQueryClient();

  return useMutation<StickyResponse, Error, { stickyId: number; data: UpdateStickyData }>({
    mutationFn: async ({ stickyId, data }) => {
      const response = await fetch(`/api/stickies/${stickyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update sticky');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stickyKeys.all });
    },
  });
}

export function useDeleteSticky() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (stickyId) => {
      const response = await fetch(`/api/stickies/${stickyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete sticky');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stickyKeys.all });
    },
  });
}
