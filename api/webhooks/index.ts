import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define subscription type
interface Subscription {
  id: string;
  user_id: string;
  webhook_id: string;
  created_at: string;
  status: string;
}

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

// Mock subscriptions data
const mockSubscriptions: Record<string, Subscription[]> = {
  '1': [
    {
      id: 'sub1',
      user_id: '123',
      webhook_id: '1',
      created_at: '2024-01-15T10:35:00Z',
      status: 'active'
    },
    {
      id: 'sub2', 
      user_id: '456',
      webhook_id: '1',
      created_at: '2024-01-15T11:00:00Z',
      status: 'active'
    }
  ],
  '2': [
    {
      id: 'sub3',
      user_id: '123',
      webhook_id: '2',
      created_at: '2024-01-14T09:20:00Z',
      status: 'active'
    }
  ]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = new URL(req.url || '', `https://${req.headers.host}`);
    console.log(`[WEBHOOK_API] ${req.method} ${url.pathname}`);

    // Handle webhook-specific subscription endpoints
    const pathParts = url.pathname.split('/');
    if (pathParts.length >= 4 && pathParts[3] === 'subscriptions') {
      const webhookId = pathParts[2];
      const userId = pathParts[4]; // Optional, for specific user subscription

      // GET subscriptions for a webhook
      if (req.method === 'GET' && !userId) {
        const subscriptions = mockSubscriptions[webhookId] || [];
        return res.status(200).json({
          data: subscriptions,
          message: `Subscriptions retrieved for webhook ${webhookId}`,
          timestamp: new Date().toISOString()
        });
      }

      // POST to create subscription
      if (req.method === 'POST' && userId) {
        const newSubscription: Subscription = {
          id: `sub${Date.now()}`,
          user_id: userId,
          webhook_id: webhookId,
          created_at: new Date().toISOString(),
          status: 'active'
        };

        if (!mockSubscriptions[webhookId]) {
          mockSubscriptions[webhookId] = [];
        }
        mockSubscriptions[webhookId].push(newSubscription);

        return res.status(200).json({
          data: newSubscription,
          message: 'Subscription created successfully',
          timestamp: new Date().toISOString()
        });
      }

      // DELETE subscription
      if (req.method === 'DELETE' && userId) {
        if (mockSubscriptions[webhookId]) {
          mockSubscriptions[webhookId] = mockSubscriptions[webhookId].filter(
            (sub: Subscription) => sub.user_id !== userId
          );
        }
        return res.status(200).json({
          message: 'Subscription deleted successfully',
          timestamp: new Date().toISOString()
        });
      }
    }

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