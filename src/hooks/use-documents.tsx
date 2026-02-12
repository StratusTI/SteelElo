import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Document,
  DocumentStatus,
  DocumentVersion,
  DocumentWithChildren,
} from '@/src/@types/document';

export interface DocumentCreator {
  id: number;
  username: string;
  foto: string;
}

export interface DocumentWithCreator extends Document {
  creator?: DocumentCreator;
}

interface DocumentsResponse {
  success: boolean;
  data: {
    documents: DocumentWithCreator[];
  };
}

interface DocumentDetailResponse {
  success: boolean;
  data: {
    document: DocumentWithCreator;
    isFavorite: boolean;
  };
}

interface DocumentTreeResponse {
  success: boolean;
  data: {
    tree: DocumentWithChildren[];
  };
}

interface DocumentMutationResponse {
  success: boolean;
  data: {
    document: Document;
  };
  message?: string;
}

interface ToggleFavoriteResponse {
  success: boolean;
  data: {
    isFavorite: boolean;
  };
}

interface VersionsResponse {
  success: boolean;
  data: {
    versions: DocumentVersion[];
  };
}

interface PublicDocumentResponse {
  success: boolean;
  data: {
    document: Document;
  };
}

export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: { status?: string; search?: string }) =>
    [...documentKeys.lists(), filters] as const,
  tree: () => [...documentKeys.all, 'tree'] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  versions: (id: string) => [...documentKeys.all, 'versions', id] as const,
};

// ── Queries ──

export function useDocuments(filters: {
  status?: DocumentStatus;
  search?: string;
}) {
  return useQuery<DocumentsResponse>({
    queryKey: documentKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const url = `/api/documents${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      return response.json();
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useDocumentTree() {
  return useQuery<DocumentTreeResponse>({
    queryKey: documentKeys.tree(),
    queryFn: async () => {
      const response = await fetch('/api/documents/tree');

      if (!response.ok) {
        throw new Error('Failed to fetch document tree');
      }

      return response.json();
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useDocument(id: string) {
  return useQuery<DocumentDetailResponse>({
    queryKey: documentKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/documents/${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useDocumentVersions(id: string) {
  return useQuery<VersionsResponse>({
    queryKey: documentKeys.versions(id),
    queryFn: async () => {
      const response = await fetch(`/api/documents/${id}/versions`);

      if (!response.ok) {
        throw new Error('Failed to fetch document versions');
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function usePublicDocument(token: string) {
  return useQuery<PublicDocumentResponse>({
    queryKey: ['documents', 'public', token] as const,
    queryFn: async () => {
      const response = await fetch(`/api/documents/public/${token}`);

      if (!response.ok) {
        throw new Error('Failed to fetch public document');
      }

      return response.json();
    },
    enabled: !!token,
  });
}

// ── Mutations ──

interface CreateDocumentData {
  titulo: string;
  icone?: string;
  conteudo?: string;
  parentId?: string;
  status?: DocumentStatus;
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation<DocumentMutationResponse, Error, CreateDocumentData>({
    mutationFn: async (data) => {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create document');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.tree() });
    },
  });
}

interface UpdateDocumentData {
  titulo?: string;
  icone?: string;
  conteudo?: string;
  status?: DocumentStatus;
  isFullWidth?: boolean;
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation<
    DocumentMutationResponse,
    Error,
    { documentId: string; data: UpdateDocumentData }
  >({
    mutationFn: async ({ documentId, data }) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update document');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(variables.documentId),
      });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.tree() });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (documentId) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete document');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();

  return useMutation<DocumentMutationResponse, Error, string>({
    mutationFn: async (documentId) => {
      const response = await fetch(`/api/documents/${documentId}/archive`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to archive document');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
}

export function usePublishDocument() {
  const queryClient = useQueryClient();

  return useMutation<DocumentMutationResponse, Error, string>({
    mutationFn: async (documentId) => {
      const response = await fetch(`/api/documents/${documentId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to publish document');
      }

      return response.json();
    },
    onSuccess: (_data, documentId) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(documentId),
      });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

export function useDuplicateDocument() {
  const queryClient = useQueryClient();

  return useMutation<DocumentMutationResponse, Error, string>({
    mutationFn: async (documentId) => {
      const response = await fetch(`/api/documents/${documentId}/duplicate`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to duplicate document');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.tree() });
    },
  });
}

interface MoveDocumentData {
  documentId: string;
  parentId: string | null;
  ordem?: number;
  projetoId?: string | null;
}

export function useMoveDocument() {
  const queryClient = useQueryClient();

  return useMutation<DocumentMutationResponse, Error, MoveDocumentData>({
    mutationFn: async ({ documentId, parentId, ordem, projetoId }) => {
      const response = await fetch(`/api/documents/${documentId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, ordem, projetoId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to move document');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentKeys.tree() });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation<ToggleFavoriteResponse, Error, string>({
    mutationFn: async (documentId) => {
      const response = await fetch(`/api/documents/${documentId}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle favorite');
      }

      return response.json();
    },
    onSuccess: (_data, documentId) => {
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(documentId),
      });
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}
