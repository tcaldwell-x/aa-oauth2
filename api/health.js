export default function handler(req, res) {
  return res.status(200).json({
    status: 'healthy',
    message: 'JavaScript API is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
} 