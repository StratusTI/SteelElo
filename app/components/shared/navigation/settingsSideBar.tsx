'use client'

import {
  DashedLineCircleIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useMatchesPath } from '@/lib/matchesPath';
import type { IconSvgObject } from '@/src/@types/icon-svg-object';
import { Icon } from '../../HugeIcons';
import { Large } from '../../typography/text/large';
import { Smaller } from '../../typography/text/smaller';

type PageTreeItem =
  | { name: string; label: string; icon?: IconSvgObject; path?: string; defaultOpen?: boolean }
  | {
      name: string;
      label: string;
      icon?: IconSvgObject;
      path?: string;
      items: PageTreeItem[];
      defaultOpen?: boolean;
    };

export function SideBarSettings() {
  const router = useRouter();
  const { buildPath } = useMatchesPath();

  const pageTree: PageTreeItem[] = [
    {
      name: 'administration',
      label: 'Administração',
      defaultOpen: true,
      items: [
        { name: 'imports', label: 'Importações', path: '/settings/imports', icon: DashedLineCircleIcon },
        { name: 'exports', label: 'Exportações', path: '/settings/exports', icon: DashedLineCircleIcon },
        { name: 'registry-at-work', label: 'Registro de Trabalho', path: '/settings/registry-at-work', icon: DashedLineCircleIcon },
      ]
    },

    {
      name: 'features',
      label: 'Features',
      defaultOpen: true,
      items: [
        { name: 'project-state', label: 'Importações', path: '/settings/imports', icon: DashedLineCircleIcon },
        { name: 'flags', label: 'Iniciativas', path: '/settings/flags', icon: DashedLineCircleIcon },
        { name: 'models', label: 'Modelos', path: '/settings/models', icon: DashedLineCircleIcon },
        { name: 'ai', label: 'Elo AI', path: '/settings/ai', icon: DashedLineCircleIcon },
      ]
    },

    {
      name: 'developer',
      label: 'Desenvolvedor',
      defaultOpen: true,
      items: [
        { name: 'integrations', label: 'Integrações', path: '/settings/integrations', icon: DashedLineCircleIcon },
        { name: 'connections', label: 'Conexões', path: '/settings/connections', icon: DashedLineCircleIcon },
      ]
    },
  ];

  const renderItem = (pageItem: PageTreeItem) => {
    if ('items' in pageItem) {
      return (
        <>
          <Smaller className='text-muted-foreground'>
            {pageItem.label}
          </Smaller>
          <div>
            {pageItem.items.map((child) => renderItem(child))}
          </div>
        </>
      )
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
    )
  }

  return (
    <>
      <div className='flex flex-col gap-3 pb-3'>
        <Large>Configurações do espaço de trabalho</Large>
      </div>
      <div className='flex flex-col gap-1'>
        {pageTree.map((item) => renderItem(item))}
      </div>
    </>
  );
}
