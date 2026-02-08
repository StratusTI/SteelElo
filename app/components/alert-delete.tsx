import type { IconSvgElement } from '@hugeicons/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Icon } from './HugeIcons';

interface ModalProps {
  title: string;
  description: string;
  trigger: React.ReactElement;
  icon: IconSvgElement;
}

export function AlertDelete({ title, description, trigger, icon }: ModalProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent className='bg-background p-0 gap-0'>
        <AlertDialogHeader className='bg-muted/20 p-6 flex gap-4'>
          <AlertDialogMedia className='bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'>
            <Icon icon={icon} size={16} />
          </AlertDialogMedia>
          <div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='bg-muted/50 p-3'>
          <AlertDialogCancel variant='outline' size='sm'>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction variant='destructive' size='sm'>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
