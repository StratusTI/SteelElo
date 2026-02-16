'use client';

import {
  Add01Icon,
  CheckListIcon,
  Delete02Icon,
  PaintBoardIcon,
  TextBoldIcon,
  TextItalicIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AlertDelete } from '@/app/components/alert-delete';
import { Icon } from '@/app/components/HugeIcons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Kbd } from '@/components/ui/kbd';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  type Sticky,
  useCreateSticky,
  useDeleteSticky,
  useUpdateSticky,
} from '@/src/hooks/use-stickies';

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

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface AddStickiesProps {
  variant: 'link' | 'default';
  onAdd?: () => void;
}

export function AddStickies({ variant, onAdd }: AddStickiesProps) {
  const createSticky = useCreateSticky();

  const handleAdd = async () => {
    try {
      await createSticky.mutateAsync({
        content: '',
        backgroundColor: 'gray',
      });
      toast.success('Post-it criado com sucesso');
      onAdd?.();
    } catch (_error) {
      toast.error('Falha ao criar post-it');
    }
  };

  return (
    <Button
      variant={variant}
      className={`${variant === 'link' ? 'text-branding hover:text-branding' : 'bg-branding hover:bg-branding/90 text-white'}`}
      onClick={handleAdd}
      disabled={createSticky.isPending}
    >
      {variant === 'link' ? <Icon icon={Add01Icon} /> : null}
      {createSticky.isPending ? 'Criando...' : 'Adicionar post-it'}
    </Button>
  );
}

interface BackgroundColorDropdownProps {
  onColorChange: (color: ColorKey) => void;
  currentColor: ColorKey;
}

