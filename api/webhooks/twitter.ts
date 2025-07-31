import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    console.log(`[TWITTER_WEBHOOK] ${req.method} ${url.pathname}`);

    // Handle CRC check for Twitter webhooks
    if (req.method === 'GET') {
      const crcToken = url.searchParams.get('crc_token');
      if (crcToken) {
        return res.status(200).json({ 
          message: 'CRC check endpoint',
          crc_token: crcToken,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Handle webhook events
    if (req.method === 'POST') {
      return res.status(200).json({ 
        message: 'Webhook event received',
        method: req.method,
        body: req.body,
        timestamp: new Date().toISOString()
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('[TWITTER_WEBHOOK] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
} 