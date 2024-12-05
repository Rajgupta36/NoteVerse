'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Toolbar } from '@/components/Toolbar';
import { Cover } from '@/components/Cover';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner'; // Assuming you're using this for toast notifications

interface DocumentIdPageProps {
  params: {
    documentId: string;
  };
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  const [document, setDocument] = useState<any>(undefined); // Document state (undefined for loading)
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const Editor = useMemo(
    () => dynamic(() => import('@/components/Editor'), { ssr: false }),
    []
  );

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      const response = await fetch(
        `/api/notes?action=getById&documentId=${params.documentId}`
      );
      if (!response.ok) {
        toast.error('Failed to fetch document');
        setIsLoading(false);
        return;
      }
      const doc = await response.json();
      setDocument(doc);
      setIsLoading(false);
    };
    fetchDocument();
  }, [params.documentId]);

  // Function to update the document content
  const updateDocument = async (content: string) => {
    try {
      const response = await fetch('/api/notes?action=update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: params.documentId, content }),
      });
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      const updatedDoc = await response.json();
      toast.success('Document updated successfully');
      setDocument(updatedDoc); // Update document state after successful update
    } catch (error) {
      toast.error('Failed to update document');
    }
  };

  const onChange = (content: string) => {
    updateDocument(content);
  };

  // Loading skeleton
  if (isLoading || document === undefined) {
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

  // Document not found
  if (document === null) {
    return <div>Not Found</div>;
  }

  return (
    <div className="pb-40">
      <Cover preview url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar preview initialData={document} />
        <Editor
          editable={false}
          onChange={onChange}
          initialContent={document.content}
        />
      </div>
    </div>
  );
}
