import { HugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps } from 'react';

export type IconProps = ComponentProps<typeof HugeiconsIcon>;

export function Icon({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...props
}: IconProps) {
  return (
    <HugeiconsIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}
