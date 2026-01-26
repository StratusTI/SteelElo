interface LeadProps {
  children: React.ReactNode;
}

export function Lead({ children }: LeadProps) {
  return <p className='text-muted-foreground text-xl'>{children}</p>;
}
