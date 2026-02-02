interface H2Props {
  children: React.ReactNode;
}

export function H2({ children }: H2Props) {
  return (
    <h2 className='scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-primary'>
      {children}
    </h2>
  );
}
