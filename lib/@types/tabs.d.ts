import type { IconSvgObject } from '@/src/@types/icon-svg-object';

export type TabItem =
  {
    value: string;
    label: string;
    icon?: IconSvgObject
  };

export interface TabItemProps {
  defaultValue?: string;
  items: TabItem[];
}
