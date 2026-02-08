'use client';

import { MoreVerticalIcon } from '@hugeicons-pro/core-solid-rounded';
import {
  Add01Icon,
  ChromeIcon,
  Delete02Icon,
  Edit03Icon,
  Link02Icon,
  LinkSquare02Icon,
  Loading03Icon,
} from '@hugeicons-pro/core-stroke-rounded';
import { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/app/components/HugeIcons';
import { Small } from '@/app/components/typography/text/small';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type QuickLink,
  useCreateQuickLink,
  useDeleteQuickLink,
  useQuickLinks,
  useUpdateQuickLink,
} from '@/src/hooks/use-quick-links';

export function UserQuickLinks() {
  const { data, isLoading } = useQuickLinks();
  const quickLinks = data?.data?.quickLinks ?? [];

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='flex justify-between items-center'>
        <Small>Links rápidos</Small>
        <AddQuickLinkDialog />
      </div>
      <div className='flex flex-wrap gap-4 flex-1 h-auto'>
        {isLoading ? (
          <>
            <Skeleton className='h-14 w-48 rounded-md' />
            <Skeleton className='h-14 w-48 rounded-md' />
          </>
        ) : quickLinks.length === 0 ? (
          <p className='text-muted-foreground text-sm'>
            Nenhum link rápido adicionado
          </p>
        ) : (
          quickLinks.map((link) => <LinkItem key={link.id} quickLink={link} />)
        )}
      </div>
    </div>
  );
}

interface LinkItemProps {
  quickLink: QuickLink;
}

