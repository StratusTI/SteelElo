interface ListProps {
  children: React.ReactNode;
}

export function UnorderedList() {
  return <ul className='my-6 ml-6 list-disc [&>li]:mt-2' />;
}

export function OrderedList() {
  return <ol className='my-6 ml-6 list-decimal [&>li]:mt-2' />;
}

export function ListItem({ children }: ListProps) {
  return <li>{children}</li>;
}
