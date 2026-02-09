'use client';

import { useState } from 'react';
import {
  AddStickies,
  StickyNote,
} from '@/app/components/shared/company/user/stickies';
import { Small } from '@/app/components/typography/text/small';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useStickies } from '@/src/hooks/use-stickies';

export function UserStickies() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error } = useStickies(searchTerm || undefined);

  const stickies = data?.data?.stickies || [];
  const displayStickies = stickies.slice(0, 6);

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='flex justify-between items-center'>
        <Small>Seus post-its</Small>

        <div className='gap-1 flex items-center'>
          <Input
            className='h-8'
            placeholder='Pesquisar por conteúdo'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddStickies variant='link' />
        </div>
      </div>

      {isLoading ? (
        <div className='flex flex-wrap gap-4 w-full'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='w-58 h-81.25 rounded-sm' />
          ))}
        </div>
      ) : error ? (
        <div className='text-destructive text-sm'>
          Falha ao carregar post-its
        </div>
      ) : displayStickies.length === 0 ? (
        <div className='text-muted-foreground text-sm py-8 text-center'>
          {searchTerm
            ? 'Nenhum post-it encontrado'
            : 'Você ainda não tem post-its'}
        </div>
      ) : (
        <div className='flex flex-wrap gap-4 w-full'>
          {displayStickies.map((sticky) => (
            <StickyNote key={sticky.id} sticky={sticky} />
          ))}
        </div>
      )}
    </div>
  );
}
