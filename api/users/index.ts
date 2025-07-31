import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    console.log(`[USER_API] ${req.method} ${url.pathname}`);

    // Simple test response for now
    return res.status(200).json({ 
      message: 'Users API is working!',
      method: req.method,
      path: url.pathname,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[USER_API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
} 