interface TypographyBlockquoteProps {
  children: React.ReactNode;
}

export function TypographyBlockquote({ children }: TypographyBlockquoteProps) {
  return (
    <blockquote className='mt-6 border-l-2 pl-6 italic'>{children}</blockquote>
  );
}
