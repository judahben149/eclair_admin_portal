import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  BlockTypeSelect,
  InsertCodeBlock,
  type MDXEditorMethods,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
  ({ value, onChange, placeholder, className, readOnly = false }, ref) => {
    const editorRef = useRef<MDXEditorMethods>(null);

    useImperativeHandle(ref, () => editorRef.current!);

    return (
      <div className={cn('mdx-editor-wrapper border rounded-lg overflow-hidden', className)}>
        <MDXEditor
          ref={editorRef}
          markdown={value}
          onChange={onChange}
          placeholder={placeholder || 'Start writing your content...'}
          readOnly={readOnly}
          contentEditableClassName="prose prose-sm max-w-none min-h-[120px] p-4"
          plugins={[
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin({
              imageUploadHandler: async () => {
                return Promise.resolve('https://via.placeholder.com/400x300');
              },
            }),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                javascript: 'JavaScript',
                typescript: 'TypeScript',
                jsx: 'JSX',
                tsx: 'TSX',
                css: 'CSS',
                html: 'HTML',
                json: 'JSON',
                python: 'Python',
                bash: 'Bash',
                dmx: 'DMX',
                console: 'Console',
              },
            }),
            diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: value }),
            frontmatterPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                  <BlockTypeSelect />
                  <ListsToggle />
                  <CreateLink />
                  <InsertImage />
                  <InsertTable />
                  <InsertThematicBreak />
                  <InsertCodeBlock />
                </>
              ),
            }),
          ]}
        />
      </div>
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';
