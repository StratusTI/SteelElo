'use client';

import {
  ArrowDown01Icon,
  ArrowReloadHorizontalIcon,
  GithubIcon,
  Moon02Icon,
  SlackIcon,
  SlidersHorizontalIcon,
  Sun03Icon,
  UserCircleIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@/app/components/HugeIcons';
import { H4 } from '@/app/components/typography/heading/h4';
import { Muted } from '@/app/components/typography/text/muted';
import { P } from '@/app/components/typography/text/p';
import { Small } from '@/app/components/typography/text/small';
import { Smaller } from '@/app/components/typography/text/smaller';
import { type Theme, useTheme } from '@/app/providers/theme-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { getPhoto } from '@/lib/getPhoto';
import type { User } from '@/src/@types/user';
import { getUserFullName } from '@/src/utils/user';

interface UserProps {
  user: User;
  onUserUpdate?: (user: User) => void;
}

type ActiveTab = 'profile' | 'preferences' | 'developer';

interface ModalConfig extends UserProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTab?: ActiveTab;
}

interface ProfileFormData {
  nome: string;
  sobrenome: string;
  username: string;
}

export function ModalUserConfigurations({
  user,
  onUserUpdate,
  children,
  open,
  onOpenChange,
  defaultTab = 'profile',
}: ModalConfig) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(defaultTab);

  // Atualiza a tab quando defaultTab muda (quando o modal abre)
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger>{children}</DialogTrigger>}
      <DialogContent
        className='w-287.5 h-175 gap-0 p-0 flex justify-between rounded-lg overflow-hidden'
        style={{ maxWidth: 'none' }}
      >
        <ModalUserNavigation
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className='flex-1 py-9 px-8 flex flex-col gap-6 bg-muted/20'>
          {activeTab === 'profile' && (
            <ModalUserProfile user={user} onUserUpdate={onUserUpdate} />
          )}
          {activeTab === 'preferences' && <ModalUserPreferences />}
          {activeTab === 'developer' && <ModalUserIntegrations />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ModalUserNavigationProps extends UserProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export function ModalUserNavigation({
  user,
  activeTab,
  onTabChange,
}: ModalUserNavigationProps) {
  return (
    <div className='flex flex-col gap-5 py-4 px-3 border-r border-border bg-muted/50'>
      <div className='flex gap-3'>
        <Image
          src={getPhoto(user.foto)}
          alt={user.username || user.email}
          width={32}
          height={32}
          className='rounded-full'
        />
        <div className='flex flex-col gap-1 items-left'>
          <Small>{getUserFullName(user)}</Small>
          <Smaller>{user.email}</Smaller>
        </div>
      </div>
      <div className='flex flex-col gap-1 w-full'>
        <Smaller className='text-muted-foreground'>Seu Perfil</Smaller>
        <Button
          variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
          className='flex justify-start'
          onClick={() => onTabChange('profile')}
        >
          <Icon icon={UserCircleIcon} />
          <Smaller>Perfil</Smaller>
        </Button>
        <Button
          variant={activeTab === 'preferences' ? 'secondary' : 'ghost'}
          className='flex justify-start'
          onClick={() => onTabChange('preferences')}
        >
          <Icon icon={SlidersHorizontalIcon} />
          <Smaller>Preferências</Smaller>
        </Button>
      </div>
      <div className='flex flex-col gap-1 w-full'>
        <Smaller className='text-muted-foreground'>Plataforma</Smaller>
        <Button
          variant={activeTab === 'developer' ? 'secondary' : 'ghost'}
          className='flex justify-start'
          onClick={() => onTabChange('developer')}
        >
          <Icon icon={ArrowReloadHorizontalIcon} />
          <Smaller>Integrações</Smaller>
        </Button>
      </div>
    </div>
  );
}

const themeLabels: Record<Theme, string> = {
  dark: 'Dark',
  light: 'Light',
};

const themeIcons: Record<Theme, typeof Moon02Icon> = {
  dark: Moon02Icon,
  light: Sun03Icon,
};

export function ModalUserPreferences() {
  const { theme, smoothCursor, setTheme, setSmoothCursor } = useTheme();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleSmoothCursorChange = (checked: boolean) => {
    setSmoothCursor(checked);
  };

  const ThemeIcon = themeIcons[theme];

  return (
    <>
      <div>
        <H4>Preferências</H4>
        <Muted>
          Personalize a sua experiência com o aplicativo de acordo com a sua
          forma de trabalhar.
        </Muted>
      </div>
      <div>
        <form className='flex flex-col gap-8'>
          <div className='flex items-center justify-between w-full'>
            <div>
              <P>Tema</P>
              <Muted>
                Selecione ou personalize o esquema de cores da sua interface.
              </Muted>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant='outline'>
                    <Icon icon={ThemeIcon} />
                    {themeLabels[theme]}
                    <Icon icon={ArrowDown01Icon} />
                  </Button>
                }
              />
              <DropdownMenuContent className='w-41' align='start'>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                    <Icon icon={Moon02Icon} />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                    <Icon icon={Sun03Icon} />
                    Light
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className='flex items-center justify-between w-full'>
            <div>
              <P>Cursor suave</P>
              <Muted>
                Selecione o estilo de movimento do cursor que lhe parecer mais
                adequado.
              </Muted>
            </div>
            <Switch
              id='switch-smooth-cursor'
              size='default'
              checked={smoothCursor}
              onCheckedChange={handleSmoothCursorChange}
            />
          </div>
        </form>
      </div>
    </>
  );
}

