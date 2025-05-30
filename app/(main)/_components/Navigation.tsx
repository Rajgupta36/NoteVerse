'use client';
import React, { ElementRef, useEffect, useRef, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
} from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { UserItem } from './user-item';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { useSearch } from '@/hooks/use-search';
import { useSettings } from '@/hooks/use-settings';

import { Item } from './Item';
import { DocumentList } from './document-list';
import { TrashBox } from './trash-box';
import { Navbar } from './Navbar';

export function Navigation() {
  const router = useRouter();
  const settings = useSettings();
  const search = useSearch();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<'aside'>>(null);
  const navbarRef = useRef<ElementRef<'div'>>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  const [refreshDocs, setRefreshDocs] = useState(false);
  const [newdocs, setNewDocs] = useState<any[]>([]);
  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty('left', `${newWidth}px`);
      navbarRef.current.style.setProperty(
        'width',
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? '100%' : '240px';
      navbarRef.current.style.setProperty(
        'width',
        isMobile ? '0' : 'calc(100% - 240px)'
      );
      navbarRef.current.style.setProperty('left', isMobile ? '100%' : '240px');
      setTimeout(() => {
        setIsResetting(false);
      }, 300);
    }
  };

  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = '0';
      navbarRef.current.style.setProperty('width', '100%');
      navbarRef.current.style.setProperty('left', '0');
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  const onCreate = async () => {
    try {
      const context = { title: 'Untitled' };
      const response = await fetch('/api/notes?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      const promise = response.ok
        ? Promise.resolve(response)
        : Promise.reject(response);
      toast.promise(promise, {
        loading: 'Creating page...',
        success: 'Page created!',
        error: 'Failed to create page',
      });
      const data = await response.json();
      setNewDocs(data);
      router.push(`/documents/${data.id}`);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <aside
        className={cn(
          `group/sidebar h-full bg-secondary overflow-y-auto relative flex flex-col w-60 z-[99999]`,
          isResetting && 'transition-all ease-in-out duration-300',
          isMobile && 'w-0'
        )}
        ref={sidebarRef}
      >
        <div>
          <div
            className={cn(
              `w-6 h-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute
        top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition`,
              isMobile && 'opacity-100'
            )}
            onClick={collapse}
            role="button"
          >
            <ChevronsLeft className="w-6 h-6" />
          </div>
          <div>
            <UserItem />
            <Item
              label="Search"
              icon={Search}
              isSearch
              onClick={search.onOpen}
            />
            <Item label="Settings" icon={Settings} onClick={settings.onOpen} />
            <Item onClick={onCreate} label="New page" icon={PlusCircle} />
          </div>
          <div className="mt-4">
            <DocumentList newdocs={newdocs} />
            <Item onClick={onCreate} icon={Plus} label="Add a page" />
            <Popover>
              <PopoverTrigger className="w-full mt-4">
                <Item label="Trash" icon={Trash} />
              </PopoverTrigger>
              <PopoverContent
                className="p-0 w-72 "
                side={isMobile ? 'bottom' : 'right'}
              >
                <TrashBox />
              </PopoverContent>
            </Popover>
          </div>
          <div
            className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10
        right-0 top-0"
            onMouseDown={handleMouseDown}
            onClick={resetWidth}
          ></div>
        </div>
      </aside>
      <div
        className={cn(
          `absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]`,
          isResetting && 'transition-all ease-in-out duration-300',
          isMobile && 'left-0 w-full'
        )}
        ref={navbarRef}
      >
        {!!params.documentId ? (
          <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full">
            {isCollapsed && (
              <MenuIcon
                className="w-6 h-6 text-muted-foreground"
                onClick={resetWidth}
                role="button"
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
}
