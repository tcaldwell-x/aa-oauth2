import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUserRoutes } from '../../src/routes/userRoutes';

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
    console.log(`[USER_API] ${req.method} ${url.pathname}`);

    const standardReq = convertVercelRequestToRequest(req);
    const response = await handleUserRoutes(standardReq, url);
    
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
    console.error('[USER_API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
} 