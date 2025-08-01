import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock webhooks data for testing
const mockWebhooks = [
  {
    id: '1',
    url: 'https://example.com/webhook1',
    status: 'active',
    created_at: '2024-01-15T10:30:00Z',
    last_triggered: '2024-01-15T11:45:00Z'
  },
  {
    id: '2', 
    url: 'https://example.com/webhook2',
    status: 'active',
    created_at: '2024-01-14T09:15:00Z',
    last_triggered: null
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    console.log(`[WEBHOOK_API] ${req.method} ${url.pathname}`);

    // GET - Return list of webhooks
    if (req.method === 'GET') {
      return res.status(200).json({ 
        data: mockWebhooks,
        message: 'Webhooks retrieved successfully',
        timestamp: new Date().toISOString()
      });
    }

    // POST - Create new webhook
    if (req.method === 'POST') {
      const { url: webhookUrl } = req.body;
      
      if (!webhookUrl) {
        return res.status(400).json({ 
          error: 'Webhook URL is required',
          details: 'Please provide a valid webhook URL'
        });
      }

      // Create new webhook (mock)
      const newWebhook = {
        id: Date.now().toString(),
        url: webhookUrl,
        status: 'active',
        created_at: new Date().toISOString(),
        last_triggered: null
      };

      // Add to mock data
      mockWebhooks.push(newWebhook);

      return res.status(200).json({ 
        data: newWebhook,
        message: 'Webhook created successfully',
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