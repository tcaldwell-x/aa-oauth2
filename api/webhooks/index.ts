import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleWebhookRoutes } from '../../src/routes/webhookRoutes';

// Convert VercelRequest to standard Request
function convertVercelRequestToRequest(vercelReq: VercelRequest): Request {
  const url = new URL(vercelReq.url || '', `https://${vercelReq.headers.host}`);
  
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
    console.log(`[WEBHOOK_API] ${req.method} ${url.pathname}`);

    // Create a modified URL that includes the full path for the route handler
    const modifiedUrl = new URL(url);
    // Ensure the path starts with /api/webhooks for the route handler
    if (!modifiedUrl.pathname.startsWith('/api/webhooks')) {
      modifiedUrl.pathname = `/api/webhooks${modifiedUrl.pathname}`;
    }

    const standardReq = convertVercelRequestToRequest(req);
    const response = await handleWebhookRoutes(standardReq, modifiedUrl);
    
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
    console.error('[WEBHOOK_API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
} 