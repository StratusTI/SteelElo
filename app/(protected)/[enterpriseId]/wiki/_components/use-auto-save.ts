'use client';

import { useCallback, useRef, useState } from 'react';
import { useUpdateDocument } from '@/src/hooks/use-documents';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  documentId: string;
  debounceMs?: number;
}

export function useAutoSave({
  documentId,
  debounceMs = 1000,
}: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateDocument = useUpdateDocument();

  const save = useCallback(
    (data: { titulo?: string; conteudo?: string }) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setStatus('idle');

      timerRef.current = setTimeout(async () => {
        setStatus('saving');
        try {
          await updateDocument.mutateAsync({ documentId, data });
          setStatus('saved');
        } catch {
          setStatus('error');
        }
      }, debounceMs);
    },
    [documentId, debounceMs, updateDocument],
  );

  return { save, status };
}
