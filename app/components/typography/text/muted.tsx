interface MutedProps {
  children: React.ReactNode;
}

export function Muted({ children }: MutedProps) {
  return <p className='text-muted-foreground text-sm'>{children}</p>;
}