interface ModalUserProfileProps {
  user: User;
  onUserUpdate?: (user: User) => void;
}

export function ModalUserProfile({
  user,
  onUserUpdate,
}: ModalUserProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      nome: user.nome,
      sobrenome: user.sobrenome,
      username: user.username || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao atualizar perfil');
      }

      setSuccess(true);
      reset(data);

      if (onUserUpdate && result.data) {
        onUserUpdate({
          ...user,
          nome: result.data.nome,
          sobrenome: result.data.sobrenome,
          username: result.data.username,
        });
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    reset({
      nome: user.nome,
      sobrenome: user.sobrenome,
      username: user.username || '',
    });
    setError(null);
    setSuccess(false);
  };

  return (
    <>
      <div className='flex flex-col gap-6 items-start max-w-50'>
        <Image
          src={getPhoto(user.foto)}
          alt={user.username || user.email}
          width={64}
          height={64}
          className='rounded-lg'
        />
        <div className='flex flex-col gap-1 items-start'>
          <H4>{getUserFullName(user)}</H4>
          <Muted>{user.email}</Muted>
        </div>
      </div>
      <div className='flex-1'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldSet>
            <FieldGroup>
              <div className='grid grid-cols-3 gap-4'>
                <Field>
                  <FieldLabel>
                    Nome <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    placeholder='Insira seu nome'
                    type='text'
                    {...register('nome', {
                      required: true,
                      minLength: 1,
                      maxLength: 100,
                    })}
                  />
                </Field>
                <Field>
                  <FieldLabel>
                    Sobrenome <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    placeholder='Insira seu sobrenome'
                    type='text'
                    {...register('sobrenome', {
                      required: true,
                      minLength: 1,
                      maxLength: 100,
                    })}
                  />
                </Field>
                <Field>
                  <FieldLabel>
                    Username <span className='text-destructive'>*</span>
                  </FieldLabel>
                  <Input
                    placeholder='Insira seu username'
                    type='text'
                    {...register('username', {
                      required: true,
                      minLength: 3,
                      maxLength: 50,
                      pattern: /^[a-zA-Z0-9_]+$/,
                    })}
                  />
                  <Smaller className='text-muted-foreground'>
                    Apenas letras, números e underscore (_)
                  </Smaller>
                </Field>
              </div>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input disabled value={user.email} />
              </Field>

              {error && <div className='text-destructive text-sm'>{error}</div>}

              {success && (
                <div className='text-green-500 text-sm'>
                  Perfil atualizado com sucesso!
                </div>
              )}

              <Field orientation='horizontal'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={handleDiscard}
                  disabled={!isDirty || isLoading}
                >
                  Descartar
                </Button>
                <Button
                  type='submit'
                  size='sm'
                  disabled={!isDirty || isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Salvar mudanças'}
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </form>
      </div>
    </>
  );
}

