import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock Vercel request/response for local development
function createMockVercelContext(req, res) {
  return {
    req: {
      ...req,
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body,
      query: req.query
    },
    res: {
      status: (code) => ({ json: (data) => res.status(code).json(data), send: (data) => res.status(code).send(data) }),
      json: (data) => res.json(data),
      send: (data) => res.send(data)
    }
  };
}

// Simple API routes for local development
app.get('/api/health', async (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'Local development server is working!',
    timestamp: new Date().toISOString(),
    environment: 'development',
    nodeVersion: process.version
  });
});

app.get('/api/test', async (req, res) => {
  res.status(200).json({ 
    message: 'Test API is working!',
    timestamp: new Date().toISOString(),
    environment: 'development'
  });
});

app.all('/api/webhooks', async (req, res) => {
  res.status(200).json({ 
    message: 'Webhooks API is working!',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.all('/api/webhooks/*', async (req, res) => {
  res.status(200).json({ 
    message: 'Webhooks API is working!',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.all('/api/users', async (req, res) => {
  res.status(200).json({ 
    message: 'Users API is working!',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.all('/api/users/*', async (req, res) => {
  res.status(200).json({ 
    message: 'Users API is working!',
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

app.all('/webhooks/twitter', async (req, res) => {
  if (req.method === 'GET') {
    const crcToken = req.query.crc_token;
    if (crcToken) {
      res.status(200).json({ 
        message: 'CRC check endpoint',
        crc_token: crcToken,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(200).json({ 
        message: 'Twitter webhook endpoint',
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }
  } else if (req.method === 'POST') {
    res.status(200).json({ 
      message: 'Webhook event received',
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
});

// Serve static files
app.get('/public/*', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback
app.use('*', (req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`🚀 Development server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log(`🔗 Webhooks: http://localhost:${PORT}/api/webhooks`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`🐦 Twitter Webhook: http://localhost:${PORT}/webhooks/twitter`);
}); 