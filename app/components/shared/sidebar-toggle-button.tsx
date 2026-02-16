'use client';

import { PanelLeftCloseIcon } from '@hugeicons-pro/core-stroke-rounded';
import { useSideBar } from '@/app/providers/sidebar-provider';
import { Button } from '@/components/ui/button';
import { Icon } from '../HugeIcons';

export function SidebarToggleButton() {
  const { isOpen, open } = useSideBar();

  if (isOpen) return null;

  return (
    <Button variant='ghost' size='icon-sm' onClick={() => open()}>
      <Icon icon={PanelLeftCloseIcon} />
    </Button>
  );
}
