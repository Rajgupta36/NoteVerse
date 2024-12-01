"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { MoreHorizontal, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface MenuProps {
  documentId: string;
}

export function Menu({ documentId }: MenuProps) {
  const router = useRouter();
  const { user } = useUser();

  const archive = async ({ documentId }: { documentId: string }) => {
    const response = await fetch(`/api/notes?action=archive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentId }),
    });
    const data = await response.json();
    return data;
  };

  const onArchive = () => {
    const promise = archive({ documentId });

    toast.promise(promise, {
      loading: "Moving to trash...",
      success: "Note Moved to trash!",
      error: "Failed to archive note.",
    });
    router.push("/documents");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60"
        align="end"
        alignOffset={8}
        forceMount
      >
        <DropdownMenuItem onClick={onArchive}>
          <Trash className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground p-2">
          Last edited by: {user?.fullName}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="w-10 h-10" />;
};
