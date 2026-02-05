'use client';

import {
  File02Icon,
  HelpCircleIcon,
  MessageMultiple01Icon,
} from '@hugeicons-pro/core-stroke-rounded';
import { Icon } from '@/app/components/HugeIcons';
import { Smaller } from '@/app/components/typography/text/smaller';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function InfoDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='ghost'>
            <Icon icon={HelpCircleIcon} strokeWidth={1.5} />
          </Button>
        }
      />
      <DropdownMenuContent
        className='w-auto y-1 p-1 flex flex-col gap-y-2'
        align='start'
      >
        <DropdownMenuGroup>
          <DropdownMenuItem className='gap-2 h-7'>
            <Icon icon={File02Icon} size={24} />
            <Smaller>Documentação</Smaller>
          </DropdownMenuItem>
          <DropdownMenuItem className='gap-2 h-7'>
            <Icon icon={MessageMultiple01Icon} size={24} />
            <Smaller>Conversar com o suporte</Smaller>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='gap-2 h-7'>
            <Smaller>Atalhos</Smaller>
          </DropdownMenuItem>
          <DropdownMenuItem className='gap-2 h-7'>
            <Smaller>Novidades</Smaller>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className='gap-2 h-7'>
            <Smaller>Version: Latest</Smaller>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
