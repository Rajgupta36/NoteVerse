"use client";

import { useEffect, useState } from "react";
import { Toolbar } from "@/components/Toolbar";
import { Cover } from "@/components/Cover";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { useRecoilState } from "recoil";
import { collabrateAtom } from "@/store/atom";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export default function Page() {
  const params = new URLSearchParams(window.location.search);
  const documentId = params.get("docid");
  const [document, setDocument] = useState<any>(null);
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isCollaborative, setCollaborative] = useRecoilState(collabrateAtom);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `/api/notes?action=getById&documentId=${documentId}`
        );
        if (!response.ok) throw new Error("Failed to fetch document");
        const doc = await response.json();
        setDocument(doc);
        setContent(doc.content ?? "");
        setCollaborative(doc.isCollaborative);
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Failed to load document.");
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleContentChange = (newContent: string) => {
    console.log("hiii");
    console.log(isCollaborative);
  };

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
        <Editor
          onChange={handleContentChange}
          initialContent={content}
          documentId={documentId as string}
          editable={true}
          isCollaborative={isCollaborative}
        />
      </div>
    </div>
  );
}
