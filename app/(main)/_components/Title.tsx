"use client";

import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TitleProps {
  initialData: any;
}

export function Title({ initialData }: TitleProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialData.title || "Untitled");
  const [isEditing, setIsEditing] = useState(false);

  // Function to update the title in the backend
  const update = async ({ id, tit }: { id: string; tit: string }) => {
    console.log("Updating title:", tit); // Debug log for tracking the update

    try {
      const response = await fetch("/api/notes?action=update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          updatedContent: { title: tit },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update title");
      }
      const res = await response.json();
      console.log("Updated Response:", res);

      // Update the title with the response from the server
      setTitle(res.title);
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  // Enable input and set focus to the field
  const enableInput = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  // Disable input when done editing
  const disableInput = () => {
    setIsEditing(false);
    // Update the title in the backend only when editing is done (blur or Enter)
    update({
      id: initialData.id,
      tit: title || "Untitled", // Default to "Untitled" if title is empty
    });
  };

  // Handle title change
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  // Handle keyboard events (for pressing Enter)
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      disableInput();
    }
  };

  return (
    <div className="flex gap-x-1 items-center">
      {!!initialData.icon && <p>{initialData.icon}</p>}
      {isEditing ? (
        <Input
          className="h-7 px-2 focus-visible:ring-transparent"
          ref={inputRef}
          onBlur={disableInput}
          value={title}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      ) : (
        <Button
          className="font-normal h-auto p-1"
          variant="ghost"
          size="sm"
          onClick={enableInput}
        >
          <span className="truncate">{title}</span>
        </Button>
      )}
    </div>
  );
}

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="w-20 h-8 rounded-md" />;
};
