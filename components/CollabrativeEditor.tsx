'use client';

import { BlockNoteView, useBlockNote } from '@blocknote/react';
import '@blocknote/core/style.css';
import { useTheme } from 'next-themes';
import { useEdgeStore } from '@/lib/edgestore';
import { useCollaboration } from '@/hooks/useCollabration';
import { useEffect } from 'react';

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
  documentId: string;
  isCollaborative: boolean;
  username: string;
}

function CollabrativeEditor({
  onChange,
  initialContent,
  editable,
  documentId,
  isCollaborative,
  username,
}: EditorProps) {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const { ydoc, provider } = useCollaboration(documentId);
  console.log('collabrative editor render ydoc', ydoc, 'provider', provider);
  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };
  useEffect(() => {
    return () => {
      if (ydoc) {
        ydoc.destroy();
      }
    };
  }, [ydoc]);
  // Initialize the editor
  const editor = useBlockNote(
    ydoc
      ? {
          collaboration: {
            fragment: ydoc?.getXmlFragment('document-store'),
            provider,
            user: {
              name: username || 'guest-' + Math.floor(Math.random() * 1000),
              color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            },
          },
        }
      : undefined,
    [ydoc]
  );

  if (!editor) return null;

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        className="min-h[70vh]"
      />
    </div>
  );
}

export default CollabrativeEditor;
