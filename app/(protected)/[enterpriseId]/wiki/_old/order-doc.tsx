'use client';

import {
  ArrangeByLettersAZIcon,
  ArrangeByLettersZAIcon,
} from '@hugeicons-pro/core-solid-rounded';
import { useState } from 'react';
import { Icon } from '@/app/components/HugeIcons';
import { Smaller } from '@/app/components/typography/text/smaller';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OrderDocProps {
  onSort?: (field: string, order: string) => void;
}

export function OrderDoc({ onSort }: OrderDocProps) {
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortField, setSortField] = useState('name');

  const handleFieldChange = (field: string) => {
    setSortField(field);
    onSort?.(field, sortOrder);
  };

  const handleOrderChange = (order: string) => {
    setSortOrder(order);
    onSort?.(sortField, order);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='outline' size='sm'>
            {sortOrder === 'asc' ? (
              <Icon icon={ArrangeByLettersAZIcon} size={16} />
            ) : (
              <Icon icon={ArrangeByLettersZAIcon} size={16} />
            )}
            {sortField === 'name'
              ? 'Nome'
              : sortField === 'date-created'
                ? 'Data de criação'
                : 'Data de modificação'}
          </Button>
        }
      />
      <DropdownMenuContent className='min-w-45' align='end'>
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={sortField}>
            <DropdownMenuRadioItem
              value='name'
              onClick={() => handleFieldChange('name')}
            >
              <Smaller className='text-muted-foreground'>Nome</Smaller>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value='date-created'
              onClick={() => handleFieldChange('date-created')}
            >
              <Smaller className='text-muted-foreground'>
                Data de criação
              </Smaller>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value='date-updated'
              onClick={() => handleFieldChange('date-updated')}
            >
              <Smaller className='text-muted-foreground'>
                Data de modificação
              </Smaller>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuRadioGroup value={sortOrder}>
            <DropdownMenuRadioItem
              value='asc'
              onClick={() => handleOrderChange('asc')}
            >
              <Smaller className='text-muted-foreground'>Crescente</Smaller>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value='desc'
              onClick={() => handleOrderChange('desc')}
            >
              <Smaller className='text-muted-foreground'>Decrescente</Smaller>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
