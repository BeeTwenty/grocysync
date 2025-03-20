
import WebSocket from 'ws';
import http from 'http';
import { Express } from 'express';

let wss: WebSocket.Server;

export const setupWebsocket = (server: http.Server, app: Express) => {
  // Create WebSocket server
  wss = new WebSocket.Server({ server });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message: WebSocket.RawData) => {
      console.log('Received message:', message);
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  console.log('WebSocket server initialized');
  
  // Add WebSocket broadcast function to app for use in routes
  app.set('wsBroadcast', (data: any) => {
    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
};

// Helper function to broadcast item changes to all connected clients
export const broadcastItemChange = (app: Express, type: 'INSERT' | 'UPDATE' | 'DELETE', data: any) => {
  const broadcast = app.get('wsBroadcast');
  if (typeof broadcast === 'function') {
    broadcast({
      type,
      ...data
    });
  }
};