type IntegrationIcon = typeof GithubIcon | typeof SlackIcon;

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: IntegrationIcon;
}

interface ConnectedIntegration {
  provider: string;
  providerLogin: string | null;
  connectedAt: string;
}

const INTEGRATION_CONFIGS: IntegrationConfig[] = [
  {
    id: 'github',
    name: 'GitHub',
    description:
      'Conecte sua conta do GitHub para sincronizar repositórios e commits.',
    icon: GithubIcon,
  },
  {
    id: 'slack',
    name: 'Slack',
    description:
      'Conecte sua conta do Slack para receber notificações e enviar mensagens automáticas.',
    icon: SlackIcon,
  },
];

export function ModalUserIntegrations() {
  const [connectedIntegrations, setConnectedIntegrations] = useState<
    ConnectedIntegration[]
  >([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/integrations');
      const result = await response.json();

      if (response.ok && result.data?.integrations) {
        setConnectedIntegrations(result.data.integrations);
      }
    } catch (err) {
      console.error('Erro ao buscar integrações:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const isConnected = (providerId: string) => {
    return connectedIntegrations.some((i) => i.provider === providerId);
  };

  const getProviderLogin = (providerId: string) => {
    const integration = connectedIntegrations.find(
      (i) => i.provider === providerId,
    );
    return integration?.providerLogin;
  };

  const handleConnect = (integrationId: string) => {
    setLoadingId(integrationId);
    window.location.href = `/api/integrations/${integrationId}/auth`;
  };

  const handleDisconnect = async (integrationId: string) => {
    setLoadingId(integrationId);
    setError(null);

    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao desconectar');
      }

      setConnectedIntegrations((prev) =>
        prev.filter((i) => i.provider !== integrationId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desconectar');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div>
        <H4>Integrações</H4>
        <Muted>Conecte suas contas para integrar com nossos serviços.</Muted>
      </div>

      {error && <div className='text-destructive text-sm'>{error}</div>}

      <div className='grid grid-cols-2 gap-4'>
        {INTEGRATION_CONFIGS.map((integration) => {
          const connected = isConnected(integration.id);
          const providerLogin = getProviderLogin(integration.id);

          return (
            <Card key={integration.id} className='flex flex-col'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex items-center justify-center size-10 rounded-lg bg-muted'>
                      <Icon icon={integration.icon} />
                    </div>
                    <div>
                      <CardTitle className='text-base'>
                        {integration.name}
                      </CardTitle>
                      {connected && providerLogin && (
                        <Smaller className='text-muted-foreground'>
                          @{providerLogin}
                        </Smaller>
                      )}
                    </div>
                  </div>
                  <Badge variant={connected ? 'default' : 'secondary'}>
                    {isLoading
                      ? '...'
                      : connected
                        ? 'Conectado'
                        : 'Desconectado'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className='flex-1'>
                <CardDescription>{integration.description}</CardDescription>
              </CardContent>

              <CardFooter className='pt-3'>
                {connected ? (
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full'
                    onClick={() => handleDisconnect(integration.id)}
                    disabled={loadingId === integration.id}
                  >
                    {loadingId === integration.id
                      ? 'Desconectando...'
                      : 'Desconectar'}
                  </Button>
                ) : (
                  <Button
                    size='sm'
                    className='w-full'
                    onClick={() => handleConnect(integration.id)}
                    disabled={loadingId === integration.id || isLoading}
                  >
                    {loadingId === integration.id
                      ? 'Redirecionando...'
                      : 'Conectar'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
