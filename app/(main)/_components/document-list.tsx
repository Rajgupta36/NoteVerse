import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Item } from "./Item";
import { FileIcon } from "lucide-react";
import { toast } from "sonner";

interface DocumentListProps {
  newdocs?: any;
  parentDocumentId?: any;
  level?: number;
}

export function DocumentList({
  newdocs,
  parentDocumentId,
  level = 0,
}: DocumentListProps) {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) => ({
      ...prevExpanded,
      [documentId]: !prevExpanded[documentId],
    }));
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/notes?action=getSideBar&parentId=${parentDocumentId}`
        );

        if (!response.ok) {
          throw new Error("Failed to get notes");
        }

        const data = await response.json();
        setDocuments(data || []);
        setIsLoading(false);
        toast.success("Notes fetched successfully");
      } catch (error) {
        toast.error("Failed to get notes");
        console.error(error);
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [parentDocumentId]);

  useEffect(() => {
    if (!newdocs) return;
    setDocuments((prevDocs) => {
      const documentExists = prevDocs.some((doc) => doc.id === newdocs.id);
      if (documentExists) return prevDocs;
      return [...prevDocs, newdocs];
    });
  }, [newdocs?.id]);

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  if (isLoading) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <p
        className={cn(
          `hidden text-sm font-medium text-muted-foreground/80`,
          expanded && "last:block",
          level === 0 && "hidden"
        )}
        style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
      >
        No pages available
      </p>
      {documents.map((document) => (
        <div key={document.id}>
          <Item
            id={document.id}
            onClick={() => onRedirect(document.id)}
            label={document.title}
            icon={FileIcon}
            documentIcon={document.icon}
            active={params.documentId === document.id}
            level={level}
            onExpand={() => onExpand(document.id)}
            expanded={expanded[document.id]}
            //@ts-ignore
            setDocuments={setDocuments}
          />
          {expanded[document.id] && (
            <DocumentList parentDocumentId={document.id} level={level + 1} />
          )}
        </div>
      ))}
    </>
  );
}
