"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface BannerProps {
  documentId: any;
}

export function Banner({ documentId }: BannerProps) {
  const router = useRouter();
  const remove = async ({ id }: { id: string }) => {
    const response = await fetch(`/api/notes?documentId=${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  };
  const restore = async ({ documentId }: { documentId: string }) => {
    console.log(documentId);
    const response = await fetch(`/api/notes?action=restore`, {
      method: "POST",
      body: JSON.stringify({ id: documentId }),
    });
    const data = await response.json();
    return data;
  };

  const onRemove = () => {
    const promise = remove({ id: documentId });

    toast.promise(promise, {
      loading: "Deleting note...",
      success: "Note deleted!",
      error: "Failed to delete note.",
    });
    router.push("/documents");
  };

  const onRestore = () => {
    const promise = restore({ documentId });
    toast.promise(promise, {
      loading: "Restoring note...",
      success: "Note restored!",
      error: "Failed to restore note.",
    });
  };

  return (
    <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex gap-x-2 justify-center items-center">
      <p>This page is in the Trash.</p>
      <Button
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2
      h-auto font-normal"
        variant="outline"
        size="sm"
        onClick={onRestore}
      >
        Restore page
      </Button>
      <ConfirmModal onConfirm={onRemove}>
        <Button
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2
      h-auto font-normal"
          variant="outline"
          size="sm"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  );
}
