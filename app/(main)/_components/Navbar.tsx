'use client';
import { useParams } from 'next/navigation';
import { MenuIcon } from 'lucide-react';
import { Title } from './Title';
import { Banner } from './Banner';
import { Menu } from './Menu';
import { Publish } from './Publish';
import { Collabrate } from './Collabrate';
import { useEffect, useState } from 'react';
interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}
export function Navbar({ isCollapsed, onResetWidth }: NavbarProps) {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const params = useParams();
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `/api/notes?action=getById&documentId=${params.documentId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }
        const doc = await response.json();
        setDocument(doc);
      } catch (error: any) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params.documentId]);

  if (loading) {
    return (
      <nav
        className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full
      flex justify-between gap-x-4"
      >
        <Title.Skeleton />
        <div className="flex gap-x-2 items-center">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (document === null) {
    return null;
  }

  return (
    <>
      <nav
        className="bg-background dark:bg-[#1F1F1F] px-3 py-2 w-full
      flex gap-x-4 items-center"
      >
        {isCollapsed && (
          <MenuIcon
            className="w-6 h-6 text-muted-foreground"
            role="button"
            onClick={onResetWidth}
          />
        )}
        <div className="flex justify-between items-center w-full">
          <Title initialData={document} />
          <div className="flex gap-x-2 items-center">
            <Collabrate initialData={document} />
            <Publish initialData={document} />
            <Menu documentId={document.id} />
          </div>
        </div>
      </nav>
      {document.isArchived && <Banner documentId={document.id} />}
    </>
  );
}
