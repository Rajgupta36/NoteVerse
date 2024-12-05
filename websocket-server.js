const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clients = new Map();
const documents = new Map();


wss.on('connection', (ws) => {
    console.log('New client connected');

    // Handle incoming messages from the client
    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message); // Try parsing the message
        } catch (error) {
            // If the message is not valid JSON, simply skip further processing
            console.log("Not a valid JSON message, skipping...");
            return; // Exit early without processing the invalid message
        }

        // If parsing was successful, proceed to handle based on the parsed data
        console.log("Valid JSON received:", data);
        console.log('Received message:', data);

        if (data.type === 'JOIN_DOCUMENT') {
            handleJoinDocument(ws, data);
        } else if (data.type === 'REQUEST_ACCESS') {
            handleRequestAccess(ws, data);
        } else if (data.type === "APPROVE_ACCESS") {
            handleApproveAccess(ws, data);
        } else if (data.type === "DENY_ACCESS") {
            handleDenyAccess(ws, data);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        for (const [documentId, clientSet] of clients.entries()) {
            if (clientSet.has(ws)) {
                clientSet.delete(ws);
                if (clientSet.size === 0) {
                    clients.delete(documentId);
                }
                break;
            }
        }
    });
});

// Handle a client joining a document
function handleJoinDocument(ws, data) {
    const { documentId, username } = data;
    if (documents.has(documentId)) {
        ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Document already exists. Please choose a different document'
        }));
        return;
    }
    documents.set(documentId, { title: documentId, owner: username, ownerconnection: ws });
    console.log(`${username} is trying to join document ${documentId}`);
    ws.send(JSON.stringify({
        type: 'JOINED_DOCUMENT',
        message: `You have joined document "${documentId}".`
    }));
}

// Handle a request for access to a document
function handleRequestAccess(ws, data) {
    const { documentId, username } = data;
    const document = documents.get(documentId);
    console.log('Requesting access to document:', documentId);
    if (document) {
        // If the document owner is trying to request access to their own document
        if (document.owner === username) {
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'You are the owner of this document.'
            }));
            return;
        }

        // Look for the owner in the list of clients
        const ownerWs = document.ownerconnection;

        if (ownerWs) {
            ownerWs.send(JSON.stringify({
                type: 'ACCESS_REQUEST',
                documentId,
                username
            }));
            const clientSet = clients.get(documentId) || new Set();
            clientSet.add({ ws: ws, username: username });
            clients.set(documentId, clientSet);
            // Notify the requester
            ws.send(JSON.stringify({
                type: 'ACCESS_REQUESTED',
                message: 'Your access request has been sent to the owner.'
            }));
        } else {
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Document owner is not connected.'
            }));
        }
    } else {
        ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Document not found.'
        }));
    }
}

// Handle approval of access request
function handleApproveAccess(ws, data) {
    const { content, documentId, username } = data;
    const document = documents.get(documentId);
    console.log(`Owner is approving access for ${username} to document ${documentId}`);
    console.log("the content is", content);
    if (document) {
        const requesterWs = Array.from(clients.get(documentId) || []).find(client =>
            client.username === username
        );
        if (requesterWs.ws) {
            // Approve the request
            console.log("the content is", content);
            requesterWs.ws.send(JSON.stringify({
                type: 'ACCESS_GRANTED',
                content: content,
                message: `Your request to access the document "${document.title}" has been approved.`
            }));
        } else {
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Requester is not connected.'
            }));
        }
    } else {
        ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Document not found.'
        }));
    }
}

// Handle denial of access request

function handleDenyAccess(ws, data) {
    const { documentId, username } = data;
    const document = documents.get(documentId);
    console.log(`Owner is denying access for ${username} to document ${documentId}`);

    if (document) {
        const requesterWs = Array.from(clients.get(documentId) || []).find(client =>
            client.username === username
        );
        console.log(requesterWs);

        if (requesterWs.ws) {
            // Deny the request
            requesterWs.ws.send(JSON.stringify({
                type: 'ACCESS_DENIED',
                message: `Your request to access the document "${document.title}" has been denied.`
            }));
        } else {
            ws.send(JSON.stringify({
                type: 'ERROR',
                message: 'Requester is not connected.'
            }));
        }
    } else {
        ws.send(JSON.stringify({
            type: 'ERROR',
            message: 'Document not found.'
        }));
    }
}


const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});
