import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    console.log(`[TWITTER_WEBHOOK] ${req.method} ${url.pathname}`);

    // Handle CRC check for Twitter webhooks
    if (req.method === 'GET') {
      const crcToken = url.searchParams.get('crc_token');
      if (crcToken) {
        // Twitter requires this specific CRC validation
        const consumerSecret = process.env.X_CONSUMER_SECRET;
        if (!consumerSecret) {
          console.error('X_CONSUMER_SECRET not found for CRC validation');
          return res.status(500).json({ error: 'Server configuration error: Missing consumer secret' });
        }

        // Create the response token as required by Twitter
        const hmac = crypto.createHmac('sha256', consumerSecret);
        hmac.update(crcToken);
        const responseToken = `sha256=${hmac.digest('base64')}`;

        console.log(`[TWITTER_WEBHOOK] CRC validation successful for token: ${crcToken}`);
        return res.status(200).json({ 
          response_token: responseToken
        });
      }
    }

    // Handle webhook events
    if (req.method === 'POST') {
      console.log(`[TWITTER_WEBHOOK] Received webhook event:`, req.body);
      
      // Validate the request signature if needed
      const signature = req.headers['x-twitter-webhooks-signature'];
      if (signature) {
        console.log(`[TWITTER_WEBHOOK] Request signature: ${signature}`);
        // TODO: Add signature validation if needed
      }

      return res.status(200).json({ 
        message: 'Webhook event received successfully',
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