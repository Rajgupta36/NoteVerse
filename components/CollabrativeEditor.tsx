"use client";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";
import { useCollaboration } from "@/hooks/useCollabration";
import { useEffect } from "react";

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

  // Handle file uploads
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
  console.log("document", ydoc, "provider", provider);
  const editor = useBlockNote(
    ydoc
      ? {
          editable,
          onEditorContentChange: (editor) => {
            onChange(JSON.stringify(editor.topLevelBlocks, null, 2));
          },
          uploadFile: handleUpload,
          collaboration: {
            fragment: ydoc?.getXmlFragment("document-store"),
            provider,
            user: {
              name: username || "guest-" + Math.floor(Math.random() * 1000),
              color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
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
        theme={resolvedTheme === "dark" ? "dark" : "light"}
      />
    </div>
  );
}

export default CollabrativeEditor;
