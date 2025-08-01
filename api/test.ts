import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    deployment: process.env.VERCEL_URL || 'local',
    buildTime: new Date().toISOString()
  });
} 