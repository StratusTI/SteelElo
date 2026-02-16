'use client';

import {
  File02Icon,
  HelpCircleIcon,
  MessageMultiple01Icon,
} from '@hugeicons-pro/core-stroke-rounded';
import { Icon } from '@/app/components/HugeIcons';
import { A } from '@/app/components/typography/text/a';
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
          <Button variant='ghost' size='icon-sm'>
            <Icon icon={HelpCircleIcon} strokeWidth={2} />
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
            <A
              className='text-xs leading-none font-medium text-primary'
              href={
                'https://api.whatsapp.com/send/?phone=5511918930104&text=Ol%C3%A1%21+Preciso+de+suporte%2C+por+favor.&type=phone_number&app_absent=0'
              }
            >
              Documentação
            </A>
          </DropdownMenuItem>
          <DropdownMenuItem className='gap-2 h-7'>
            <Icon icon={MessageMultiple01Icon} size={24} />
            <A
              className='text-xs leading-none font-medium text-primary'
              href={
                'https://api.whatsapp.com/send/?phone=5511918930104&text=Ol%C3%A1%21+Preciso+de+suporte%2C+por+favor.&type=phone_number&app_absent=0'
              }
            >
              Conversar com o suporte
            </A>
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
