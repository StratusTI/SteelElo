'use client'

import {
  Archive03Icon,
  Copy02Icon,
  Download01Icon,
  FolderImportIcon,
  InternetIcon,
  Link02Icon,
  MoreVerticalIcon,
  StarIcon,
  Task01Icon,
  TransactionHistoryIcon
} from '@hugeicons-pro/core-stroke-rounded';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/app/components/HugeIcons';
import { Small } from '@/app/components/typography/text/small';
import { Smaller } from '@/app/components/typography/text/smaller';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useMatchesPath } from '@/lib/matchesPath';
import { cn } from '@/lib/utils';
import type { DocumentStatus } from '@/src/@types/document';
import {
  useArchiveDocument,
  useDuplicateDocument,
  useMoveDocument,
  usePublishDocument,
  useToggleFavorite,
  useUpdateDocument,
} from '@/src/hooks/use-documents';
import { useProjects } from '@/src/hooks/use-projects';

interface DocActionsProps {
  documentId: number;
  isFavorite: boolean;
  isFullWidth: boolean;
  publicShareToken: string | null;
  status: DocumentStatus;
  content?: string;
  title?: string;
}

export function DocActions({
  documentId,
  isFavorite,
  isFullWidth,
  publicShareToken,
  status,
  content,
  title,
}: DocActionsProps) {
  const router = useRouter();
  const { buildPath } = useMatchesPath();
  const toggleFavorite = useToggleFavorite();
  const archiveDocument = useArchiveDocument();
  const duplicateDocument = useDuplicateDocument();
  const updateDocument = useUpdateDocument();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado');
  };

  const handleToggleFavorite = () => {
    toggleFavorite.mutate(documentId, {
      onSuccess: (data) =>
        toast.success(
          data.data.isFavorite
            ? 'Adicionado aos favoritos'
            : 'Removido dos favoritos',
        ),
      onError: () => toast.error('Falha ao favoritar'),
    });
  };

  const handleToggleFullWidth = () => {
    updateDocument.mutate(
      { documentId, data: { isFullWidth: !isFullWidth } },
      {
        onError: () => toast.error('Falha ao alterar largura'),
      },
    );
  };

  const handleCopyMarkdown = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      toast.success('Markdown copiado');
    } else {
      toast.info('Documento sem conteúdo');
    }
  };

  const handleDuplicate = () => {
    duplicateDocument.mutate(documentId, {
      onSuccess: (data) => {
        toast.success('Cópia criada');
        router.push(buildPath(`/wiki/${data.data.document.id}`));
      },
      onError: () => toast.error('Falha ao criar cópia'),
    });
  };

  const handleArchive = () => {
    if (status === 'archived') {
      updateDocument.mutate(
        { documentId, data: { status: 'draft' } },
        {
          onSuccess: () => {
            toast.success('Documento desarquivado');
            router.push(buildPath('/wiki/workspace'));
          },
          onError: () => toast.error('Falha ao desarquivar documento'),
        },
      );
    } else {
      archiveDocument.mutate(documentId, {
        onSuccess: () => {
          toast.success('Documento arquivado');
          router.push(buildPath('/wiki/archived'));
        },
        onError: () => toast.error('Falha ao arquivar documento'),
      });
    }
  };

  return (
    <div className='flex gap-1'>
      <PublishDocument documentId={documentId} status={status} publicShareToken={publicShareToken} />
      <MoveDocumentForOtherProject documentId={documentId} />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon-sm" onClick={handleCopyLink}>
              <Icon icon={Link02Icon} size={20} />
            </Button>
          }
        />
        <TooltipContent>
          Copiar link
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="ghost" size="icon-sm" onClick={handleToggleFavorite}>
              <Icon
                icon={StarIcon}
                size={20}
                className={cn(
                  isFavorite && 'text-yellow-500 fill-yellow-500'
                )}
              />
            </Button>
          }
        />
        <TooltipContent>
          {isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
        </TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant='ghost' size='icon-sm'>
              <Icon icon={MoreVerticalIcon} size={16} />
            </Button>
          }
        />
        <DropdownMenuContent className='w-50 p-2.5' align='end'>
          <DropdownMenuGroup className='flex flex-col gap-1.5'>
            <Field orientation="horizontal" className="focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-sm px-2 py-1.5 text-sm [&_svg:not([class*='size-'])]:size-4 group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0">
              <FieldLabel htmlFor="switch-size-sm" className='text-xs leading-none font-medium text-primary' >Largura total</FieldLabel>
              <Switch
                id="switch-size-sm"
                size='sm'
                checked={isFullWidth}
                onCheckedChange={handleToggleFullWidth}
              />
            </Field>
            <DropdownMenuItem onClick={handleCopyMarkdown}>
              <Icon icon={Task01Icon} size={16} />
              <Smaller>Copiar markdown</Smaller>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon icon={TransactionHistoryIcon} size={16} />
              <Smaller>Histórico</Smaller>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <Icon icon={Copy02Icon} size={16} />
              <Smaller>Criar cópia</Smaller>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleArchive}>
              <Icon icon={Archive03Icon} size={16} />
              <Smaller>{status === 'archived' ? 'Desarquivar' : 'Arquivar'}</Smaller>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExportDocument content={content} title={title} />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function PublishDocument({
  documentId,
  status,
  publicShareToken,
}: {
  documentId: number;
  status: DocumentStatus;
  publicShareToken: string | null;
}) {
  const publishDocument = usePublishDocument();
  const updateDocument = useUpdateDocument();

  const handlePublish = () => {
    publishDocument.mutate(documentId, {
      onSuccess: () => toast.success('Documento publicado com sucesso'),
      onError: () => toast.error('Falha ao publicar documento'),
    });
  };

  const handleUnpublish = () => {
    updateDocument.mutate(
      { documentId, data: { status: 'draft' } },
      {
        onSuccess: () => toast.success('Documento despublicado'),
        onError: () => toast.error('Falha ao despublicar documento'),
      },
    );
  };

  const handleCopyPublicLink = () => {
    if (publicShareToken) {
      const url = `${window.location.origin}/public/${publicShareToken}`;
      navigator.clipboard.writeText(url);
      toast.success('Link público copiado');
    }
  };

  if (status === 'archived') {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button variant="outline" size="sm" disabled>
              Publicar
            </Button>
          }
        />
        <TooltipContent>
          Desarquive primeiro
        </TooltipContent>
      </Tooltip>
    );
  }

  if (status === 'published') {
    return (
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="outline" size="sm">
              Publicado
            </Button>
          }
        />
        <AlertDialogContent className='bg-background p-0 gap-0'>
          <AlertDialogHeader className='bg-muted/20 p-6 flex gap-4'>
            <div>
              <AlertDialogTitle>Documento publicado</AlertDialogTitle>
              <AlertDialogDescription>Este documento está publicado e acessível por link público.</AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          {publicShareToken && (
            <div className='p-6 flex items-center gap-2'>
              <code className='flex-1 text-xs bg-muted rounded px-3 py-2 truncate'>
                {`${typeof window !== 'undefined' ? window.location.origin : ''}/public/${publicShareToken}`}
              </code>
              <Button variant='outline' size='sm' onClick={handleCopyPublicLink}>
                <Icon icon={Link02Icon} size={14} />
                Copiar
              </Button>
            </div>
          )}
          <AlertDialogFooter className='bg-muted/50 p-3 justify-between sm:justify-between'>
            <div className='flex gap-1 items-center'>
              <Icon icon={InternetIcon} size={14} />
              <Smaller>
                Qualquer pessoa com o link pode acessar.
              </Smaller>
            </div>
            <div className='flex gap-2 items-center'>
              <AlertDialogCancel variant='outline' size='sm'>
                Fechar
              </AlertDialogCancel>
              <AlertDialogAction
                size='sm'
                variant='destructive'
                onClick={handleUnpublish}
                disabled={updateDocument.isPending}
              >
                {updateDocument.isPending ? 'Despublicando...' : 'Despublicar'}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm">
            Publicar
          </Button>
        }
      />
      <AlertDialogContent className='bg-background p-0 gap-0'>
        <AlertDialogHeader className='bg-muted/20 p-6 flex gap-4'>
          <div>
            <AlertDialogTitle>Publicar documento</AlertDialogTitle>
            <AlertDialogDescription>Gerar URL pública para compartilhar está página.</AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='bg-muted/50 p-3 justify-between sm:justify-between'>
          <div className='flex gap-1 items-center'>
            <Icon icon={InternetIcon} size={14} />
            <Smaller>
              Qualquer pessoa com o link pode acessar.
            </Smaller>
           </div>
          <div className='flex gap-2 items-center'>
            <AlertDialogCancel variant='outline' size='sm'>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction size='sm' onClick={handlePublish} disabled={publishDocument.isPending}>
              {publishDocument.isPending ? 'Publicando...' : 'Publicar'}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function MoveDocumentForOtherProject({ documentId }: { documentId: number }) {
  const [open, setOpen] = useState(false);
  const { enterpriseId } = useMatchesPath();
  const { data: projectsData, isLoading } = useProjects({
    enterpriseId: Number(enterpriseId),
    enabled: open,
  });
  const moveDocument = useMoveDocument();

  const projects = projectsData?.data?.projects ?? [];

  const handleSelectProject = (projetoId: number) => {
    moveDocument.mutate(
      { documentId, parentId: null, projetoId },
      {
        onSuccess: () => {
          toast.success('Documento movido para o projeto');
          setOpen(false);
        },
        onError: () => toast.error('Falha ao mover documento'),
      },
    );
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(true)}
            >
              <Icon icon={FolderImportIcon} size={20} />
            </Button>
          }
        />
        <TooltipContent>
          Mover página
        </TooltipContent>
      </Tooltip>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Procure por projetos..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? 'Carregando projetos...' : 'Nenhum projeto encontrado.'}
            </CommandEmpty>
            <CommandGroup heading="PROJETOS">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  onSelect={() => handleSelectProject(project.id)}
                  disabled={moveDocument.isPending}
                >
                  <Icon icon={FolderImportIcon} size={20} />
                  {project.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

function ExportDocument({ content, title }: { content?: string; title?: string }) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState('pdf');
  const [contentFilter, setContentFilter] = useState('all');
  const [pageFormat, setPageFormat] = useState('a4');

  const handleFormatChange = (value: string | null) => { if (value) setFormat(value); };
  const handleContentFilterChange = (value: string | null) => { if (value) setContentFilter(value); };
  const handlePageFormatChange = (value: string | null) => { if (value) setPageFormat(value); };
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const exportFormat = [
    { label: "PDF", value: "pdf" },
    { label: "Markdown", value: "md" },
  ];

  const includeContent = [
    { label: "Tudo", value: "all" },
    { label: "Sem imagens", value: "no-images" },
  ];

  const formatPage = [
    { label: "A4", value: "a4" },
    { label: "A3", value: "a3" },
    { label: "A2", value: "a2" },
    { label: "Carta", value: "letter" },
    { label: "Jurídico", value: "legal" },
    { label: "Tablóide", value: "tabloid" },
  ];

  const pageSizeMap: Record<string, string> = {
    a4: 'A4',
    a3: 'A3',
    a2: 'A2',
    letter: 'letter',
    legal: 'legal',
    tabloid: 'ledger',
  };

  const handleExport = () => {
    let exportContent = content ?? '';

    if (contentFilter === 'no-images') {
      exportContent = exportContent.replace(/!\[.*?\]\(.*?\)/g, '');
    }

    if (format === 'md') {
      const blob = new Blob([exportContent], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'documento'}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Markdown exportado');
      setOpen(false);
    } else {
      const size = pageSizeMap[pageFormat] || 'A4';
      const style = document.createElement('style');
      style.textContent = `@page { size: ${size}; margin: 2cm; }`;
      document.head.appendChild(style);
      styleRef.current = style;

      window.print();

      setTimeout(() => {
        if (styleRef.current) {
          document.head.removeChild(styleRef.current);
          styleRef.current = null;
        }
      }, 1000);

      setOpen(false);
    }
  };

  return (
    <>
      <div
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen(true)
        }}
        className='flex items-center gap-2'
      >
        <Icon icon={Download01Icon} size={16} />
        <Smaller>Exportar</Smaller>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className='bg-background p-0 gap-0'>
          <AlertDialogHeader className='p-6 pb-0 flex gap-4'>
            <AlertDialogTitle>Exportar documento</AlertDialogTitle>
          </AlertDialogHeader>
          <div className='p-6'>
            <form className='space-y-4'>
              <Field className='w-full flex flex-row items-center justify-between'>
                <FieldLabel htmlFor="export-format" className='flex-1'>
                  <Small className='text-muted-foreground'>
                    Formato de exportação
                  </Small>
                </FieldLabel>
                <Select value={format} onValueChange={handleFormatChange}>
                  <SelectTrigger id="export-format" className='w-auto! bg-transparent! border-none! min-w-8'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align='end' className='w-auto!'>
                    <SelectGroup>
                      {exportFormat.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field className='w-full flex flex-row items-center justify-between'>
                <FieldLabel htmlFor="include-content" className='flex-1'>
                  <Small className='text-muted-foreground'>
                    Incluir conteúdo
                  </Small>
                </FieldLabel>
                <Select value={contentFilter} onValueChange={handleContentFilterChange}>
                  <SelectTrigger id="include-content" className='w-auto! bg-transparent! border-none! min-w-8'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align='end' className='w-auto!'>
                    <SelectGroup>
                      {includeContent.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              {format === 'pdf' && (
                <Field className='w-full flex flex-row items-center justify-between'>
                  <FieldLabel htmlFor="page-format" className='flex-1'>
                    <Small className='text-muted-foreground'>
                      Formato da página
                    </Small>
                  </FieldLabel>
                  <Select value={pageFormat} onValueChange={handlePageFormatChange}>
                    <SelectTrigger id="page-format" className='w-auto! bg-transparent! border-none! min-w-8'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align='end' className='w-auto!'>
                      <SelectGroup>
                        {formatPage.map((page) => (
                          <SelectItem key={page.value} value={page.value}>
                            {page.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form>
          </div>
          <AlertDialogFooter className='bg-muted/50 p-3'>
            <AlertDialogCancel variant='outline' size='sm'>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction size='sm' onClick={handleExport}>
              Exportar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
