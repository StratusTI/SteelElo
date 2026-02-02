interface H1Props {
  children: React.ReactNode;
}

export function H1({ children }: H1Props) {
  return (
    <h1 className='scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance text-primary'>
      {children}
    </h1>
  );
}
