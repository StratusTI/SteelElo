'use client';

import { useParams } from 'next/navigation';
import { Muted } from '@/app/components/typography/text/muted';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicDocument } from '@/src/hooks/use-documents';
import { Editor } from '../../_components/editor';

export default function PublicDocumentPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError } = usePublicDocument(token);

  const document = data?.data?.document;

  if (isLoading) {
    return (
      <div className="min-h-screen w-full">
        <div className="max-w-4xl mx-auto w-full p-8 flex flex-col gap-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Muted>Documento não encontrado ou link expirado.</Muted>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div
        className={`mx-auto w-full flex flex-col gap-6 p-8 ${document.isFullWidth ? 'max-w-full' : 'max-w-4xl'}`}
      >
        <h1 className="text-4xl font-bold tracking-tight">
          {document.icone && <span className="mr-2">{document.icone}</span>}
          {document.titulo}
        </h1>

        <Editor initialContent={document.conteudo} editable={false} />
      </div>
    </div>
  );
}
