'use client';

import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import CollabrativeEditor from '@/components/CollabrativeEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserIcon, CalendarIcon } from 'lucide-react';
import { Spinner } from '@/components/spinner';
import { useUser } from '@clerk/nextjs';

export default function CollaboratePage() {
  const [document, setDocument] = useState<any>(null);
  const { user, isLoaded } = useUser();
  const [error, setError] = useState<string>('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState<string>('');
  const [documentId, setDocumentId] = useState<string>('');
  const [accessStatus, setAccessStatus] = useState<
    'idle' | 'requested' | 'granted' | 'denied'
  >('idle');

  useEffect(() => {
    // Auto-fill username if user is logged in
    if (user) {
      setUsername(user.firstName ?? user.fullName ?? '');
    }
  }, [user]);

  const connectWebSocket = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(
      `ws://${process.env.NEXT_PUBLIC_DEPLOYMENT_URL}:1234`
    );

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
      } catch (e) {
        return;
      }
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'ACCESS_REQUESTED':
          setAccessStatus('requested');
          break;
        case 'ACCESS_GRANTED':
          setAccessStatus('granted');
          setDocument(data.content);
          console.log(data.content);
          break;
        case 'ACCESS_DENIED':
          setAccessStatus('denied');
          setError(data.message);
          break;
        case 'ERROR':
          setError(data.message);
          setAccessStatus('denied');
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
      setTimeout(connectWebSocket, 5000);
    };

    setSocket(ws);
  }, [socket]);

  const handleRequestAccess = () => {
    if (username && accessStatus === 'idle') {
      connectWebSocket();
      const param = new URL(window.location.href);
      setDocumentId(param.searchParams.get('docId') || '');

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: 'REQUEST_ACCESS',
            documentId,
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

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center  dark:bg-[#1F1F1F] border-2 dark:text-white justify-center min-h-screen">
        <Spinner size="lg" />
        <p>Loading...</p>
      </div>
    );
  }

  if (accessStatus === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-[#1F1F1F] dark:text-white">
        <div className="w-full max-w-md space-y-6 p-8">
          <h1 className="text-2xl font-semibold text-center">
            Welcome to NoteVerse
          </h1>
          <div className="space-y-4">
            {!user && (
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full dark:bg-[#2C2C2C] border-2 dark:text-white placeholder:text-black dark:placeholder:text-gray-400"
              />
            )}
            <Button
              onClick={handleRequestAccess}
              disabled={!username}
              className="w-full bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {user
                ? 'Double-click to request access'
                : 'Enter your name and double-click to request access'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (accessStatus === 'requested') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen dark:bg-[#1F1F1F] dark:text-white">
        <Spinner size="lg" />
        <div className="text-center space-y-4 flex justify-center items-center">
          <p className="text-lg">Waiting for the owner to grant access...</p>
        </div>
      </div>
    );
  }

  if (accessStatus === 'denied') {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-[#1F1F1F] dark:text-white">
        <div className="text-center space-y-4">
          <p className="text-lg text-red-400">{error}</p>
          <Button
            onClick={() => setAccessStatus('idle')}
            className="dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-400 dark:bg-[#1F1F1F] text-white">
        <div className="max-w-6xl mx-auto p-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
            <Skeleton className="h-[400px] w-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-[#1F1F1F] dark:text-white">
      <div className="max-w-6xl mx-auto p-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Document Name : {document?.title || 'Untitled'}
                </h1>
                <div className="flex items-center space-x-4 text-sm ">
                  <div className="flex items-center space-x-2 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="bg-purple-500/10 text-purple-400 dark:text-purple-700 hover:bg-purple-500/20 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Collabrator</span>
              </Badge>
            </div>
          </div>
          <div className=" rounded-lg border-8 border-gray-700 dark:border-gray-300 min-h-[calc(100vh-250px)]">
            <div className="p-8">
              <CollabrativeEditor
                onChange={() => {
                  console.log('Content changed');
                }}
                initialContent=""
                documentId={documentId}
                editable={true}
                isCollaborative={true}
                username={username}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-md flex items-center">
          <span className="mr-2">1 error</span>
          <button
            onClick={() => setError('')}
            className="text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
