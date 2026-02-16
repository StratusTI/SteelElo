import { IconSvgElement } from "@hugeicons/react";

export type BreadCrumbItem =
  {
    name: string;
    href?: string;
    icon: IconSvgElement;
  }

export interface BreadCrumbProps {
  items: BreadCrumbItem[];
}
