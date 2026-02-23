'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { H4 } from '../_components/typography/heading/h4'
import { Muted } from '../_components/typography/text/muted'
import { type LoginState, loginAction } from './actions'

const initialState: LoginState = {
  error: null,
  fieldErrors: {},
}

export default function Login() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  )

  return (
    <div className='min-h-screen flex flex-col items-center justiyf-center p-4 pb-12'>
      <div className='w-full flex items-center justify-between'>
        <Link href='/'>
          <Image src='logo.svg' alt='elo-logo' width={75} height={10} />
        </Link>
      </div>
      <div className='flex-1 w-full flex flex-col justify-center space-y-6 max-w-90'>
        <div>
          <H4>Trabalhe em todas as dimensões.</H4>
          <H4 className='text-muted-foreground'>Bem-vindo ao Elo.</H4>
        </div>
        <form action={formAction} className='w-full space-y-4'>
          {state.error && (
            <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
              {state.error}
            </div>
          )}
          <Field data-invalid={!!state.fieldErrors.email || undefined}>
            <FieldLabel>E-mail</FieldLabel>
            <Input
              name='email'
              type='email'
              placeholder='nome@empresa.com'
              disabled={isPending}
            />
            {state.fieldErrors.email && (
              <FieldError>{state.fieldErrors.email}</FieldError>
            )}
          </Field>
          <Field data-invalid={!!state.fieldErrors.password || undefined}>
            <FieldLabel>Senha</FieldLabel>
            <Input
              name='password'
              type='password'
              placeholder='••••••'
              disabled={isPending}
            />
            {state.fieldErrors.password && (
              <FieldError>{state.fieldErrors.password}</FieldError>
            )}
          </Field>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? 'Entrando...' : 'Continuar'}
          </Button>

          <div className='flex items-center justify-center'>
            <Muted className='text-center text-sm p-4'>
              Ao iniciar a sessão, você concorda com nossos{' '}
              <Link href='#' className='text-primary hover:underline'>
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link href='#' className='text-primary hover:underline'>
                Política de Privacidade
              </Link>{' '}
              .
            </Muted>
          </div>
        </form>
      </div>
      <div>
        <Muted>Junte-se a mais de 1.000 times no Elo</Muted>
      </div>
    </div>
  )
}
