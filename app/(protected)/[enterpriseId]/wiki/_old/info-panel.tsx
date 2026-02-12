'use client';
import {
  CircleArrowRight02Icon,
  PanelRightIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import type { Editor } from '@tiptap/react';
import { useMemo, useState } from 'react';
import { Icon } from '@/app/components/HugeIcons';
import { Small } from '@/app/components/typography/text/small';
import { Smaller } from '@/app/components/typography/text/smaller';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { DocumentVersion } from '@/src/@types/document';
import type { DocumentWithCreator } from '@/src/hooks/use-documents';
import { TiptapEditor } from './tiptap-editor';

interface InfoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: DocumentWithCreator | null;
  versions?: DocumentVersion[];
  editorRef?: React.MutableRefObject<Editor | null>;
}

function extractHeadings(content: string) {
  const headings: { level: number; text: string }[] = [];
  const regex = /^(#{1,6})\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  match = regex.exec(content);
  while (match !== null) {
    headings.push({ level: match[1].length, text: match[2] });
    match = regex.exec(content);
  }
  return headings;
}

function computeStats(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return { words: 0, chars: 0, paragraphs: 0, readingTime: '0m' };
  const words = trimmed.split(/\s+/).length;
  const chars = content.length;
  const paragraphs = trimmed.split(/\n\n+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { words, chars, paragraphs, readingTime: `${minutes}m` };
}

export function ButtonPanelOpen({
  open,
  onOpenChange,
}: Pick<InfoPanelProps, 'open' | 'onOpenChange'>) {
  return (
    <div className='flex gap-2 h-full p-8'>
      <Button
        variant='ghost'
        size='icon-sm'
        className={cn(
          'transition-opacity',
          open && 'opacity-0 pointer-events-none',
        )}
        onClick={() => onOpenChange(!open)}
      >
        <Icon icon={PanelRightIcon} size={18} />
      </Button>
    </div>
  );
}

export function InfoPanel({
  open,
  onOpenChange,
  document,
  versions,
  editorRef,
}: InfoPanelProps) {
  const content = document?.conteudo ?? '';
  const headings = useMemo(() => extractHeadings(content), [content]);
  const stats = useMemo(() => computeStats(content), [content]);
  const [previewVersion, setPreviewVersion] = useState<DocumentVersion | null>(
    null,
  );

  const handleHeadingClick = (
    heading: { level: number; text: string },
    index: number,
  ) => {
    if (!editorRef?.current) return;

    const editorElement = editorRef.current.view.dom;
    const headingTag = `h${heading.level}`;
    const headingElements = editorElement.querySelectorAll(headingTag);

    let matchIndex = 0;
    for (const el of headingElements) {
      if (el.textContent?.trim() === heading.text.trim()) {
        if (matchIndex === index) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        matchIndex++;
      }
    }

    // Fallback: scroll to nth heading of that level
    if (headingElements[index]) {
      headingElements[index].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Count same-text headings for unique indexing
  const headingIndices = useMemo(() => {
    const counts: Record<string, number> = {};
    return headings.map((h) => {
      const key = `${h.level}-${h.text}`;
      counts[key] = counts[key] || 0;
      const idx = counts[key];
      counts[key]++;
      return idx;
    });
  }, [headings]);

  return (
    <>
      <div
        className={cn(
          'transition-all duration-300 flex flex-col gap-3 h-full border-l border-border ease-out py-10',
          open ? 'w-73.5' : 'w-0 overflow-hidden border-l-0',
        )}
      >
        <Button
          variant='ghost'
          size='icon-sm'
          className='ml-2.5'
          onClick={() => onOpenChange(!open)}
        >
          <Icon icon={CircleArrowRight02Icon} size={20} />
        </Button>
        <Tabs defaultValue='summary' className='p-0 m-0 px-3.5'>
          <TabsList>
            <TabsTrigger value='summary'>Sumário</TabsTrigger>
            <TabsTrigger value='info'>Informações</TabsTrigger>
            <TabsTrigger value='files'>Arquivos</TabsTrigger>
          </TabsList>
          <TabsContent
            value='summary'
            className='flex-1 py-2 overflow-hidden h-full'
          >
            <div className='flex flex-col h-full items-start gap-y-1 mt-0'>
              {headings.length === 0 ? (
                <Smaller className='text-muted-foreground px-2'>
                  Nenhum título encontrado
                </Smaller>
              ) : (
                headings.map((heading, index) => (
                  <Button
                    key={`${heading.text}-${index}`}
                    variant='ghost'
                    size='xs'
                    className='hover:bg-transparent hover:underline'
                    style={{ paddingLeft: `${heading.level * 8}px` }}
                    onClick={() =>
                      handleHeadingClick(heading, headingIndices[index])
                    }
                  >
                    <Smaller className='text-muted-foreground'>
                      {heading.text}
                    </Smaller>
                  </Button>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent
            value='info'
            className='flex-1 py-2 flex flex-col gap-5 overflow-hidden h-full'
          >
            {/* Detalhes do arquivo */}
            <div className='grid grid-cols-2 gap-2'>
              <Card size='sm' className='p-0 bg-muted m-0 max-w-30'>
                <CardHeader>
                  <CardTitle>{stats.words}</CardTitle>
                  <CardDescription className='text-xs'>
                    Palavras
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card size='sm' className='p-0 bg-muted m-0 max-w-30'>
                <CardHeader>
                  <CardTitle>{stats.chars}</CardTitle>
                  <CardDescription className='text-xs'>
                    Caracteres
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card size='sm' className='p-0 bg-muted m-0 max-w-30'>
                <CardHeader>
                  <CardTitle>{stats.paragraphs}</CardTitle>
                  <CardDescription className='text-xs'>
                    Parágrafos
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card size='sm' className='p-0 bg-muted m-0 max-w-30'>
                <CardHeader>
                  <CardTitle>{stats.readingTime}</CardTitle>
                  <CardDescription className='text-xs'>Leitura</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/*Edit by & Create by*/}
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col'>
                <Smaller className='text-muted-foreground'>Editado por</Smaller>
                <div className='flex items-center justify-between'>
                  <Small>
                    {document?.creator?.username ||
                      `Usuário #${document?.createdBy}`}
                  </Small>
                  <Small className='text-muted-foreground'>
                    {document?.updatedAt
                      ? new Date(document.updatedAt).toLocaleDateString()
                      : '-'}
                  </Small>
                </div>
              </div>

              <div className='flex flex-col'>
                <Smaller className='text-muted-foreground'>Criado por</Smaller>
                <div className='flex items-center justify-between'>
                  <Small>
                    {document?.creator?.username ||
                      `Usuário #${document?.createdBy}`}
                  </Small>
                  <Small className='text-muted-foreground'>
                    {document?.createdAt
                      ? new Date(document.createdAt).toLocaleDateString()
                      : '-'}
                  </Small>
                </div>
              </div>
            </div>

            {/* Version history */}
            <div className='flex flex-col gap-2'>
              <Smaller className='text-muted-foreground'>
                Histórico de versões
              </Smaller>
              <div className='flex flex-col gap-3'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='justify-start underline w-min'
                >
                  Versão atual
                </Button>
                {versions?.map((version) => (
                  <Button
                    key={version.id}
                    variant='ghost'
                    size='sm'
                    className='justify-start w-min'
                    onClick={() => setPreviewVersion(version)}
                  >
                    {new Date(version.createdAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent
            value='files'
            className='flex-1 py-2 overflow-hidden h-full'
          >
            <Smaller className='text-muted-foreground'>
              Nenhum arquivo anexado
            </Smaller>
          </TabsContent>
        </Tabs>
      </div>

      {/* Version preview modal */}
      <AlertDialog
        open={!!previewVersion}
        onOpenChange={(open) => !open && setPreviewVersion(null)}
      >
        <AlertDialogContent className='bg-background p-0 gap-0 max-w-3xl max-h-[80vh] overflow-hidden'>
          <AlertDialogHeader className='p-6 pb-0'>
            <AlertDialogTitle>
              Versão de{' '}
              {previewVersion &&
                new Date(previewVersion.createdAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className='p-6 overflow-y-auto max-h-[60vh]'>
            {previewVersion && (
              <TiptapEditor
                content={previewVersion.conteudo ?? ''}
                editable={false}
              />
            )}
          </div>
          <AlertDialogFooter className='bg-muted/50 p-3'>
            <AlertDialogCancel variant='outline' size='sm'>
              Fechar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
