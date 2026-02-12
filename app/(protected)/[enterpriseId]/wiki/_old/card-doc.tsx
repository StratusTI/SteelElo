'use client';

import {
  Archive03Icon,
  Copy02Icon,
  File02Icon,
  InformationCircleIcon,
  Link02Icon,
  LinkSquare02Icon,
  SquareLock01Icon,
  StarIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Icon } from '@/app/components/HugeIcons';
import { Smaller } from '@/app/components/typography/text/smaller';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getPhoto } from '@/lib/getPhoto';
import { useMatchesPath } from '@/lib/matchesPath';
import { cn } from '@/lib/utils';
import type { DocumentStatus } from '@/src/@types/document';
import {
  useArchiveDocument,
  useDuplicateDocument,
  useToggleFavorite,
  useUpdateDocument,
} from '@/src/hooks/use-documents';
import { type DocProps, StateIcon } from '../types/doc';

const STATUS_LABEL: Record<DocumentStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
  private: 'Privado',
  archived: 'Arquivado',
};

interface CardProps extends DocProps {
  className?: string;
}

export function CardDoc({
  id,
  emoji,
  title,
  creator,
  state,
  createdAt,
  favourite,
  className,
}: CardProps) {
  const router = useRouter();
  const { buildPath } = useMatchesPath();
  const toggleFavorite = useToggleFavorite();
  const archiveDocument = useArchiveDocument();
  const duplicateDocument = useDuplicateDocument();
  const updateDocument = useUpdateDocument();

  const handleNavigate = () => {
    router.push(buildPath(`/wiki/${id}`));
  };

  const handleOpenNewTab = () => {
    window.open(buildPath(`/wiki/${id}`), '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      window.location.origin + buildPath(`/wiki/${id}`),
    );
    toast.success('Link copiado');
  };

  const handleDuplicate = () => {
    duplicateDocument.mutate(id, {
      onSuccess: () => toast.success('Cópia criada'),
      onError: () => toast.error('Falha ao criar cópia'),
    });
  };

  const handleMakePrivate = () => {
    updateDocument.mutate(
      { documentId: id, data: { status: 'private' } },
      {
        onSuccess: () => toast.success('Documento privado'),
        onError: () => toast.error('Falha ao privar documento'),
      },
    );
  };

  const handleArchive = () => {
    archiveDocument.mutate(id, {
      onSuccess: () => toast.success('Documento arquivado'),
      onError: () => toast.error('Falha ao arquivar documento'),
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate(id, {
      onSuccess: (data) =>
        toast.success(
          data.data.isFavorite
            ? 'Adicionado aos favoritos'
            : 'Removido dos favoritos',
        ),
      onError: () => toast.error('Falha ao favoritar'),
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        onClick={handleNavigate}
        className={cn(
          'w-full px-5 flex flex-col items-start justify-between min-h-13 border-b border-border gap-3 py-4 lg:gap-5 lg:flex-row lg:items-center transition-colors hover:bg-accent cursor-pointer',
          state === 'archived' && 'opacity-60',
          className,
        )}
      >
        <div className='flex items-center gap-3'>
          {/* Deve adicionar um novo div-size a cada nestedChildren */}
          <div className='size-5' />
          {emoji ? (
            <span className='text-base'>{emoji}</span>
          ) : (
            <Icon icon={File02Icon} size={16} />
          )}
          <Smaller className='font-medium'>{title}</Smaller>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-3'>
            {creator?.foto && (
              <Tooltip>
                <TooltipTrigger>
                  <div className='w-4 h-4 rounded-full overflow-hidden border border-border'>
                    <Image
                      src={getPhoto(creator.foto)}
                      alt={creator?.username || 'Unknown'}
                      width={32}
                      height={32}
                      className='object-cover'
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {creator?.username || 'Unknown'}
                </TooltipContent>
              </Tooltip>
            )}

            {state && (
              <Tooltip>
                <TooltipTrigger>
                  <Icon
                    icon={StateIcon[state]}
                    size={16}
                    className='text-muted-foreground'
                  />
                </TooltipTrigger>
                <TooltipContent>{STATUS_LABEL[state] || state}</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div className='border border-border h-4' />

          <div className='flex items-center gap-3'>
            {createdAt && (
              <Tooltip>
                <TooltipTrigger>
                  <Icon
                    icon={InformationCircleIcon}
                    size={16}
                    className='text-muted-foreground'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {new Date(createdAt).toLocaleDateString()}
                </TooltipContent>
              </Tooltip>
            )}

            <Icon
              icon={StarIcon}
              size={16}
              onClick={handleToggleFavorite}
              className={cn(
                'cursor-pointer transition-colors',
                favourite
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-muted-foreground hover:text-yellow-500',
              )}
            />
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent side='bottom' className='p-1 w-48'>
        <ContextMenuGroup>
          <ContextMenuItem className='gap-2' onClick={handleOpenNewTab}>
            <Icon icon={LinkSquare02Icon} size={16} />
            Abrir em nova guia
          </ContextMenuItem>
          <ContextMenuItem className='gap-2' onClick={handleCopyLink}>
            <Icon icon={Link02Icon} size={16} />
            Copiar link
          </ContextMenuItem>
          <ContextMenuItem className='gap-2' onClick={handleDuplicate}>
            <Icon icon={Copy02Icon} size={16} />
            Criar cópia
          </ContextMenuItem>
          <ContextMenuItem className='gap-2' onClick={handleMakePrivate}>
            <Icon icon={SquareLock01Icon} size={16} />
            Privar
          </ContextMenuItem>
          <ContextMenuItem className='gap-2' onClick={handleArchive}>
            <Icon icon={Archive03Icon} size={16} />
            Arquivar
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
