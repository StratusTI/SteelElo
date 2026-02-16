'use client';

import {
  File02Icon,
  Home03Icon,
  UserIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import { useParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Icon } from '@/app/components/HugeIcons';
import { BreadCrumb, NavBar } from '@/app/components/shared/navigation/navBar';
import { Muted } from '@/app/components/typography/text/muted';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import type { BreadCrumbItem } from '@/lib/@types/breadcrumb';
import { useMatchesPath } from '@/lib/matchesPath';
import { useDocument } from '@/src/hooks/use-documents';
import { Editor } from '../_components/editor';
import { type SaveStatus, useAutoSave } from '../_components/use-auto-save';
import { StateIcon } from '../types/doc';

const STATUS_LABEL: Record<string, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  private: 'Privado',
  archived: 'Arquivado',
};

const SAVE_LABEL: Record<SaveStatus, string | null> = {
  idle: null,
  saving: 'Salvando...',
  saved: 'Salvo',
  error: 'Erro ao salvar',
};

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const { buildPath } = useMatchesPath();
  const { data, isLoading, isError } = useDocument(id);
  const { save, status: saveStatus } = useAutoSave({ documentId: id });

  const [title, setTitle] = useState<string | null>(null);

  const document = data?.data?.document;

  const displayTitle = title ?? document?.titulo ?? '';

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value;
      setTitle(newTitle);
      save({ titulo: newTitle });
    },
    [save],
  );

  const handleContentUpdate = useCallback(
    (markdown: string) => {
      save({ conteudo: markdown });
    },
    [save],
  );

  const breadcrumbItems: BreadCrumbItem[] = [
    { name: 'Início', icon: Home03Icon, href: buildPath('/wiki') },
    { name: displayTitle || 'Documento', icon: File02Icon },
  ];

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col">
        <NavBar>
          <BreadCrumb items={breadcrumbItems} />
        </NavBar>
        <div className="flex-1 w-full overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full p-8 flex flex-col gap-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="h-full w-full flex flex-col">
        <NavBar>
          <BreadCrumb items={breadcrumbItems} />
        </NavBar>
        <div className="flex-1 w-full flex items-center justify-center">
          <Muted>Documento não encontrado.</Muted>
        </div>
      </div>
    );
  }

  const StatusIcon = StateIcon[document.status];
  const createdAt = new Date(document.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const updatedAt = new Date(document.updatedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const saveLabel = SAVE_LABEL[saveStatus];

  return (
    <div className="h-full w-full flex flex-col">
      <NavBar>
        <div className="flex items-center gap-3 w-full">
          <BreadCrumb items={breadcrumbItems} />
          {saveLabel && (
            <span
              className={`ml-auto text-xs ${saveStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}
            >
              {saveLabel}
            </span>
          )}
        </div>
      </NavBar>
      <div className="flex-1 w-full overflow-x-hidden overflow-y-auto">
        <div
          className={`mx-auto w-full flex flex-col gap-6 p-8 ${document.isFullWidth ? 'max-w-full' : 'max-w-4xl'}`}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-2">
              {document.icone && (
                <span className="text-4xl">{document.icone}</span>
              )}
              <input
                type="text"
                value={displayTitle}
                onChange={handleTitleChange}
                placeholder="Sem título"
                className="text-4xl font-bold tracking-tight bg-transparent border-none outline-none w-full placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {document.creator && (
                <div className="flex items-center gap-2">
                  <Avatar size="sm">
                    {document.creator.foto ? (
                      <AvatarImage src={document.creator.foto} />
                    ) : null}
                    <AvatarFallback>
                      <Icon icon={UserIcon} size={12} />
                    </AvatarFallback>
                  </Avatar>
                  <span>{document.creator.username}</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Icon icon={StatusIcon} size={14} />
                <span>{STATUS_LABEL[document.status]}</span>
              </div>

              <span>Criado em {createdAt}</span>
              {createdAt !== updatedAt && (
                <span>Atualizado em {updatedAt}</span>
              )}
            </div>
          </div>

          <Editor
            initialContent={document.conteudo}
            onUpdate={handleContentUpdate}
          />
        </div>
      </div>
    </div>
  );
}
