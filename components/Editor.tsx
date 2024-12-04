"use client";

import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";
import { useCollaboration } from "@/hooks/useCollabration";
import { useEffect, useState } from "react";

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
  documentId: string;
  isCollaborative: boolean;
}

function Editor({
  onChange,
  initialContent,
  editable,
  documentId,
  isCollaborative,
}: EditorProps) {
  // Declare ydoc and provider at the top level
  const [ydoc, setYdoc] = useState<any | null>(null);
  const [provider, setProvider] = useState<any | null>(null);

  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  // Setup collaboration state
  useEffect(() => {
    if (!isCollaborative) {
      //
      const { ydoc, provider } = useCollaboration(documentId);
      setYdoc(ydoc);
      setProvider(provider);
    }
    console.log(
      "Editor re-rendered due to isCollaborative change:",
      isCollaborative
    );
  }, [isCollaborative, documentId]); // Update when `isCollaborative` or `documentId` changes

  // Handle file uploads
  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  // Initialize the editor
  const editor: BlockNoteEditor | null = useBlockNote({
    editable,
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    onEditorContentChange: (editor) => {
      onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
    },
    uploadFile: handleUpload,
    collaboration: isCollaborative
      ? {
          provider,
          fragment: ydoc?.getXmlFragment("document"),
          user: {
            name: "User " + Math.floor(Math.random() * 100),
            color: "#" + Math.floor(Math.random() * 16777215).toString(16),
          },
        }
      : undefined,
  });

  if (!editor) return null;

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  );
}

export default Editor;
