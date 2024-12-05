'use client';

import { useEffect, useState, useCallback } from 'react';
import { Toolbar } from '@/components/Toolbar';
import { Cover } from '@/components/Cover';
import { Skeleton } from '@/components/ui/skeleton';
import { useRecoilState } from 'recoil';
import { collabrateAtom } from '@/store/atom';
import CollabrativeEditor from '@/components/CollabrativeEditor';
import { Button } from '@/components/ui/button';

interface DocumentIdPageProps {
  params: {
    documentId: string;
  };
}

interface AccessRequest {
  username: string;
  documentId: string;
}

export default function DocumentIdPage({ params }: DocumentIdPageProps) {
  const [document, setDocument] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [isCollaborative, setCollaborative] = useRecoilState(collabrateAtom);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [currentRequest, setCurrentRequest] = useState<AccessRequest | null>(
    null
  );
  const [popupTimer, setPopupTimer] = useState<NodeJS.Timeout | null>(null);

  // WebSocket connection to server
  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:1234');
    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(
        JSON.stringify({
          type: 'JOIN_DOCUMENT',
          documentId: params.documentId,
          username: 'owner',
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data.type);
      switch (data.type) {
        case 'JOINED_DOCUMENT':
          console.log('Joined document', data.message);
          break;
        case 'USER_JOINED':
          console.log(`User ${data.username} joined the document`);
          break;
        case 'ACCESS_REQUEST':
          setAccessRequests((prev) => [
            ...prev,
            { username: data.username, documentId: data.documentId },
          ]);
          setCurrentRequest({
            username: data.username,
            documentId: data.documentId,
          });
          setShowPopup(true);
          const timer = setTimeout(() => {
            handleAccessDecision(data.username, 'deny');
          }, 5000);
          setPopupTimer(timer);
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
      setTimeout(connectWebSocket, 5000);
    };

    setSocket(ws);
  }, [params.documentId, setCollaborative]);
  useEffect(() => {
    const fetchDocumentData = async () => {
      try {
        const response = await fetch(
          `/api/notes?action=getById&documentId=${params.documentId}`
        );
        if (!response.ok) throw new Error('Failed to fetch document');
        const doc = await response.json();
        setDocument(doc);
        setContent(doc.content ?? '');
        setCollaborative(doc.isCollaborative);
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };
    fetchDocumentData();
  }, [params.documentId]);
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
      if (popupTimer) {
        clearTimeout(popupTimer);
      }
    };
  }, [connectWebSocket, params.documentId, popupTimer]);

  const handleContentChange = (newContent: string) => {
    console.log('Updating content...');
  };

  const handleAccessDecision = (
    username: string,
    decision: 'approve' | 'deny'
  ) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: decision === 'approve' ? 'APPROVE_ACCESS' : 'DENY_ACCESS',
          documentId: params.documentId,
          username,
          content: document,
        })
      );
      setAccessRequests((prev) =>
        prev.filter((req) => req.username !== username)
      );
      setShowPopup(false);

      if (popupTimer) {
        clearTimeout(popupTimer);
      }
    }
  };

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
        {showPopup && currentRequest && (
          <div className="fixed top-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-end items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-xl font-semibold">New Access Request</h3>
              <p className="mt-4">
                User {currentRequest.username} is requesting access to this
                document.
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  size="sm"
                  onClick={() =>
                    handleAccessDecision(currentRequest.username, 'approve')
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleAccessDecision(currentRequest.username, 'deny')
                  }
                >
                  Deny
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-40">
      <Cover url={document.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={document} />
        <div className="flex gap-4">
          <div className="flex-grow">
            <CollabrativeEditor
              onChange={handleContentChange}
              initialContent={content}
              documentId={params.documentId}
              editable={true}
              isCollaborative={isCollaborative}
              username="owner"
            />
          </div>
        </div>
      </div>
      {showPopup && currentRequest && (
        <div className="fixed top-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-end items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold">New Access Request</h3>
            <p className="mt-4">
              User {currentRequest.username} is requesting access to this
              document.
            </p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                size="sm"
                onClick={() =>
                  handleAccessDecision(currentRequest.username, 'approve')
                }
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleAccessDecision(currentRequest.username, 'deny')
                }
              >
                Deny
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Access Request Side Pop-up */}
    </div>
  );
}
