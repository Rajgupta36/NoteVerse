'use client';

import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronRight,
  LucideIcon,
  MoreHorizontal,
  Plus,
  Trash,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface ItemProps {
  id?: any;
  documentIcon?: string;
  active?: boolean;
  expanded?: boolean;
  isSearch?: boolean;
  level?: number;
  onExpand?: () => void;
  label: string;
  onClick?: () => void;
  icon: LucideIcon;
  setDocuments?: () => void;
}

export function Item({
  id,
  label,
  onClick,
  icon: Icon,
  active,
  documentIcon,
  isSearch,
  level = 0,
  onExpand,
  expanded,
  setDocuments,
}: ItemProps) {
  const { user } = useUser();
  const router = useRouter();

  // Create a new note with the given title and parent document
  const create = async (data: any) => {
    const { title, parentDocument } = data;
    const response = await fetch('/api/notes?action=create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, parentDocument: parentDocument || null }),
    });
    const res = await response.json();
    return res;
  };

  // Archive a note by moving it to the trash
  const archive = async ({ documentId }: { documentId: string }) => {
    const response = await fetch(`/api/notes?action=archive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });
    const data = await response.json();
    return data;
  };

  const onArchive = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if (!id) return;

    try {
      const promise = archive({ documentId: id });

      toast.promise(promise, {
        loading: 'archiving note...',
        success: 'note archived',
        error: 'Failed to archive note',
      });

      promise.then((data) => {
        console.log(data);
        if (setDocuments) {
          //@ts-ignore
          setDocuments((prevDocuments: any) => {
            return prevDocuments.filter((doc: any) => doc.id !== id);
          });
        }
        router.push(`/documents/${id}`);
      });
    } catch (error) {
      console.log(error);
      toast.error('Failed to move note to trash');
    }
  };

  // Handle the expansion of the document (to show its children)
  const handleExpand = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onExpand?.();
  };

  // Handle the creation of a new note as a child of the current document
  const onCreate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (!id) return;
    const promise = create({ title: 'Untitled', parentDocument: id });

    toast.promise(promise, {
      loading: 'Creating a new note...',
      success: 'New note created!',
      error: 'Failed to create a new note',
    });

    promise.then((data) => {
      if (setDocuments) {
        //@ts-ignore
        setDocuments((prevDocuments) => [...prevDocuments, data]);
      }
      router.push(`/documents/${data.id}`);
    });
  };

  const ChevronIcon = expanded ? ChevronDown : ChevronRight;

  return (
    <div
      className={cn(
        `group min-h-[27px] text-sm py-1 pr-3 w-full hover:bg-primary/5
    flex items-center text-muted-foreground font-medium`,
        active && 'bg-primary/5 text-primary'
      )}
      onClick={onClick}
      role="button"
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : '12px' }}
    >
      {/* Expand icon */}
      {!!id && (
        <div
          className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1"
          onClick={handleExpand}
          role="button"
        >
          <ChevronIcon className="w-4 h-4 shrink-0 text-muted-foreground/50" />
        </div>
      )}

      {/* Document Icon */}
      {documentIcon ? (
        <div className="shrink-0 mr-2 text-[18px]">{documentIcon}</div>
      ) : (
        <Icon className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground" />
      )}
      <span className="truncate">{label}</span>

      {/* Search shortcut */}
      {isSearch && (
        <kbd
          className="ml-auto pointer-events-none inline-flex gap-1 items-center h-5 select-none rounded border
        bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
        >
          <span className="text-xs">⌘</span>K
        </kbd>
      )}

      {/* Actions menu */}
      {!!id && (
        <div className="ml-auto flex items-center gap-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <div
                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm
              hover:bg-neutral-300 dark:hover:bg-neutral-600"
                role="button"
              >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-60"
              align="start"
              side="right"
              forceMount
            >
              {/* Archive/Trash option */}
              <DropdownMenuItem onClick={onArchive}>
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Last edited info */}
              <div className="text-xs text-muted-foreground p-2">
                Last edited by: {user?.fullName}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create new note button */}
          <div
            className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
            role="button"
            onClick={onCreate}
          >
            <Plus className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}

Item.Skeleton = function ItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      className="flex gap-x-2 py-[3px]"
      style={{ paddingLeft: level ? `${level * 12 + 25}px` : '12px' }}
    >
      <Skeleton className="w-4 h-4" />
      <Skeleton className="w-4 h-[30%]" />
    </div>
  );
};
