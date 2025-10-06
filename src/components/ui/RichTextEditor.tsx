import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, List, ListOrdered, Link as LinkIcon, 
  Heading2, Quote, Undo, Redo, Code
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  minHeight?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Start writing...',
  className,
  editable = true,
  minHeight = '150px'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none p-4',
          'prose-headings:text-foreground prose-p:text-foreground',
          'prose-strong:text-foreground prose-em:text-muted-foreground',
          'prose-a:text-primary prose-blockquote:text-muted-foreground',
          'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
          'prose-pre:bg-muted prose-pre:text-foreground',
          'prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground',
        ),
        style: `min-height: ${minHeight}`,
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const MenuButton = ({ 
    onClick, 
    isActive, 
    children, 
    title,
    disabled = false
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'p-2 rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        isActive && 'bg-muted text-primary'
      )}
    >
      {children}
    </button>
  );

  if (!editable) {
    return (
      <div className={cn('prose prose-sm max-w-none', className)}>
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className={cn('border rounded-lg bg-card overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/30">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Cmd+B)"
        >
          <Bold className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Cmd+I)"
        >
          <Italic className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code (Cmd+E)"
        >
          <Code className="h-4 w-4" />
        </MenuButton>

        <div className="w-px bg-border mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </MenuButton>

        <div className="w-px bg-border mx-1" />

        <MenuButton
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </MenuButton>

        <div className="flex-1" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Cmd+Z)"
        >
          <Undo className="h-4 w-4" />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </MenuButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
