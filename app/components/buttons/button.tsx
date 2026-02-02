import type { ComponentProps } from 'react';
import { Button as ButtonUI } from '@/components/ui/button';

interface ButtonProps extends ComponentProps<typeof ButtonUI> {
  children: React.ReactNode;
  disabled?: boolean;
  link?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'secondary'
    | 'destructive'
    | 'link';
  size?:
    | 'default'
    | 'xs'
    | 'sm'
    | 'lg'
    | 'icon'
    | 'icon-xs'
    | 'icon-sm'
    | 'icon-lg';
}

export function Button({
  children,
  disabled = false,
  variant = 'default',
  size = 'default',
}: ButtonProps) {
  return (
    <ButtonUI variant={variant} size={size} disabled={disabled}>
      {children}
    </ButtonUI>
  );
}

export function ButtonNavigation({
  children,
  link,
  disabled = false,
  variant = 'default',
  size = 'default',
}: ButtonProps) {
  return (
    <ButtonUI
      variant={variant}
      size={size}
      nativeButton={false}
      disabled={disabled}
      render={<a href={link}>{children}</a>}
    />
  );
}
