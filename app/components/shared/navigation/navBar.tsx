import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BreadCrumbProps } from '@/lib/@types/breadcrumb';
import type { TabItemProps } from '@/lib/@types/tabs';
import { Icon } from '../../HugeIcons';

interface NavBarProps {
  children: React.ReactNode;
}

export function NavBar({ children }: NavBarProps) {
  return (
    <div className='px-5 h-13 flex gap-2 w-full items-center border-b border-border bg-card justify-between'>
      {children}
    </div>
  );
}

export function BreadCrumb({ items }: BreadCrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={item.href ?? index}>
            <Tooltip>
              <TooltipTrigger>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href={item.href}
                    className='flex gap-1.5 items-center'
                  >
                    <Icon icon={item.icon} size={18} />
                    {item.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </TooltipTrigger>
              <TooltipContent side='bottom'>{item.name}</TooltipContent>
            </Tooltip>
            {items.length > 1 && index !== items.length - 1 && (
              <BreadcrumbSeparator />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function TabsLine({ defaultValue, items }: TabItemProps) {
  return (
    <Tabs defaultValue={defaultValue}>
      <TabsList variant='line'>
        {items.map((item, index) => (
          <TabsTrigger
            className='hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-selected:bg-muted  aria-selected:text-foreground'
            key={index}
            value={item.value}
          >
            {item.icon && <Icon icon={item.icon} />}
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
