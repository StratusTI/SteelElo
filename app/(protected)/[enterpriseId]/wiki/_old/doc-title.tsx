import { Input } from '@/components/ui/input';

interface DocTitleProps {
  title: string;
  onChange: (value: string) => void;
}

export function DocTitle({ title, onChange }: DocTitleProps) {
  return (
    <Input
      value={title}
      onChange={(e) => onChange(e.target.value)}
      placeholder='Sem título'
      className='bg-transparent! border-transparent rounded-none border-0 p-0 shadow-none ring-0 focus-visible:ring-0 aria-invalid:ring-0 dark:bg-transparent flex-1 scroll-m-20 text-4xl! font-extrabold tracking-tight text-balance text-primary text-left placeholder:text-xs placeholder:text-muted-foreground'
    />
  )
}
