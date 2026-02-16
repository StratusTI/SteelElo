'use client';

import { Cancel01Icon, WorkIcon } from '@hugeicons-pro/core-stroke-rounded';
import { Icon } from '@/app/components/HugeIcons';
import { Small } from '@/app/components/typography/text/small';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function UserQuickStart() {
  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='flex justify-between items-center'>
        <Small>Seu guia de início rápido</Small>
        <RecuseButton />
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 justify-between items-center gap-4'>
        <Card className='bg-secondary! border-secondary p-4! rounded-xl'>
          <CardHeader className='p-0! gap-2'>
            <div className='size-9 rounded-full bg-card flex items-center justify-center'>
              <Icon icon={WorkIcon} size={20} />
            </div>
            <CardTitle>Criar um projeto</CardTitle>
            <CardDescription>
              Quase tudo começa com um projeto no Elo.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0!'>
            <Button
              variant='link'
              size='sm'
              className='text-branding text-start p-0'
            >
              Criar projeto
            </Button>
          </CardContent>
        </Card>
        <Card className='bg-secondary! border-secondary p-4! rounded-xl'>
          <CardHeader className='p-0! gap-2'>
            <div className='size-9 rounded-full bg-card flex items-center justify-center'>
              <Icon icon={WorkIcon} size={20} />
            </div>
            <CardTitle>Criar um projeto</CardTitle>
            <CardDescription>
              Quase tudo começa com um projeto no Elo.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0!'>
            <Button
              variant='link'
              size='sm'
              className='text-branding text-start p-0'
            >
              Criar projeto
            </Button>
          </CardContent>
        </Card>
        <Card className='bg-secondary! border-secondary p-4! rounded-xl'>
          <CardHeader className='p-0! gap-2'>
            <div className='size-9 rounded-full bg-card flex items-center justify-center'>
              <Icon icon={WorkIcon} size={20} />
            </div>
            <CardTitle>Criar um projeto</CardTitle>
            <CardDescription>
              Quase tudo começa com um projeto no Elo.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0!'>
            <Button
              variant='link'
              size='sm'
              className='text-branding text-start p-0'
            >
              Criar projeto
            </Button>
          </CardContent>
        </Card>
        <Card className='bg-secondary! border-secondary p-4! rounded-xl'>
          <CardHeader className='p-0! gap-2'>
            <div className='size-9 rounded-full bg-card flex items-center justify-center'>
              <Icon icon={WorkIcon} size={20} />
            </div>
            <CardTitle>Criar um projeto</CardTitle>
            <CardDescription>
              Quase tudo começa com um projeto no Elo.
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0!'>
            <Button
              variant='link'
              size='sm'
              className='text-branding text-start p-0'
            >
              Criar projeto
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function RecuseButton() {
  return (
    <Button variant='ghost' size='sm' className='gap-1.5 text-muted-foreground'>
      <Icon icon={Cancel01Icon} />
      Agora não
    </Button>
  );
}
