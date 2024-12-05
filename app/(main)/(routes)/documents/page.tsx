'use client';

import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DocumentsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    setLoading(true);
    try {
      // Create context object
      const context = { title: 'Untitled' };

      // Call API route to create the document
      const response = await fetch('/api/notes?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error('Failed to create a new note');
      }

      const data = await response.json();
      console.log(data);

      if (data) {
        toast.success('New note created');
      } else {
        toast.error('Failed to create a new note');
      }
    } catch (error) {
      toast.error('Failed to create a new note');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full space-y-4">
      <Image
        className="dark:hidden"
        src="/empty.png"
        alt="Empty"
        width="300"
        height="300"
      />
      <Image
        className="hidden dark:block"
        src="/empty-dark.png"
        alt="Empty"
        width="300"
        height="300"
      />
      <h2 className="text-lg font-medium">
        Welcome to {user?.firstName}&apos;s NoteVerse
      </h2>
      <Button onClick={onCreate} disabled={loading}>
        <PlusCircle className="w-4 h-4 mr-2" />
        {loading ? 'Creating...' : 'Create note'}
      </Button>
    </div>
  );
}
