'use client';

import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useRef } from 'react';
import { Markdown } from 'tiptap-markdown';

interface EditorProps {
  initialContent?: string | null;
  editable?: boolean;
  onUpdate?: (markdown: string) => void;
}

export function Editor({
  initialContent,
  editable = true,
  onUpdate,
}: EditorProps) {
  const hasSetContent = useRef(false);

  const editor = useEditor({
    editable,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Comece a escrever...',
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Color,
      TextStyle,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      Markdown,
    ],
    content: initialContent ?? '',
    immediatelyRender: false,
    onUpdate: onUpdate
      ? ({ editor }) => {
          const md = (
            editor.storage as Record<string, any>
          ).markdown.getMarkdown() as string;
          onUpdate(md);
        }
      : undefined,
    onCreate: ({ editor }) => {
      if (!hasSetContent.current && initialContent) {
        hasSetContent.current = true;
        editor.commands.setContent(initialContent);
      }
    },
  });

  return (
    <EditorContent
      editor={editor}
      className='prose prose-neutral dark:prose-invert max-w-none'
    />
  );
}
