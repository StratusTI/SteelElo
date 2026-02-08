'use client';

import {
  Add01Icon,
  CheckListIcon,
  Delete02Icon,
  PaintBoardIcon,
  TextBoldIcon,
  TextItalicIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDelete } from '@/app/components/alert-delete';
import { Icon } from '@/app/components/HugeIcons';
import { Small } from '@/app/components/typography/text/small';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const STICKY_COLORS = {
  gray: '#404144',
  peach: '#593032',
  pink: '#562e3d',
  orange: '#583e2a',
  green: '#1d4a3b',
  lightblue: '#1f495c',
  darkblue: '#223558',
  purple: '#3d325a',
} as const;

type ColorKey = keyof typeof STICKY_COLORS;

interface StickyProps {
  id?: string;
  content?: string;
  backgroundColor?: ColorKey;
  onDelete?: () => void;
}

export function UserStickies() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className='flex flex-col gap-4 w-full'>
      <div className='flex justify-between items-center'>
        <Small>Seus post-its</Small>

        <div className='gap-1 flex items-center'>
          <Input
            className='h-8'
            placeholder='Pesquisar por título'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddStickies />
        </div>
      </div>
      <div className='flex flex-wrap gap-4 w-full'>
        <StickyNote backgroundColor='gray' />
        <StickyNote backgroundColor='peach' />
        <StickyNote backgroundColor='purple' />
      </div>
    </div>
  );
}

export function AddStickies() {
  return (
    <Button
      variant='link'
      className='text-branding hover:text-branding'
      onClick={() => toast('Toast')}
    >
      <Icon icon={Add01Icon} />
      Adicionar post-it
    </Button>
  );
}

interface BackgroundColorDropdownProps {
  onColorChange: (color: ColorKey) => void;
}

export function BackgroundColorDropdown({
  onColorChange,
}: BackgroundColorDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='ghost' size='icon-sm'>
            <Icon icon={PaintBoardIcon} />
          </Button>
        }
      />
      <DropdownMenuContent className='w-auto p-2'>
        <div className='flex gap-2 flex-wrap max-w-50'>
          {(Object.keys(STICKY_COLORS) as ColorKey[]).map((colorKey) => (
            <DropdownMenuItem
              key={colorKey}
              className='rounded-full size-8 cursor-pointer border-2 border-transparent hover:border-white/50 transition-all p-0'
              style={{ backgroundColor: STICKY_COLORS[colorKey] }}
              onClick={() => onColorChange(colorKey)}
              />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StickyNote({
  content = '',
  backgroundColor = 'gray',
  onDelete,
}: StickyProps) {
  const [stickyContent, setStickyContent] = useState(content);
  const [currentColor, setCurrentColor] = useState<ColorKey>(backgroundColor);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const textStyle = {
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
  };

  return (
    <div
      className='flex flex-col p-2 w-58 rounded-sm h-min min-h-81.25'
      style={{ backgroundColor: STICKY_COLORS[currentColor] }}
    >
      <Textarea
        placeholder='Qual a sua ideia?'
        className='w-full resize-none overflow-y-auto bg-transparent! border-none focus-visible:border-none focus-visible:ring-0 focus-visible:outline-none flex-1 shadow-none'
        value={stickyContent}
        onChange={(e) => setStickyContent(e.target.value)}
        style={textStyle}
      />
      <div className='max-h-15 flex items-center justify-between w-full'>
        <div>
          <BackgroundColorDropdown onColorChange={setCurrentColor} />
          <Button
            variant='ghost'
            onClick={() => setIsBold(!isBold)}
            className={isBold ? 'font-bold' : ''}
          >
            <Icon icon={TextBoldIcon} />
          </Button>
          <Button
            variant='ghost'
            onClick={() => setIsItalic(!isItalic)}
            className={isItalic ? 'font-italic' : ''}
          >
            <Icon icon={TextItalicIcon} />
          </Button>
          <Button variant='ghost'>
            <Icon icon={CheckListIcon} />
          </Button>
        </div>
        <div>
          <AlertDelete
            title='Excluir post-it'
            description='Tem certeza de que deseja excluir esse post-it?'
            trigger={
              <Button variant='destructive' size='icon-sm' onClick={onDelete}>
                <Icon icon={Delete02Icon} />
              </Button>
            }
            icon={Delete02Icon}
          />
        </div>
      </div>
    </div>
  );
}
