const WebSocket = require('ws');
const http = require('http');
const { setupWSConnection } = require('y-websocket/bin/utils');

// Create HTTP server
const server = http.createServer((request, response) => {
    console.log(`[${new Date().toISOString()}] Received HTTP request: ${request.method} ${request.url}`);
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('WebSocket server for collaborative editing');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress || 'unknown IP';
    console.log(`[${new Date().toISOString()}] New WebSocket connection established from ${clientIP}`);

    // Log incoming messages
    ws.on('message', (message) => {
        console.log(`[${new Date().toISOString()}] Message received from ${clientIP}: ${message}`);
    });

    // Log when the connection is closed
    ws.on('close', (code, reason) => {
        console.log(`[${new Date().toISOString()}] Connection closed from ${clientIP}. Code: ${code}, Reason: ${reason}`);
    });

    // Log errors
    ws.on('error', (error) => {
        console.error(`[${new Date().toISOString()}] Error on connection from ${clientIP}:`, error);
    });

    setupWSConnection(ws, req);
});

// Start the server
server.listen(1234, () => {
    console.log(`[${new Date().toISOString()}] WebSocket server is running on ws://localhost:1234`);
});
