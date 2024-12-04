import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export function useCollaboration(documentId: string) {
  const ydoc = new Y.Doc();
  const newProvider = new WebsocketProvider(
    "ws://localhost:1234",
    documentId,
    ydoc
  );
  return { ydoc, provider: newProvider };
}
