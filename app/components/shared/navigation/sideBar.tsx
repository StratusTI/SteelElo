'use client';

import { usePathname } from 'next/navigation';
import { useSideBar } from '@/app/providers/sidebar-provider';
import { cn } from '@/lib/utils';
import { SideBarAI } from './aiSideBar';
import { SideBarProjects } from './projectSideBar';
import { SideBarSettings } from './settingsSideBar';
import { SideBarWiki } from './wikiSideBar';

export function SideBar() {
  const { isOpen } = useSideBar();

  const pathname = usePathname();
  const segments = pathname.split('/');
  const section = segments[2];

  return (
    <div
      className={cn(
        'group/sidebar h-full border-border py-3',
        'transition-all duration-500 ease-out',
        isOpen
          ? 'min-w-65 max-w-65 opacity-100 border-r-2 px-3'
          : 'min-w-0 max-w-0 opacity-0 border-r-0 px-0 overflow-hidden pointer-events-none',
      )}
    >
      {section === 'projects' && <SideBarProjects />}
      {section === 'wiki' && <SideBarWiki />}
      {section === 'settings' && <SideBarSettings />}
      {section === 'ai' && <SideBarAI />}
    </div>
  );
}
