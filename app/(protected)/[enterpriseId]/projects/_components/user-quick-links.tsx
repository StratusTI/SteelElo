'use client';

import {
  AddQuickLinkDialog,
  LinkItem,
} from '@/app/components/shared/company/user/quick-link';
import { Small } from '@/app/components/typography/text/small';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuickLinks } from '@/src/hooks/use-quick-links';

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
