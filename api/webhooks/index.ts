import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    console.log(`[WEBHOOK_API] ${req.method} ${url.pathname}`);

    // Simple test response for now
    if (req.method === 'GET') {
      return res.status(200).json({ 
        message: 'Webhooks API is working!',
        method: req.method,
        path: url.pathname,
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      return res.status(200).json({ 
        message: 'Webhook created successfully',
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[WEBHOOK_API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
} 