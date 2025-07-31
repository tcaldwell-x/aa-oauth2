import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const pathArray = Array.isArray(path) ? path : [path];
  const requestPath = pathArray?.join('/') || '';

  console.log(`[STATIC] Serving path: ${requestPath}`);

  // Serve index.html for root path
  if (requestPath === '' || requestPath === 'index.html') {
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

  // Serve static files from public directory
  if (requestPath.startsWith('public/')) {
    try {
      const filePath = join(process.cwd(), requestPath);
      const content = readFileSync(filePath);
      
      // Set appropriate content type based on file extension
      const ext = requestPath.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      switch (ext) {
        case 'css':
          contentType = 'text/css';
          break;
        case 'js':
          contentType = 'application/javascript';
          break;
        case 'html':
          contentType = 'text/html';
          break;
        case 'png':
          contentType = 'image/png';
          break;
        case 'jpg':
        case 'jpeg':
          contentType = 'image/jpeg';
          break;
        case 'svg':
          contentType = 'image/svg+xml';
          break;
        case 'ico':
          contentType = 'image/x-icon';
          break;
      }
      
      res.setHeader('Content-Type', contentType);
      return res.send(content);
    } catch (error) {
      console.error(`Error serving static file ${requestPath}:`, error);
      return res.status(404).send('Not Found');
    }
  }

  // Fallback to 404
  return res.status(404).send('Not Found');
} 