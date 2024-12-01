"use client";

import { useEffect, useState } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Cover } from "@/components/Cover";
import { Skeleton } from "@/components/ui/skeleton";
import Editor from "@/components/Editor";

interface DocumentIdPageProps {
  params: {
    documentId: string;
  };
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  const [document, setDocument] = useState<any>(null);
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `/api/notes?action=getById&documentId=${params.documentId}`
        );
        if (!response.ok) throw new Error("Failed to fetch document");
        const doc = await response.json();
        setDocument(doc);
        setContent(doc.content ?? "");
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Failed to load document.");
      }
    };

    fetchDocument();
  }, [params.documentId]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateDocument = async () => {
      if (!content || !document) return;

      try {
        const response = await fetch(`/api/notes?action=update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: params.documentId,
            updatedContent: {
              title: document.title,
              content: content,
              isPublished: document.isPublished,
              coverImage: document.coverImage,
              icon: document.icon,
            },
          }),
        });

        if (!response.ok) throw new Error("Failed to update document");
      } catch (error) {
        console.error("Error updating document:", error);
        setError("Failed to update document.");
      }
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDocument, 500);
    };

    debouncedUpdate();

    return () => clearTimeout(timeoutId);
  }, [content, document, params.documentId]);

  if (!document) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-14 w-[80%]" />
            <Skeleton className="h-14 w-[40%]" />
            <Skeleton className="h-14 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) return <div>{error}</div>;

  return (
    <div className="pb-40">
      <Cover url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
        <Editor onChange={setContent} initialContent={content} />
      </div>
    </div>
  );
}
