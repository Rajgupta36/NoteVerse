"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Editor from "@/components/Editor";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";

export default function GuestCollaborationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [documentData, setDocumentData] = useState(null);
  const [error, setError] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const linkId = searchParams.get("linkId");
  const guestId = useState(() => nanoid(8))[0]; // Use useState to keep guestId stable across re-renders

  const handleJoin = async () => {
    if (!guestName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch("/api/request-collab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaborationLink: linkId,
          isGuest: true,
          guestId,
          guestName,
        }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setDocumentData(data);
      }
    } catch (err) {
      setError("Failed to join collaboration");
    } finally {
      setIsJoining(false);
    }
  };

  const handleEditorChange = (content: any) => {
    // Implement real-time updates here
    console.log("Document content changed:", content);
    // You should send this update to your backend or WebSocket server
  };

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!documentData) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Join Collaboration</h1>
        <div className="space-y-4">
          <Input
            placeholder="Enter your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            aria-label="Your name"
          />
          <Button onClick={handleJoin} disabled={isJoining}>
            {isJoining ? "Joining..." : "Join Collaboration"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Guest Collaboration</h1>
      <Editor
        //@ts-ignore
        initialContent={documentData.content}
        editable={true}
        onChange={handleEditorChange}
      />
    </div>
  );
}
