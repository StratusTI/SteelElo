import type { ComponentProps } from 'react';
import { ButtonGroup as ButtonGroupUI } from '@/components/ui/button-group';

interface ButtonGroupProps extends ComponentProps<typeof ButtonGroupUI> {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
}: ButtonGroupProps) {
  return (
    <ButtonGroupUI orientation={orientation} className='dark'>
      {children}
    </ButtonGroupUI>
  );
}
