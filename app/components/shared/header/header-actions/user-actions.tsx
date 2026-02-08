'use client';

import { InboxIcon } from '@hugeicons-pro/core-stroke-rounded';
import { Icon } from '@/app/components/HugeIcons';
import { Button } from '@/components/ui/button';
import type { User } from '@/src/@types/user';
import { AvatarDropdown } from '../avatar-dropdown/avatar-dropdown';
import { InfoDropdown } from '../avatar-dropdown/info-dropdown';

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  return (
    <div className='flex items-center gap-0.5'>
      <Button variant='outline' size='sm' onClick={() => console.log('start')}>
        Comece agora
      </Button>
      <Button
        variant='ghost'
        size='icon-sm'
        onClick={() => console.log('notification')}
      >
        <Icon icon={InboxIcon} strokeWidth={2} />
      </Button>
      <InfoDropdown />
      <AvatarDropdown user={user} />
    </div>
  );
}