function LinkItem({ quickLink }: LinkItemProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleClick = () => {
    window.open(quickLink.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div
        onClick={handleClick}
        className='flex items-center rounded-md gap-4 group border border-border p-4 bg-card px-4 h-14 text-primary cursor-pointer hover:text-primary'
      >
        <Button
          variant='secondary'
          size='icon'
          className='size-8 rounded-sm p-2 flex items-center justify-center pointer-events-none'
        >
          <Icon icon={ChromeIcon} />
        </Button>
        <div className='flex flex-1 truncate'>
          {quickLink.titulo || quickLink.url}
        </div>
        <LinkFunctionsDropdown
          quickLink={quickLink}
          onEdit={() => setEditDialogOpen(true)}
          onDelete={() => setDeleteDialogOpen(true)}
        />
      </div>

      <EditQuickLinkDialog
        quickLink={quickLink}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <DeleteQuickLinkDialog
        quickLink={quickLink}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}

function AddQuickLinkDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [titulo, setTitulo] = useState('');
  const createMutation = useCreateQuickLink();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        url,
        titulo: titulo || undefined,
      });
      toast.success('Link rápido adicionado');
      setUrl('');
      setTitulo('');
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao adicionar link',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant='link' className='text-branding gap-1.5'>
            <Icon icon={Add01Icon} />
            Adicione um link rápido
          </Button>
        }
      />
      <DialogContent
        className='w-187.5 bg-muted py-9 px-8 gap-6'
        style={{ maxWidth: 'none' }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar link rápido</DialogTitle>
          </DialogHeader>
          <FieldGroup className='mt-6'>
            <Field>
              <FieldLabel htmlFor='url'>
                URL <span className='text-destructive'>*</span>
              </FieldLabel>
              <Input
                id='url'
                name='url'
                type='url'
                required
                placeholder='Digite ou cole uma URL'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={createMutation.isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='titulo'>Título de exibição</FieldLabel>
              <Input
                id='titulo'
                name='titulo'
                placeholder='Como você gostaria que esse link fosse chamado?'
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={createMutation.isPending}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className='mt-6'>
            <DialogClose
              render={
                <Button
                  size='sm'
                  type='button'
                  variant='outline'
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
              }
            />
            <Button
              size='sm'
              type='submit'
              className='bg-branding text-white hover:bg-branding/90'
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Icon icon={Loading03Icon} className='animate-spin mr-2' />
                  Adicionando...
                </>
              ) : (
                'Adicionar link rápido'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditQuickLinkDialogProps {
  quickLink: QuickLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function EditQuickLinkDialog({
  quickLink,
  open,
  onOpenChange,
}: EditQuickLinkDialogProps) {
  const [url, setUrl] = useState(quickLink.url);
  const [titulo, setTitulo] = useState(quickLink.titulo || '');
  const updateMutation = useUpdateQuickLink();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        quickLinkId: quickLink.id,
        data: {
          url,
          titulo: titulo || undefined,
        },
      });
      toast.success('Link rápido atualizado');
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao atualizar link',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='w-187.5 bg-muted py-9 px-8 gap-6'
        style={{ maxWidth: 'none' }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar link rápido</DialogTitle>
          </DialogHeader>
          <FieldGroup className='mt-6'>
            <Field>
              <FieldLabel htmlFor='edit-url'>
                URL <span className='text-destructive'>*</span>
              </FieldLabel>
              <Input
                id='edit-url'
                name='url'
                type='url'
                required
                placeholder='Digite ou cole uma URL'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor='edit-titulo'>Título de exibição</FieldLabel>
              <Input
                id='edit-titulo'
                name='titulo'
                placeholder='Como você gostaria que esse link fosse chamado?'
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className='mt-6'>
            <DialogClose
              render={
                <Button
                  size='sm'
                  type='button'
                  variant='outline'
                  disabled={updateMutation.isPending}
                >
                  Cancelar
                </Button>
              }
            />
            <Button
              size='sm'
              type='submit'
              className='bg-branding text-white hover:bg-branding/90'
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Icon icon={Loading03Icon} className='animate-spin mr-2' />
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteQuickLinkDialogProps {
  quickLink: QuickLink;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteQuickLinkDialog({
  quickLink,
  open,
  onOpenChange,
}: DeleteQuickLinkDialogProps) {
  const deleteMutation = useDeleteQuickLink();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(quickLink.id);
      toast.success('Link rápido excluído');
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir link',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-100 bg-muted py-9 px-8 gap-6'>
        <DialogHeader>
          <DialogTitle>Excluir link rápido</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o link &quot;
            {quickLink.titulo || quickLink.url}&quot;? Esta ação não pode ser
            desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                size='sm'
                type='button'
                variant='outline'
                disabled={deleteMutation.isPending}
              >
                Cancelar
              </Button>
            }
          />
          <Button
            size='sm'
            variant='destructive'
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Icon icon={Loading03Icon} className='animate-spin mr-2' />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface LinkFunctionsDropdownProps {
  quickLink: QuickLink;
  onEdit: () => void;
  onDelete: () => void;
}

function LinkFunctionsDropdown({
  quickLink,
  onEdit,
  onDelete,
}: LinkFunctionsDropdownProps) {
  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(quickLink.url);
      toast.success('Link copiado para a área de transferência');
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const handleOpenNewTab = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(quickLink.url, '_blank', 'noopener,noreferrer');
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Icon icon={MoreVerticalIcon} />
          </Button>
        }
      />
      <DropdownMenuContent className='w-50'>
        <DropdownMenuItem className='w-full flex text-xs' onClick={handleEdit}>
          <Icon icon={Edit03Icon} />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem
          className='w-full flex text-xs'
          onClick={handleOpenNewTab}
        >
          <Icon icon={LinkSquare02Icon} />
          Abrir em nova guia
        </DropdownMenuItem>
        <DropdownMenuItem
          className='w-full flex text-xs'
          onClick={handleCopyLink}
        >
          <Icon icon={Link02Icon} />
          Copiar link
        </DropdownMenuItem>
        <DropdownMenuItem
          className='w-full flex text-xs text-destructive'
          onClick={handleDelete}
        >
          <Icon icon={Delete02Icon} />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
