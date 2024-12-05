'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, Trash, Undo } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/spinner';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/modals/confirm-modal';

export function TrashBox() {
  const [documents, setDocuments] = useState<any[]>();
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    const documents = async () => {
      const response = await fetch(`/api/notes?action=getTrash`);
      const data = await response.json();
      return data;
    };
    documents().then((data) => setDocuments(data));
  }, []);
  const restore = async ({ id }: { id: string }) => {
    console.log('id is ', id);
    const response = await fetch(`/api/notes?action=restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    return data;
  };
  const remove = async ({ id }: { id: string }) => {
    const response = await fetch(`/api/notes?action=delete&documentId=${id}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data;
  };

  const [search, setSearch] = useState('');

  const filteredDocuments = documents?.filter((document) => {
    return document.title.toLowerCase().includes(search.toLocaleLowerCase());
  });

  const onClick = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  const onRestore = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    documentId: string
  ) => {
    event.stopPropagation();

    const promise = restore({ id: documentId });

    toast.promise(promise, {
      loading: 'Restoring note...',
      success: 'Note restored!',
      error: 'Failed to restore note',
    });
    promise.then(() => {
      setDocuments((prevDocuments) =>
        prevDocuments?.filter((doc) => doc.id !== documentId)
      );
    });
  };

  const onRemove = (documentId: string) => {
    const promise = remove({ id: documentId });

    toast.promise(promise, {
      loading: 'Deleting note...',
      success: 'Note deleted!',
      error: 'Failed to delete note',
    });
    promise.then(() => {
      setDocuments((prevDocuments) =>
        prevDocuments?.filter((doc) => doc.id !== documentId)
      );
    });

    if (params.documentId === documentId) {
      router.push('/documents');
    }
  };

  if (documents === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="text-sm">
      <div className="flex items-center gap-x-1 p-2">
        <Search className="w-4 h-4" />
        <Input
          className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by page title..."
        />
      </div>
      <div className="mt-2 px-1 pb-1">
        <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
          No documents found
        </p>
        {filteredDocuments?.map((document) => (
          <div
            className="text-sm rounded-sm w-full hover:bg-primary/5 flex justify-between items-center text-primary"
            key={document._id}
            role="button"
            onClick={() => onClick(document.id)}
          >
            <span className="truncate pl-2">{document.title}</span>
            <div className="flex items-center">
              <div
                className="rounded-sm p-2 hover:bg-neutral-200 
              dark:hover:bg-neutral-600"
                onClick={(e) => onRestore(e, document.id)}
              >
                <Undo className="w-4 h-4 text-muted-foreground" />
              </div>
              <ConfirmModal onConfirm={() => onRemove(document.id)}>
                <div
                  className="rounded-sm p-2 hover:bg-neutral-200
                dark:hover:bg-neutral-600"
                  role="button"
                >
                  <Trash className="w-4 h-4 text-muted-foreground" />
                </div>
              </ConfirmModal>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
