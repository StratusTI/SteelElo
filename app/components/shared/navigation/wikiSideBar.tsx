'use client';

import {
  Add01Icon,
  ArrowRight01Icon,
  File02Icon,
  FileAddIcon,
  Home03Icon,
  PanelLeftCloseIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { useMatchesPath } from '@/lib/matchesPath';
import { cn } from '@/lib/utils';
import type { DocumentWithChildren } from '@/src/@types/document';
import { useCreateDocument, useDocumentTree } from '@/src/hooks/use-documents';
import { Icon } from '../../HugeIcons';
import { Large } from '../../typography/text/large';
import { Muted } from '../../typography/text/muted';

export function SideBarWiki() {
  const router = useRouter();
  const { buildPath, pathname } = useMatchesPath();
  const { data: treeData, isLoading } = useDocumentTree();
  const createDocument = useCreateDocument();

  const tree = treeData?.data?.tree ?? [];

  const workspaceDocs = tree.filter((doc) => doc.status === 'draft');
  const sharedDocs = tree.filter((doc) => doc.status === 'published');
  const privateDocs = tree.filter((doc) => doc.status === 'private');
  const archivedDocs = tree.filter((doc) => doc.status === 'archived');

  const handleNewDocument = async () => {
    try {
      const result = await createDocument.mutateAsync({ titulo: 'Sem título' });
      const newDoc = result.data.document;
      router.push(buildPath(`/wiki/${newDoc.id}`));
    } catch {
      toast.error('Falha ao criar documento');
    }
  };

  const renderDocItem = (doc: DocumentWithChildren, depth = 0) => {
    const hasChildren = doc.children && doc.children.length > 0;
    const isActive = pathname === buildPath(`/wiki/${doc.id}`);

    if (hasChildren) {
      return (
        <Collapsible key={doc.id}>
          <CollapsibleTrigger
            onClick={() => router.push(buildPath(`/wiki/${doc.id}`))}
            render={
              <Button
                variant='ghost'
                size='sm'
                className={cn('group min-w-full justify-between transition-none', isActive && 'bg-accent')}
                style={{ paddingLeft: `${(depth + 1) * 12}px` }}
              >
                <span className='flex items-center gap-1.5 truncate'>
                  {doc.icone ? (
                    <span className='text-sm'>{doc.icone}</span>
                  ) : (
                    <Icon icon={File02Icon} size={14} />
                  )}
                  <Muted className='truncate'>{doc.titulo}</Muted>
                </span>
                <span className='inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent'>
                  <Icon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    className='opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-aria-expanded:rotate-90 group-aria-expanded:opacity-100 text-muted-foreground'
                  />
                </span>
              </Button>
            }
          />
          <CollapsibleContent>
            <div>
              {doc.children.map((child) => renderDocItem(child, depth + 1))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={doc.id}
        variant='ghost'
        size='sm'
        className={cn('w-full justify-start gap-1.5 truncate', isActive && 'bg-accent')}
        style={{ paddingLeft: `${(depth + 1) * 12}px` }}
        onClick={() => router.push(buildPath(`/wiki/${doc.id}`))}
      >
        {doc.icone ? (
          <span className='text-sm'>{doc.icone}</span>
        ) : (
          <Icon icon={File02Icon} size={14} />
        )}
        <span className='truncate'>{doc.titulo}</span>
      </Button>
    );
  };

  const renderSection = (
    name: string,
    label: string,
    path: string,
    docs: DocumentWithChildren[],
    showAddButton = false,
    defaultOpen = false,
  ) => (
    <Collapsible key={name} defaultOpen={defaultOpen}>
      <CollapsibleTrigger
        onClick={() => router.push(buildPath(path))}
        render={
          <Button
            variant='ghost'
            size='sm'
            className='group min-w-full justify-between transition-none'
          >
            <Muted>{label}</Muted>
            <div className='flex items-center gap-0.5'>
              {showAddButton && (
                <span
                  className='inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewDocument();
                  }}
                >
                  <Icon
                    icon={Add01Icon}
                    strokeWidth={2}
                    className='opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-aria-expanded:opacity-100 text-muted-foreground'
                  />
                </span>
              )}
              <span className='inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent'>
                <Icon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className='opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-aria-expanded:rotate-90 group-aria-expanded:opacity-100 text-muted-foreground'
                />
              </span>
            </div>
          </Button>
        }
      />
      <CollapsibleContent>
        <div>
          {docs.map((doc) => renderDocItem(doc))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <>
      <div className='flex flex-col gap-3 pb-3'>
        <div className='flex items-center justify-between gap-4'>
          <Large>Wiki</Large>
          <div>
            <Button
              variant='ghost'
              size='icon-sm'
            >
              <Icon icon={PanelLeftCloseIcon} />
            </Button>
          </div>
        </div>
        <Button
          variant='outline'
          onClick={handleNewDocument}
          disabled={createDocument.isPending}
          className='w-full justify-start text-secondary-foreground/90 hover:text-primary'
        >
          <Icon icon={FileAddIcon} strokeWidth={2} />
          {createDocument.isPending ? 'Criando...' : 'Novo documento'}
        </Button>
      </div>
      <div className='flex flex-col gap-1'>
        <Button
          variant='ghost'
          size='sm'
          className='text-secondary-foreground/90 hover:text-primary w-full justify-start gap-2'
          onClick={() => router.push(buildPath('/wiki/'))}
        >
          <Icon icon={Home03Icon} strokeWidth={2} />
          Início
        </Button>

        {isLoading ? (
          <div className='flex flex-col gap-1 mt-2'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='w-full h-8' />
            ))}
          </div>
        ) : (
          <>
            {renderSection('workspace', 'Espaço de Trabalho', '/wiki/workspace', workspaceDocs, true, true)}
            {renderSection('shared', 'Compartilhados', '/wiki/public', sharedDocs)}
            {renderSection('private', 'Privados', '/wiki/private', privateDocs, true)}
            {renderSection('archived', 'Arquivados', '/wiki/archived', archivedDocs)}
          </>
        )}
      </div>
    </>
  );
}
