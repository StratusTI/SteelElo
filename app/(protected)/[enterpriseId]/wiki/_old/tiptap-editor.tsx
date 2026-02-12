'use client';

import { Color } from '@tiptap/extension-color';
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
import { useEffect, useRef } from 'react';
import { Markdown } from 'tiptap-markdown';

interface TiptapEditorProps {
  content: string;
  onChange?: (markdown: string) => void;
  editorRef?: React.MutableRefObject<ReturnType<typeof useEditor> | null>;
  editable?: boolean;
}

export function TiptapEditor({
  content,
  onChange,
  editorRef,
  editable = true,
}: TiptapEditorProps) {
  const isInitialContent = useRef(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extensions: any[] = [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Image,
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Markdown.configure({
      html: false,
      transformPastedText: true,
      transformCopiedText: true,
    }),
  ];

  if (editable) {
    extensions.push(
      Placeholder.configure({
        placeholder: 'Comece a escrever...',
      }),
    );
  }

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions,
    content,
    editorProps: {
      attributes: {
        class: editable
          ? 'prose prose-sm dark:prose-invert max-w-none min-h-96 outline-none focus:outline-none'
          : 'prose prose-sm dark:prose-invert max-w-none outline-none focus:outline-none',
      },
    },
    onUpdate: editable
      ? ({ editor }) => {
          if (!isInitialContent.current && onChange) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const markdownStorage = (editor.storage as any).markdown as {
              getMarkdown: () => string;
            };
            onChange(markdownStorage.getMarkdown());
          }
        }
      : undefined,
  });

  useEffect(() => {
    if (editor && editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  useEffect(() => {
    if (editor && content && isInitialContent.current) {
      isInitialContent.current = false;
    }
  }, [editor, content]);

  return <EditorContent editor={editor} />;
}
