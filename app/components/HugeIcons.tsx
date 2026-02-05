import { HugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps } from 'react';

export type IconProps = ComponentProps<typeof HugeiconsIcon>;

export function Icon({
  size = 24,
  color = 'currentColor',
  icon,
  ...props
}: IconProps) {
  if (!icon) return null;

  return (
    <HugeiconsIcon
      size={size}
      color={color}
      icon={icon}
      {...props}
    />
  );
}
