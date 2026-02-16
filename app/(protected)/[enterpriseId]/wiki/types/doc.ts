import type { IconSvgElement } from '@hugeicons/react';
import {
  Archive03Icon,
  File02Icon,
  GlobalIcon,
  SquareLockCheck02Icon,
} from '@hugeicons-pro/core-stroke-rounded';
import type { DocumentStatus } from '@/src/@types/document';

export const StateIcon: Record<DocumentStatus, IconSvgElement> = {
  draft: File02Icon,
  published: GlobalIcon,
  private: SquareLockCheck02Icon,
  archived: Archive03Icon,
};
