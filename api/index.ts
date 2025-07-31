import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || '', `https://${req.headers.host}`);
  console.log(`[API] ${req.method} ${url.pathname}`);

  // This handler is now just a fallback for any unmatched API routes
  return res.status(404).send('API endpoint not found');
} 