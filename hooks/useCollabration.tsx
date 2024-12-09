import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useState } from 'react';

export function useCollaboration(documentId: string) {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_DEPLOYMENT_URL);
    const doc = new Y.Doc();
    const newProvider = new WebsocketProvider(
      `wss://${process.env.NEXT_PUBLIC_DEPLOYMENT_URL}`,
      documentId,
      doc
    );

    setYdoc(doc);
    setProvider(newProvider);
  }, [documentId]);

  return { ydoc, provider };
}
