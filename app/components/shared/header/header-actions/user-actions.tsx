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
      <Button variant='ghost' onClick={() => console.log('notification')}>
        <Icon icon={InboxIcon} strokeWidth={2} />
      </Button>
      <InfoDropdown />
      <AvatarDropdown user={user} />
    </div>
  );
}
