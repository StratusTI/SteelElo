'use client';

import {
  AttachmentIcon,
  CheckListIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  Heading04Icon,
  Heading05Icon,
  Heading06Icon,
  Image02Icon,
  LeftToRightBlockQuoteIcon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  SourceCodeIcon,
  TableIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextFontIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
  UnavailableIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import type { Editor } from '@tiptap/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/app/components/HugeIcons';
import { Smaller } from '@/app/components/typography/text/smaller';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TextEditProps {
  editor?: Editor | null;
}

export function TextEdit({ editor }: TextEditProps) {
  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKeyLabel = isMac ? 'Cmd' : 'Ctrl';

  return (
    <div className='flex items-center gap-2 h-8'>
      <TitleDropdown editor={editor} />
      <div className='h-full border border-border' />
      <ColorPicker editor={editor} />
      <div className='h-full border border-border' />
      {/* Text customization */}
      <div className='flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(editor?.isActive('bold') && 'bg-accent')}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <Icon icon={TextBoldIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Negrito
            <Kbd>{modKeyLabel} + B</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(editor?.isActive('italic') && 'bg-accent')}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <Icon icon={TextItalicIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Itálico
            <Kbd>{modKeyLabel} + I</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(editor?.isActive('underline') && 'bg-accent')}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
              >
                <Icon icon={TextUnderlineIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Sublinhado
            <Kbd>{modKeyLabel} + U</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(editor?.isActive('strike') && 'bg-accent')}
                onClick={() => editor?.chain().focus().toggleStrike().run()}
              >
                <Icon icon={TextStrikethroughIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Riscado
            <Kbd>{modKeyLabel} + Shift + S</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='h-full border border-border' />
      {/* Text orientation */}
      <div className='flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(
                  editor?.isActive({ textAlign: 'left' }) && 'bg-accent',
                )}
                onClick={() =>
                  editor?.chain().focus().setTextAlign('left').run()
                }
              >
                <Icon icon={TextAlignLeftIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Alinhar à esquerda
            <Kbd>{modKeyLabel} + Shift + L</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(
                  editor?.isActive({ textAlign: 'center' }) && 'bg-accent',
                )}
                onClick={() =>
                  editor?.chain().focus().setTextAlign('center').run()
                }
              >
                <Icon icon={TextAlignCenterIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Alinhar ao centro
            <Kbd>{modKeyLabel} + Shift + E</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(
                  editor?.isActive({ textAlign: 'right' }) && 'bg-accent',
                )}
                onClick={() =>
                  editor?.chain().focus().setTextAlign('right').run()
                }
              >
                <Icon icon={TextAlignRightIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Alinhar à direita
            <Kbd>{modKeyLabel} + Shift + R</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='h-full border border-border' />
      {/* Lists */}
      <div className='flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(editor?.isActive('orderedList') && 'bg-accent')}
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
              >
                <Icon icon={LeftToRightListNumberIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Lista numerada
            <Kbd>{modKeyLabel} + Shift + 7</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(editor?.isActive('bulletList') && 'bg-accent')}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                <Icon icon={LeftToRightListBulletIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Lista de marcadores
            <Kbd>{modKeyLabel} + Shift + 8</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(editor?.isActive('taskList') && 'bg-accent')}
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
              >
                <Icon icon={CheckListIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Lista de tarefas
            <Kbd>{modKeyLabel} + Shift + 9</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='h-full border border-border' />
      {/* Code & Quote */}
      <div className='flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(editor?.isActive('blockquote') && 'bg-accent')}
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              >
                <Icon icon={LeftToRightBlockQuoteIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Citação
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                className={cn(editor?.isActive('codeBlock') && 'bg-accent')}
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              >
                <Icon icon={SourceCodeIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Código
          </TooltipContent>
        </Tooltip>
      </div>
      <div className='h-full border border-border' />
      {/* Table & Image */}
      <div className='flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run()
                }
              >
                <Icon icon={TableIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Tabela
          </TooltipContent>
        </Tooltip>
        <ImageInsertDialog editor={editor} />
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant='ghost'
                size='icon-sm'
                onClick={() => toast.info('Funcionalidade em breve')}
              >
                <Icon icon={AttachmentIcon} strokeWidth={2} />
              </Button>
            }
          />
          <TooltipContent className='flex flex-col items-center'>
            Arquivo
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function ColorPicker({ editor }: { editor?: Editor | null }) {
  const [selectedTextColor, setSelectedTextColor] = useState('none');
  const [selectedBgColor, setSelectedBgColor] = useState('none');

  const TEXT_COLOR = [
    { color: '#5c5e63', value: 'gray', label: 'Gray' },
    { color: '#ff5b59', value: 'peach', label: 'Peach' },
    { color: '#f65385', value: 'pink', label: 'Pink' },
    { color: '#fd9038', value: 'orange', label: 'Orange' },
    { color: '#0fc27b', value: 'green', label: 'Green' },
    { color: '#17bee9', value: 'light-blue', label: 'Light Blue' },
    { color: '#266df0', value: 'dark-blue', label: 'Dark Blue' },
    { color: '#9162f9', value: 'purple', label: 'Purple' },
    { color: '', value: 'none', label: 'None' },
  ];

  const BACKGROUND_COLOR = [
    { color: '#404144', value: 'gray', label: 'Gray' },
    { color: '#593032', value: 'peach', label: 'Peach' },
    { color: '#562e3d', value: 'pink', label: 'Pink' },
    { color: '#583e2a', value: 'orange', label: 'Orange' },
    { color: '#1d4a3b', value: 'green', label: 'Green' },
    { color: '#1f495c', value: 'light-blue', label: 'Light Blue' },
    { color: '#223558', value: 'dark-blue', label: 'Dark Blue' },
    { color: '#3d325a', value: 'purple', label: 'Purple' },
    { color: '', value: 'none', label: 'None' },
  ];

  const handleTextColor = (color: string) => {
    setSelectedTextColor(color);
    if (color) {
      editor?.chain().focus().setColor(color).run();
    } else {
      editor?.chain().focus().unsetColor().run();
    }
  };

  const handleBgColor = (color: string) => {
    setSelectedBgColor(color);
    if (color) {
      editor?.chain().focus().toggleHighlight({ color }).run();
    } else {
      editor?.chain().focus().unsetHighlight().run();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='ghost' size='sm'>
            <Smaller>Cor</Smaller>
            <span
              className='size-6 rounded-sm border border-border flex items-center justify-center'
              style={{
                backgroundColor: selectedBgColor,
                color: selectedTextColor,
              }}
            >
              <Icon icon={TextFontIcon} size={16} />
            </span>
          </Button>
        }
      />
      <DropdownMenuContent className='w-auto p-2 space-y-2' align='start'>
        <DropdownMenuGroup className='flex flex-col space-y-1.5'>
          <Smaller>Cor do texto</Smaller>
          <div className='flex items-center gap-2'>
            {TEXT_COLOR.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => handleTextColor(item.color)}
                className='p-0 m-0 size-6 rounded border border-border hover:opacity-80 flex items-center justify-center'
                style={{ backgroundColor: item.color || 'transparent' }}
              >
                {item.color === '' && (
                  <Icon
                    icon={UnavailableIcon}
                    size={16}
                    className='opacity-75'
                  />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuGroup>
        <DropdownMenuGroup className='flex flex-col space-y-1.5'>
          <Smaller>Cor de fundo</Smaller>
          <div className='flex items-center gap-2'>
            {BACKGROUND_COLOR.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => handleBgColor(item.color)}
                className='p-0 m-0 size-6 rounded border border-border hover:opacity-80 flex items-center justify-center'
                style={{ backgroundColor: item.color || 'transparent' }}
              >
                {item.color === '' && (
                  <Icon
                    icon={UnavailableIcon}
                    size={16}
                    className='opacity-75'
                  />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TitleDropdown({ editor }: { editor?: Editor | null }) {
  const TITLE_FORMAT = [
    { icon: TextFontIcon, label: 'Texto', value: 'text' },
    { icon: Heading01Icon, label: 'Título 1', value: 'h1', level: 1 },
    { icon: Heading02Icon, label: 'Título 2', value: 'h2', level: 2 },
    { icon: Heading03Icon, label: 'Título 3', value: 'h3', level: 3 },
    { icon: Heading04Icon, label: 'Título 4', value: 'h4', level: 4 },
    { icon: Heading05Icon, label: 'Título 5', value: 'h5', level: 5 },
    { icon: Heading06Icon, label: 'Título 6', value: 'h6', level: 6 },
  ] as const;

  const getCurrentFormat = () => {
    if (!editor) return TITLE_FORMAT[0];
    for (const format of TITLE_FORMAT) {
      if (
        'level' in format &&
        editor.isActive('heading', { level: format.level })
      ) {
        return format;
      }
    }
    return TITLE_FORMAT[0];
  };

  const selectedFormat = getCurrentFormat();

  const handleSelect = (format: (typeof TITLE_FORMAT)[number]) => {
    if (!editor) return;
    if ('level' in format) {
      editor.chain().focus().toggleHeading({ level: format.level }).run();
    } else {
      editor.chain().focus().setParagraph().run();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant='outline' size='sm'>
            <Icon icon={selectedFormat.icon} size={16} />
            <Smaller>{selectedFormat.label}</Smaller>
          </Button>
        }
      />
      <DropdownMenuContent align='start'>
        <DropdownMenuGroup>
          {TITLE_FORMAT.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onClick={() => handleSelect(item)}
              className={selectedFormat.value === item.value ? 'bg-accent' : ''}
            >
              <Icon icon={item.icon} size={16} className='mr-2' />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ImageInsertDialog({ editor }: { editor?: Editor | null }) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleInsert = () => {
    if (imageUrl.trim()) {
      editor?.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl('');
      setOpen(false);
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={() => setOpen(true)}
            >
              <Icon icon={Image02Icon} strokeWidth={2} />
            </Button>
          }
        />
        <TooltipContent className='flex flex-col items-center'>
          Imagem
        </TooltipContent>
      </Tooltip>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className='bg-background p-0 gap-0'>
          <AlertDialogHeader className='p-6 pb-0'>
            <AlertDialogTitle>Inserir imagem</AlertDialogTitle>
          </AlertDialogHeader>
          <div className='p-6'>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder='https://exemplo.com/imagem.png'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInsert();
                }
              }}
            />
          </div>
          <AlertDialogFooter className='bg-muted/50 p-3'>
            <AlertDialogCancel
              variant='outline'
              size='sm'
              onClick={() => setImageUrl('')}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              size='sm'
              onClick={handleInsert}
              disabled={!imageUrl.trim()}
            >
              Inserir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
