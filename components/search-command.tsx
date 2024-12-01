"use client";

import { File } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSearch } from "@/hooks/use-search";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function SearchCommand() {
  const { user } = useUser();
  const router = useRouter();
  const [documents, setDocument] = useState<any[]>([]);
  useEffect(() => {
    const onCreate = async () => {
      try {
        // Call API route to create the document
        const response = await fetch("/api/notes?action=getAll", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to Load docs");
        }

        const data = await response.json();
        console.log(data);

        if (data) {
          console.log(data);
          setDocument(data);
        } else {
          toast.error("Failed to Load docs");
        }
      } catch (error) {
        toast.error("Failed to Load docs");
        console.error(error);
      }
    };
    onCreate();
  }, []);
  const [isMounted, setIsMounted] = useState(false);

  const toggle = useSearch((store) => store.toggle);
  const isOpen = useSearch((store) => store.isOpen);
  const onClose = useSearch((store) => store.onClose);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const onSelect = (key: string) => {
    let id = key.split("secret")[0];
    router.push(`/documents/${id}`);
    onClose();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <CommandInput placeholder={`Search ${user?.fullName}'s NoteVerse`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Documents">
          {documents?.map((document) => (
            <CommandItem
              key={document?.id}
              value={`${document.id}secret${document.title}`}
              title={document.title}
              onSelect={onSelect}
            >
              {document.icon ? (
                <p className="mr-2 text-[18px]">{document.icon}</p>
              ) : (
                <File className="w-4 h-4 mr-2" />
              )}
              <span>{document.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
