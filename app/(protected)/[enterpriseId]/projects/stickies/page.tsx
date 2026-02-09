'use client';

import { NoteIcon } from '@hugeicons-pro/core-stroke-rounded';
import { useState } from 'react';
import {
  AddStickies,
  StickyNote,
} from '@/app/components/shared/company/user/stickies';
import { BreadCrumb, NavBar } from '@/app/components/shared/navigation/navBar';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type { BreadCrumbItem } from '@/lib/@types/breadcrumb';
import { useStickies } from '@/src/hooks/use-stickies';

const breadCrumbTree: BreadCrumbItem[] = [
  {
    name: 'Post-its',
    icon: NoteIcon,
  },
];

export function StickiesHeaderActions() {
  return <StickiesSearch />;
}

function StickiesSearch() {
  return null;
}

export default function StickiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error } = useStickies(searchTerm || undefined);

  const stickies = data?.data?.stickies || [];

  return (
    <div className='h-full w-full flex flex-col'>
      <NavBar>
        <BreadCrumb items={breadCrumbTree} />
        <div className='gap-2 flex items-center justify-end'>
          <Input
            className='h-8 max-w-xs'
            placeholder='Pesquisar por conteúdo'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddStickies variant='default' />
        </div>
      </NavBar>
      <div className='flex-1 w-full overflow-x-hidden overflow-y-auto'>
        <div className='w-full flex flex-col gap-5 p-5'>
          {isLoading ? (
            <div className='flex flex-wrap gap-4 w-full'>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className='w-58 h-81.25 rounded-sm' />
              ))}
            </div>
          ) : error ? (
            <div className='text-destructive text-sm py-8 text-center'>
              Falha ao carregar post-its
            </div>
          ) : stickies.length === 0 ? (
            <div className='text-muted-foreground text-sm py-8 text-center'>
              {searchTerm
                ? 'Nenhum post-it encontrado'
                : 'Você ainda não tem post-its. Clique em "Adicionar post-it" para criar o primeiro.'}
            </div>
          ) : (
            <div className='flex flex-wrap gap-4 w-full'>
              {stickies.map((sticky) => (
                <StickyNote key={sticky.id} sticky={sticky} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
