'use client';

import {
  AiMagicIcon,
  GithubIcon,
  SlackIcon,
} from '@hugeicons-pro/core-bulk-rounded';
import {
  Add01Icon,
  Analytics01Icon,
  ArrowRight01Icon,
  ComputerUserIcon,
  DashedLineCircleIcon,
  Home03Icon,
  KanbanIcon,
  KeyframesMultipleAddIcon,
  NoteIcon,
  PanelLeftCloseIcon,
  RepeatIcon,
  SlidersHorizontalIcon,
  UserListIcon,
  UserLock02Icon,
  WorkIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useMatchesPath } from '@/lib/matchesPath';
import type { IconSvgObject } from '@/src/@types/icon-svg-object';
import { useProjects } from '@/src/hooks/use-projects';
import { Icon } from '../../HugeIcons';
import { Large } from '../../typography/text/large';
import { Muted } from '../../typography/text/muted';

type PageTreeItem =
  | {
      name: string;
      label: string;
      icon?: IconSvgObject;
      path?: string;
      defaultOpen?: boolean;
    }
  | {
      name: string;
      label: string;
      icon?: IconSvgObject;
      path?: string;
      items: PageTreeItem[];
      defaultOpen?: boolean;
    };

export function SideBarProjects() {
  const router = useRouter();
  const { buildPath, enterpriseId } = useMatchesPath();

  const { data: projectsData } = useProjects({
    enterpriseId: Number(enterpriseId),
    limit: 20,
  });

  const pageTree: PageTreeItem[] = [
    { name: 'home', label: 'Início', path: '/', icon: Home03Icon },
    {
      name: 'your-work',
      label: 'Seu trabalho',
      path: '/projects/your-work',
      icon: UserListIcon,
    },
    {
      name: 'your-projects',
      label: 'Projetos',
      path: '/projects',
      icon: WorkIcon,
    },
    {
      name: 'stickies',
      label: 'Post-its',
      path: '/projects/stickies',
      icon: NoteIcon,
    },

    {
      name: 'workspace',
      label: 'Workspace',
      defaultOpen: true,
      items: [
        {
          name: 'backlog',
          label: 'Backlog',
          path: '/projects/backlog',
          icon: DashedLineCircleIcon,
        },
        {
          name: 'sprints',
          label: 'Ciclos',
          path: '/projects/sprints',
          icon: RepeatIcon,
        },
        {
          name: 'dependencies',
          label: 'Dependências',
          path: '/projects/dependencies',
          icon: UserLock02Icon,
        },
        {
          name: 'analytics',
          label: 'Análises',
          path: '/projects/analytics',
          icon: Analytics01Icon,
        },
        {
          name: 'dashboards',
          label: 'Painéis de controle',
          path: '/projects/dashboards',
          icon: KanbanIcon,
        },
        {
          name: 'daily-standup',
          label: 'Daily Standup',
          path: '/projects/daily-standup',
          icon: ComputerUserIcon,
        },
      ],
    },

    {
      name: 'projects',
      label: 'Projetos',
      icon: Add01Icon,
      defaultOpen: false,
      items: [],
    },

    {
      name: 'integrations',
      label: 'Integrações',
      defaultOpen: true,
      items: [
        {
          name: 'github',
          label: 'Conectar ao GitHub',
          path: '/settings/github',
          icon: GithubIcon,
        },
        {
          name: 'slack',
          label: 'Conectar ao Slack',
          path: '/settings/slack',
          icon: SlackIcon,
        },
        {
          name: 'ai',
          label: 'Testar Elo AI',
          path: 'settings/ai',
          icon: AiMagicIcon,
        },
      ],
    },
  ];

  const projects = projectsData?.data?.projects ?? [];

  const renderItem = (pageItem: PageTreeItem) => {
    // Renderização especial para o collapsible de projetos
    if (pageItem.name === 'projects' && 'items' in pageItem) {
      return (
        <Collapsible key={pageItem.name} defaultOpen={pageItem.defaultOpen}>
          <CollapsibleTrigger
            render={
              <Button
                variant='ghost'
                size='sm'
                className='group min-w-full justify-between transition-none'
              >
                <Muted>{pageItem.label}</Muted>
                <div className='flex items-center gap-0.5'>
                  <span
                    className='inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent'
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(buildPath('/projects/create'));
                    }}
                  >
                    <Icon
                      icon={Add01Icon}
                      strokeWidth={2}
                      className='opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-aria-expanded:opacity-100 text-muted-foreground'
                    />
                  </span>
                  <span className='inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent'>
                    <Icon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      className='opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-aria-expanded:rotate-90 group-aria-expanded:opacity-100 text-muted-foreground'
                    />
                  </span>
                </div>
              </Button>
            }
          />
          <CollapsibleContent>
            <div>
              {projects.map((project) => {
                const iconData = project.icone as
                  | [string, { [key: string]: string | number }][]
                  | undefined;
                const hasValidIcon =
                  iconData && Array.isArray(iconData) && iconData.length > 0;

                return (
                  <Button
                    key={project.id}
                    variant='ghost'
                    size='sm'
                    className='text-secondary-foreground/90 hover:text-primary w-full justify-start gap-2 pl-4'
                    onClick={() =>
                      router.push(buildPath(`/project/${project.id}`))
                    }
                  >
                    {hasValidIcon && <Icon icon={iconData} strokeWidth={2} />}
                    <span className='truncate'>{project.nome}</span>
                  </Button>
                );
              })}
              {projects.length === 0 && (
                <Muted className='pl-4 text-xs'>Nenhum projeto</Muted>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    if ('items' in pageItem) {
      return (
        <Collapsible key={pageItem.name} defaultOpen={pageItem.defaultOpen}>
          <CollapsibleTrigger
            onClick={() =>
              pageItem.path && router.push(buildPath(pageItem.path))
            }
            render={
              <Button
                variant='ghost'
                size='sm'
                className='group min-w-full justify-between transition-none'
              >
                <Muted>{pageItem.label}</Muted>
                <div className='flex items-center gap-0.5'>
                  {pageItem.icon && (
                    <span className='inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent'>
                      <Icon
                        icon={pageItem.icon}
                        strokeWidth={2}
                        className='opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-aria-expanded:opacity-100 text-muted-foreground'
                      />
                    </span>
                  )}
                  <span className='inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent'>
                    <Icon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      className='opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-aria-expanded:rotate-90 group-aria-expanded:opacity-100 text-muted-foreground'
                    />
                  </span>
                </div>
              </Button>
            }
          />
          <CollapsibleContent>
            <div>{pageItem.items.map((child) => renderItem(child))}</div>
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={pageItem.name}
        variant='ghost'
        size='sm'
        className='text-secondary-foreground/90 hover:text-primary w-full justify-start gap-2'
        onClick={() => pageItem.path && router.push(buildPath(pageItem.path))}
      >
        <Icon icon={pageItem.icon ?? []} strokeWidth={2} />
        {pageItem.label}
      </Button>
    );
  };

  return (
    <>
      <div className='flex flex-col gap-3 pb-3'>
        <div className='flex items-center justify-between gap-4'>
          <Large>Projetos</Large>
          <div>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={() => console.log('notification')}
            >
              <Icon icon={SlidersHorizontalIcon} />
            </Button>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={() => console.log('notification')}
            >
              <Icon icon={PanelLeftCloseIcon} />
            </Button>
          </div>
        </div>
        <Button
          variant='outline'
          onClick={() => console.log('notification')}
          className='w-full justify-start text-secondary-foreground/90 hover:text-primary'
        >
          <Icon
            icon={KeyframesMultipleAddIcon}
            strokeWidth={2}
            className='rotate-218'
          />{' '}
          Novo item de trabalho
        </Button>
      </div>
      <div className='flex flex-col gap-1'>
        {pageTree.map((item) => renderItem(item))}
      </div>
    </>
  );
}
