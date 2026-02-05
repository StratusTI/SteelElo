'use client'

import {
  AiChat02Icon,
  ArrowRight01Icon,
  PanelLeftCloseIcon,
  Search01Icon,
  SlidersHorizontalIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useMatchesPath } from '@/lib/matchesPath';
import type { IconSvgObject } from '@/src/@types/icon-svg-object';
import { Icon } from '../../HugeIcons';
import { Large } from '../../typography/text/large';
import { Muted } from '../../typography/text/muted';

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

export function SideBarAI() {
  const router = useRouter();
  const { buildPath } = useMatchesPath();

  const pageTree: PageTreeItem[] = [
    {
      name: 'recents',
      label: 'Recentes',
      defaultOpen: true,
      items: []
    },
  ];

  const renderItem = (pageItem: PageTreeItem) => {
    if ('items' in pageItem) {
      return (
        <Collapsible key={pageItem.name} defaultOpen={pageItem.defaultOpen}>
          <CollapsibleTrigger onClick={() => pageItem.path && router.push(buildPath(pageItem.path))} render={
            <Button variant='ghost' size='sm' className='group min-w-full justify-between transition-none'>
              <Muted>
                {pageItem.label}
              </Muted>
              <div className='flex items-center gap-0.5'>
                {pageItem.icon &&
                  <span className='inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent'>
                    <Icon
                      icon={pageItem.icon}
                      strokeWidth={2}
                      className='opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-aria-expanded:opacity-100 text-muted-foreground'
                    />
                  </span>
                }
                <span className='inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-accent'>
                  <Icon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    className='opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out group-aria-expanded:rotate-90 group-aria-expanded:opacity-100 text-muted-foreground'
                  />
                </span>
              </div>
            </Button>
          } />
          <CollapsibleContent>
            <div>
              {pageItem.items.map((child) => renderItem(child))}
            </div>
          </CollapsibleContent>
        </Collapsible>
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
        <div className='flex items-center justify-between gap-4'>
          <Large>Elo AI</Large>
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
        <div className='flex gap-1'>
          <Button
            variant='outline'
            onClick={() => console.log('notification')}
            className='flex-1 justify-start text-secondary-foreground/90 hover:text-primary'
          >
            <Icon icon={AiChat02Icon} strokeWidth={2} /> Novo bate papo
          </Button>
          <Button
            variant='outline'
            onClick={() => console.log('notification')}
          >
            <Icon icon={Search01Icon} strokeWidth={2} />
          </Button>
        </div>
      </div>
      <div className='flex flex-col gap-1'>
        {pageTree.map((item) => renderItem(item))}
      </div>
    </>
  );
}
