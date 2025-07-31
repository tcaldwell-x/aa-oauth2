import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleXEventRoutes } from '../../src/routes/xEventRoutes';

// Dummy broadcast function since WebSockets don't work in serverless
function broadcastToLiveEventClients(message: string | object) {
  console.log(`[WEBSOCKET_BROADCAST] Would broadcast: ${JSON.stringify(message).substring(0,100)}...`);
  // In serverless environment, we can't maintain WebSocket connections
  // This would need to be handled differently (e.g., via Server-Sent Events or polling)
}

// Convert VercelRequest to standard Request
function convertVercelRequestToRequest(vercelReq: VercelRequest): Request {
  const url = new URL(vercelReq.url || '', `https://${vercelReq.headers.host}`);
  
  // Create a Request object that matches the expected interface
  const requestInit: RequestInit = {
    method: vercelReq.method,
    headers: vercelReq.headers as any,
    body: vercelReq.body ? JSON.stringify(vercelReq.body) : undefined,
  };

  return new Request(url.toString(), requestInit);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    console.log(`[WEBHOOK] ${req.method} ${url.pathname}`);

    // Convert VercelRequest to standard Request
    const standardReq = convertVercelRequestToRequest(req);
    
    const response = await handleXEventRoutes(standardReq, url, broadcastToLiveEventClients);
    
    if (response) {
      res.status(response.status || 200);
      if (response.headers) {
        Object.entries(response.headers).forEach(([key, value]) => {
          res.setHeader(key, value as string);
        });
      }
      return res.send(response.body);
    }

    return res.status(404).send('Not Found');
  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
} 