export function BackgroundColorDropdown({
  onColorChange,
  currentColor,
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
              className={`rounded-full size-8 cursor-pointer border-2 transition-all p-0 ${
                currentColor === colorKey
                  ? 'border-white'
                  : 'border-transparent hover:border-white/50'
              }`}
              style={{ backgroundColor: STICKY_COLORS[colorKey] }}
              onClick={() => onColorChange(colorKey)}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function parseTodoContent(content: string): {
  todos: TodoItem[];
  regularContent: string;
} {
  const lines = content.split('\n');
  const todos: TodoItem[] = [];
  const regularLines: string[] = [];

  lines.forEach((line, index) => {
    const todoMatch = line.match(/^(\[[ x]\])\s*(.*)$/);
    if (todoMatch) {
      todos.push({
        id: `todo-${index}`,
        text: todoMatch[2],
        completed: todoMatch[1] === '[x]',
      });
    } else {
      regularLines.push(line);
    }
  });

  return {
    todos,
    regularContent: regularLines.join('\n'),
  };
}

function serializeTodoContent(
  todos: TodoItem[],
  regularContent: string,
): string {
  const todoLines = todos.map(
    (todo) => `[${todo.completed ? 'x' : ' '}] ${todo.text}`,
  );

  if (regularContent.trim() && todoLines.length > 0) {
    return `${regularContent}\n${todoLines.join('\n')}`;
  }
  if (todoLines.length > 0) {
    return todoLines.join('\n');
  }
  return regularContent;
}

interface StickyNoteProps {
  sticky?: Sticky;
}

export function StickyNote({ sticky }: StickyNoteProps) {
  const [content, setContent] = useState(sticky?.content || '');
  const [currentColor, setCurrentColor] = useState<ColorKey>(
    (sticky?.backgroundColor as ColorKey) || 'gray',
  );
  const [isBold, setIsBold] = useState(sticky?.isBold || false);
  const [isItalic, setIsItalic] = useState(sticky?.isItalic || false);
  const [isTodoMode, setIsTodoMode] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [regularContent, setRegularContent] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateSticky = useUpdateSticky();
  const deleteSticky = useDeleteSticky();
  const _createSticky = useCreateSticky();

  useEffect(() => {
    if (sticky?.content) {
      const { todos: parsedTodos, regularContent: parsedRegular } =
        parseTodoContent(sticky.content);
      if (parsedTodos.length > 0) {
        setTodos(parsedTodos);
        setRegularContent(parsedRegular);
        setIsTodoMode(true);
      } else {
        setContent(sticky.content);
      }
    }
  }, [sticky?.content]);

  const debouncedSave = useCallback(
    (updates: {
      content?: string;
      backgroundColor?: ColorKey;
      isBold?: boolean;
      isItalic?: boolean;
    }) => {
      if (!sticky?.id) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await updateSticky.mutateAsync({
            stickyId: sticky.id,
            data: updates,
          });
        } catch (_error) {
          toast.error('Falha ao salvar alterações');
        }
      }, 500);
    },
    [sticky?.id, updateSticky],
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedSave({ content: newContent });
  };

  const handleColorChange = async (color: ColorKey) => {
    setCurrentColor(color);
    if (sticky?.id) {
      try {
        await updateSticky.mutateAsync({
          stickyId: sticky.id,
          data: { backgroundColor: color },
        });
      } catch (_error) {
        toast.error('Falha ao alterar cor');
      }
    }
  };

  const handleBoldToggle = async () => {
    const newBold = !isBold;
    setIsBold(newBold);
    if (sticky?.id) {
      try {
        await updateSticky.mutateAsync({
          stickyId: sticky.id,
          data: { isBold: newBold },
        });
      } catch (_error) {
        toast.error('Falha ao alterar formatação');
      }
    }
  };

  const handleItalicToggle = async () => {
    const newItalic = !isItalic;
    setIsItalic(newItalic);
    if (sticky?.id) {
      try {
        await updateSticky.mutateAsync({
          stickyId: sticky.id,
          data: { isItalic: newItalic },
        });
      } catch (_error) {
        toast.error('Falha ao alterar formatação');
      }
    }
  };

  const handleTodoModeToggle = () => {
    if (isTodoMode) {
      const serialized = serializeTodoContent(todos, regularContent);
      setContent(serialized);
      setIsTodoMode(false);
      setTodos([]);
      setRegularContent('');
      debouncedSave({ content: serialized });
    } else {
      const { todos: parsedTodos, regularContent: parsedRegular } =
        parseTodoContent(content);
      if (parsedTodos.length === 0) {
        setTodos([{ id: `todo-${Date.now()}`, text: '', completed: false }]);
        setRegularContent(content);
      } else {
        setTodos(parsedTodos);
        setRegularContent(parsedRegular);
      }
      setIsTodoMode(true);
    }
  };

  const handleTodoToggle = (todoId: string) => {
    const newTodos = todos.map((todo) =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
    );
    setTodos(newTodos);
    const serialized = serializeTodoContent(newTodos, regularContent);
    debouncedSave({ content: serialized });
  };

  const handleTodoTextChange = (todoId: string, text: string) => {
    const newTodos = todos.map((todo) =>
      todo.id === todoId ? { ...todo, text } : todo,
    );
    setTodos(newTodos);
    const serialized = serializeTodoContent(newTodos, regularContent);
    debouncedSave({ content: serialized });
  };

  const handleAddTodo = () => {
    const newTodos = [
      ...todos,
      { id: `todo-${Date.now()}`, text: '', completed: false },
    ];
    setTodos(newTodos);
  };

  const handleRemoveTodo = (todoId: string) => {
    const newTodos = todos.filter((todo) => todo.id !== todoId);
    setTodos(newTodos);
    const serialized = serializeTodoContent(newTodos, regularContent);
    debouncedSave({ content: serialized });
  };

  const handleDelete = async () => {
    if (!sticky?.id) return;

    try {
      await deleteSticky.mutateAsync(sticky.id);
      toast.success('Post-it excluído com sucesso');
    } catch (_error) {
      toast.error('Falha ao excluir post-it');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey && e.key === 'b') {
      e.preventDefault();
      handleBoldToggle();
    } else if (modKey && e.key === 'i') {
      e.preventDefault();
      handleItalicToggle();
    } else if (modKey && e.key === 'l') {
      e.preventDefault();
      handleTodoModeToggle();
    }
  };

  const textStyle = {
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
  } as const;

  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKeyLabel = isMac ? 'Cmd' : 'Ctrl';

  return (
    <div
      className='flex flex-col p-2 w-58 rounded-sm h-min min-h-81.25'
      style={{ backgroundColor: STICKY_COLORS[currentColor] }}
      onKeyDown={handleKeyDown}
    >
      {isTodoMode ? (
        <div className='flex-1 p-2 space-y-2 overflow-y-auto'>
          {regularContent && (
            <p className='text-sm text-white/70 mb-2' style={textStyle}>
              {regularContent}
            </p>
          )}
          {todos.map((todo) => (
            <div key={todo.id} className='flex items-center gap-2 group'>
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => handleTodoToggle(todo.id)}
                className='shrink-0'
              />
              <input
                type='text'
                value={todo.text}
                onChange={(e) => handleTodoTextChange(todo.id, e.target.value)}
                placeholder='Nova tarefa...'
                className={`flex-1 bg-transparent border-none outline-none text-sm ${
                  todo.completed ? 'line-through text-white/50' : 'text-white'
                }`}
                style={textStyle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTodo();
                  } else if (
                    e.key === 'Backspace' &&
                    todo.text === '' &&
                    todos.length > 1
                  ) {
                    e.preventDefault();
                    handleRemoveTodo(todo.id);
                  }
                }}
              />
            </div>
          ))}
          <Button
            variant='ghost'
            size='sm'
            className='w-full text-white/50 hover:text-white hover:bg-white/10'
            onClick={handleAddTodo}
          >
            <Icon icon={Add01Icon} size={14} />
            Adicionar item
          </Button>
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          placeholder='Qual a sua ideia?'
          className='w-full resize-none overflow-y-auto bg-transparent! border-none focus-visible:border-none focus-visible:ring-0 focus-visible:outline-none flex-1 shadow-none'
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          style={textStyle}
        />
      )}
      <div className='max-h-15 flex items-center justify-between w-full'>
        <div>
          <BackgroundColorDropdown
            onColorChange={handleColorChange}
            currentColor={currentColor}
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant='ghost'
                  size='icon-sm'
                  onClick={handleBoldToggle}
                  className={isBold ? 'bg-white/20' : ''}
                >
                  <Icon icon={TextBoldIcon} />
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
                  onClick={handleItalicToggle}
                  className={isItalic ? 'bg-white/20' : ''}
                >
                  <Icon icon={TextItalicIcon} />
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
                  onClick={handleTodoModeToggle}
                  className={isTodoMode ? 'bg-white/20' : ''}
                >
                  <Icon icon={CheckListIcon} />
                </Button>
              }
            />
            <TooltipContent className='flex flex-col items-center'>
              Lista de tarefas
              <Kbd>{modKeyLabel} + L</Kbd>
            </TooltipContent>
          </Tooltip>
        </div>
        <div>
          <AlertDelete
            title='Excluir post-it'
            description='Tem certeza de que deseja excluir esse post-it?'
            trigger={
              <Button variant='destructive' size='icon-sm'>
                <Icon icon={Delete02Icon} />
              </Button>
            }
            icon={Delete02Icon}
            onConfirm={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
