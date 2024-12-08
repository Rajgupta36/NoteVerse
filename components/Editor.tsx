import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { BlockNoteView, useBlockNote } from '@blocknote/react';
import '@blocknote/core/style.css';
import { useTheme } from 'next-themes';
import { useEdgeStore } from '@/lib/edgestore';
import '@blocknote/core/style.css';

interface EditorProps {
  onChange?: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
  documentId?: string;
}

function Editor({
  onChange,
  initialContent,
  editable,
  documentId,
}: EditorProps) {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  console.log('initial content', initialContent);
  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  // Initialize the editor
  const editor: BlockNoteEditor | null = useBlockNote({
    editable,
    enableBlockNoteExtensions: true,
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    uploadFile: handleUpload,
  });

  if (!editor) return null;

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}

export default Editor;
