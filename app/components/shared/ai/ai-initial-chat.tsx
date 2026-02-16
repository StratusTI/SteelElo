'use client';

import {
  AiEditingIcon,
  AiSearch02Icon,
  FullScreenIcon,
  Link04Icon,
  Navigation03Icon,
} from '@hugeicons-pro/core-stroke-rounded';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '../../HugeIcons';
import { Small } from '../../typography/text/small';
import { Smaller } from '../../typography/text/smaller';

export function AIInitialChat() {
  return (
    <div className='flex flex-col gap-1.5 w-full'>
      <div className='flex items-center justify-between w-full gap-2'>
        <div className='flex items-center gap-2'>
          <Small>Ask AI</Small>
          <Badge className='bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 rounded-sm'>
            Beta
          </Badge>
        </div>
        <Link href='/ai'>
          <Icon icon={FullScreenIcon} size={16} />
        </Link>
      </div>
      <form className='flex flex-col rounded-2xl my-auto mt-2 max-w-237.5 mx-auto w-full border border-border h-fit min-h-30 p-3 gap-2.5'>
        <div className='mb-2 w-fit'>
          <DropdownProjectContext />
        </div>

        <Textarea
          placeholder='Como posso te ajudar hoje?'
          className='w-full resize-none overflow-y-auto bg-transparent! border-none focus-visible:border-none focus-visible:ring-0 focus-visible:outline-none'
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
          style={{
            minHeight: '3rem',
            maxHeight: '11.5rem',
          }}
        />

        <div className='flex items-center w-full gap-3 justify-between'>
          <div>
            <DropdownAIOptions />
          </div>

          <div>
            <Button variant='ghost' size='icon-sm'>
              <Icon icon={Link04Icon} />
            </Button>
            <Button
              size='icon-lg'
              className='bg-branding hover:bg-branding/90 text-white'
            >
              <Icon icon={Navigation03Icon} size={32} />
            </Button>
          </div>
        </div>
      </form>
      <Smaller className='w-full pt-2 text-center h-8 text-muted-foreground'>
        Elo AI pode cometer erros; por favor, verifique suas respostas.
      </Smaller>
    </div>
  );
}

function DropdownProjectContext() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='outline'
            size='xs'
            className='p-2 gap-1.5 flex items-center'
          >
            <div className='size-4 bg-branding rounded-md flex items-center justify-center'>
              <Smaller>S</Smaller>
            </div>
            <Smaller>stratus</Smaller>
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          {/* Renderizar todos os projetos */}
          <DropdownMenuLabel>Projetos</DropdownMenuLabel>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownAIOptions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='outline'
            size='sm'
            className='p-2 gap-1.5 items-center'
          >
            <Icon icon={AiEditingIcon} />
            <Smaller>Construir</Smaller>
          </Button>
        }
      />
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Icon icon={AiSearch02Icon} />
            <Smaller>Perguntar</Smaller>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Icon icon={AiEditingIcon} />
            <Smaller>Construir</Smaller>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
