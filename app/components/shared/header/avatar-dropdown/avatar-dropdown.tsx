'use client';

import {
  LogoutSquare01Icon,
  Settings01Icon,
  SlidersHorizontalIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import { useState } from 'react';
import { Icon } from '@/app/components/HugeIcons';
import { ModalUserConfigurations } from '@/app/components/shared/company/user/modal-user-configurations';
import { Small } from '@/app/components/typography/text/small';
import { Smaller } from '@/app/components/typography/text/smaller';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/getInitials';
import { getPhoto } from '@/lib/getPhoto';
import type { AvatarDropdownProps } from '../@type/avatar';

type ModalType = 'profile' | 'preferences' | null;

export function AvatarDropdown({ user }: AvatarDropdownProps) {
  const [openModal, setOpenModal] = useState<ModalType>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant='ghost' size='icon'>
              <Avatar size='sm'>
                <AvatarImage src={getPhoto(user.foto)} alt={user.email} />
                <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
              </Avatar>
            </Button>
          }
        />
        <DropdownMenuContent
          className='w-[288px] my-1 p-3 flex flex-col gap-y-3'
          align='end'
        >
          <DropdownMenuGroup className='relative h-29 w-full rounded-xl'>
            <DropdownMenuItem className='p-0 w-full rounded-xl hover:bg-transparent'>
              <img
                className='object-cover h-29 w-full rounded-xl'
                src={'https://app.plane.so/assets/image_1-8ncaj2f5.jpg'}
                alt={user.email}
              />
              <div className='absolute inset-0 bg-background/50 rounded-xl' />
              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                <div className='flex flex-col items-center gap-y-2'>
                  <Avatar size='lg'>
                    <AvatarImage src={getPhoto(user.foto)} alt={user.email} />
                    <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
                  </Avatar>
                  <div className='text-center flex flex-col gap-1'>
                    <Small>{user.nome}</Small>
                    <Smaller>{user.email}</Smaller>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem
              className='gap-2'
              onClick={() => setOpenModal('profile')}
            >
              <Icon icon={Settings01Icon} size={24} />
              <Smaller>Configurações</Smaller>
            </DropdownMenuItem>
            <DropdownMenuItem
              className='gap-2'
              onClick={() => setOpenModal('preferences')}
            >
              <Icon icon={SlidersHorizontalIcon} size={24} />
              <Smaller>Preferências</Smaller>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            <DropdownMenuItem className='gap-2' variant='destructive'>
              <Icon icon={LogoutSquare01Icon} size={24} />
              <Smaller>Sair</Smaller>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <ModalUserConfigurations
        user={user}
        open={openModal !== null}
        onOpenChange={(open) => !open && setOpenModal(null)}
        defaultTab={openModal === 'preferences' ? 'preferences' : 'profile'}
      />
    </>
  );
}
