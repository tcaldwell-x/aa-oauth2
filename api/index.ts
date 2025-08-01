import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || '', `https://${req.headers.host}`);
  console.log(`[MAIN] ${req.method} ${url.pathname}`);

  // Serve index.html for root path
  if (url.pathname === '/') {
    try {
      const indexPath = join(process.cwd(), 'index.html');
      const content = readFileSync(indexPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      return res.send(content);
    } catch (error) {
      console.error('Error serving index.html:', error);
      return res.status(404).send('Not Found');
    }
  }

  // API endpoint for testing
  if (url.pathname === '/api') {
    return res.status(200).json({ 
      message: 'Main API endpoint',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  }

  // Fallback to 404
  return res.status(404).send('Not Found');
} 