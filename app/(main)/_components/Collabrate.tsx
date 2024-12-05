"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Globe } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { useOrigin } from "@/hooks/use-origin";
import { Button } from "@/components/ui/button";
import { useRecoilState } from "recoil";
import { collabrateAtom } from "@/store/atom";

interface Collabrate {
  initialData: any;
}

export function Collabrate({ initialData }: Collabrate) {
  const origin = useOrigin();
  const [isCollaborative, setIsCollaborative] = useState<boolean>(
    initialData?.isCollaborative ?? false
  );
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [atom, setAtom] = useRecoilState(collabrateAtom);
  const url = `${origin}/Collabrate?docId${initialData.id}`;

  useEffect(() => {
    console.log("isCollaborative", isCollaborative);
    setAtom(isCollaborative);
  }, [isCollaborative]);

  const update = async ({
    id,
    isCollaborative,
  }: {
    id: string;
    isCollaborative: boolean;
  }) => {
    try {
      const response = await fetch("/api/notes?action=update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          updatedContent: { isCollaborative },
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          errorDetails.message || "Could not update collaboration status."
        );
      }
      setIsCollaborative(isCollaborative);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const enableCollaboration = () => {
    setIsSubmitting(true);
    const promise = update({
      id: initialData.id,
      isCollaborative: true,
    }).finally(() => setIsSubmitting(false));

    toast.promise(promise, {
      loading: "Enabling collaboration...",
      success: "Collaboration enabled!",
      error: "Failed to enable collaboration.",
    });
  };

  const disableCollaboration = () => {
    setIsSubmitting(true);
    const promise = update({
      id: initialData.id,
      isCollaborative: false,
    }).finally(() => setIsSubmitting(false));

    toast.promise(promise, {
      loading: "Disabling collaboration...",
      success: "Collaboration disabled!",
      error: "Failed to disable collaboration.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 1000);
      })
      .catch(() => {
        toast.error("Failed to copy the link.");
      });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost">
          Collaboration
          {isCollaborative && <Globe className="text-sky-500 w-4 h-4 ml-2" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end" alignOffset={8} forceMount>
        {isCollaborative ? (
          <div className="space-y-4">
            <div className="flex gap-x-2 items-center">
              <Globe className="text-sky-500 animate-pulse w-4 h-4" />
              <p className="text-xs font-medium text-sky-500">
                Collaboration enabled
              </p>
            </div>
            <div className="flex items-center">
              <input
                className="flex-1 px-2 text-xs border rounded-l-md h-8 bg-muted truncate"
                value={url}
                readOnly
              />
              <Button
                className="h-8 rounded-l-none"
                onClick={copyToClipboard}
                disabled={isSubmitting}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <Button
              className="w-full text-xs"
              size="sm"
              disabled={isSubmitting}
              onClick={disableCollaboration}
            >
              Disable Collaboration
            </Button>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <Globe className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-2">Enable Collaboration</p>
            <span className="text-xs text-muted-foreground mb-4">
              Allow others to work on this note with you.
            </span>
            <Button
              className="w-full text-xs"
              size="sm"
              disabled={isSubmitting}
              onClick={enableCollaboration}
            >
              Enable Collaboration
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
