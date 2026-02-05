'use client';

import { usePathname } from 'next/navigation';
import { SideBarAI } from './aiSideBar';
import { SideBarProjects } from './projectSideBar';
import { SideBarSettings } from './settingsSideBar';
import { SideBarWiki } from './wikiSideBar';

export function SideBar() {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const section = segments[2];

  return (
    <div className='group/sidebar w-62.5 h-full border-r-2 border-border transition-all duration-300 ease-in-out translate-x-0 opacity-100 overflow-hidden py-3 px-3'>
      {section === 'projects' && <SideBarProjects />}
      {section === 'wiki' && <SideBarWiki />}
      {section === 'settings' && <SideBarSettings />}
      {section === 'ai' && <SideBarAI />}
    </div>
  );
}
