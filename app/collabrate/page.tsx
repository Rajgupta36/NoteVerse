"use client";

import { useEffect, useState, useCallback } from "react";
import { Cover } from "@/components/Cover";
import { Skeleton } from "@/components/ui/skeleton";
import CollabrativeEditor from "@/components/CollabrativeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CollaboratePage() {
  const [document, setDocument] = useState<any>(null);
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState<string>("");
  const [documentId, setDocumentId] = useState<string>("");
  const [accessStatus, setAccessStatus] = useState<
    "idle" | "requested" | "granted" | "denied"
  >("idle");

  // Function to handle WebSocket connection
  const connectWebSocket = useCallback(() => {
    // Check if the socket is already connected
    if (socket && socket.readyState === WebSocket.OPEN) {
      return; // Socket is already open, no need to connect again
    }

    const ws = new WebSocket("ws://localhost:1234");

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "ACCESS_REQUESTED":
          setAccessStatus("requested");
          setDocument("content is ", data.content);
          console.log(data.content);
          break;
        case "ACCESS_GRANTED":
          setAccessStatus("granted");
          break;
        case "ACCESS_DENIED":
          setAccessStatus("denied");
          setError(data.message);
          break;
        default:
          console.log("Unknown message type:", data.type);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setSocket(null); // Set socket to null on disconnect
      setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
    };

    setSocket(ws); // Set the socket state after it's created
  }, [username, socket]); // Depend on username and socket to ensure connection is managed correctly

  // Handle the username input and WebSocket connection setup
  const handleRequestAccess = () => {
    if (username && accessStatus === "idle") {
      connectWebSocket();
      const param = new URL(window.location.href);
      setDocumentId(param.searchParams.get("docId") || "");

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "REQUEST_ACCESS",
            documentId: documentId, // Set the actual document ID
            username,
          })
        );
      }
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  // Render the component based on the current state
  if (accessStatus === "idle") {
    return (
      <div className="flex flex-col items-center justify-center min-h-full mt-20">
        <Input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-64 px-4 py-2 border border-gray-300 rounded-md"
        />
        <Button onClick={handleRequestAccess} disabled={!username}>
          Request Access
        </Button>
      </div>
    );
  }

  if (accessStatus === "requested") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Waiting for the owner to grant access...</p>
      </div>
    );
  }

  if (accessStatus === "denied") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-14 w-[80%]" />
            <Skeleton className="h-14 w-[40%]" />
            <Skeleton className="h-14 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <Cover url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{document.title}</h1>
        <CollabrativeEditor
          onChange={() => {
            console.log("hii");
          }}
          initialContent={content}
          documentId={documentId}
          editable={true}
          isCollaborative={true}
          username={username}
        />
      </div>
    </div>
  );
}
