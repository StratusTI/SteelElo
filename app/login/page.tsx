'use client';

import { CancelCircleIcon } from '@hugeicons-pro/core-stroke-rounded';
import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Icon } from '../components/HugeIcons';
import { H4 } from '../components/typography/heading/h4';
import { Muted } from '../components/typography/text/muted';
import { loginAction } from './actions';
import { loginInitialState } from './types';

const emailSchema = z.email('E-mail inválido');

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    loginAction,
    loginInitialState,
  );

  const isEmailValid = emailSchema.safeParse(email).success;

  function handleEmailStep(e: React.FormEvent) {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.issues[0].message);
      return;
    }

    setEmailError(null);
    setStep('password');
  }

  function handleRest() {
    setEmail('');
    setEmailError(null);
    setStep('email');
  }

  const isEmailStep = step === 'email';

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4 pb-12'>
      <div className='w-full flex items-center justify-between'>
        <Image src='logo.svg' alt='elo-logo' width={75} height={10} />
      </div>
      <div className='flex-1 w-full flex flex-col justify-center space-y-6 max-w-90'>
        <div>
          <H4>Trabalhe em todas as dimensões.</H4>
          <H4 className='text-muted-foreground'>Bem-vindo ao Elo.</H4>
        </div>
        <form
          action={formAction}
          onSubmit={isEmailStep ? handleEmailStep : undefined}
          className='w-full space-y-4'
        >
          <Field>
            <FieldLabel>E-mail</FieldLabel>
            {!isEmailStep && <input type='hidden' name='email' value={email} />}
            <ButtonGroup>
              <Input
                name={isEmailStep ? 'email' : undefined}
                type='email'
                placeholder='nome@empresa.com'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                required
                aria-invalid={!!emailError || !!state.fieldErrors?.email}
                autoComplete='off'
                disabled={!isEmailStep || isPending}
                className='shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0'
              />
              {email.length > 1 && (
                <Button variant='outline' onClick={handleRest}>
                  <Icon icon={CancelCircleIcon} />
                </Button>
              )}
            </ButtonGroup>
            {emailError && <FieldError>{emailError}</FieldError>}
          </Field>
          {step === 'password' && (
            <Field>
              <FieldLabel>Senha</FieldLabel>
              <Input
                name='password'
                type='password'
                placeholder='••••••'
                required
                disabled={isPending}
                autoComplete='off'
                autoFocus
                className='shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0'
              />
            </Field>
          )}
          {state.message && <FieldError>{state.message}</FieldError>}

          <Button
            type='submit'
            className='w-full'
            disabled={isEmailStep ? !isEmailValid : isPending}
          >
            {isPending ? 'Entrando...' : 'Continuar'}
          </Button>

          <div className='flex items-center justify-center'>
            <Muted className='text-center text-sm p-4'>
              Ao iniciar sessão, você concorda com os nossos{' '}
              <Link href='' className='text-primary underline'>
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link href='' className='text-primary underline'>
                Política de Privacidade
              </Link>
              .
            </Muted>
          </div>
        </form>
      </div>
      <div>
        <Muted>Join 1,000+ teams building with Elo</Muted>
      </div>
    </div>
  );
}
