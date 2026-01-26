interface SmallProps {
  children: React.ReactNode;
}

export function Small({ children }: SmallProps) {
  return <small className='text-sm leading-none font-medium'>{children}</small>;
}
