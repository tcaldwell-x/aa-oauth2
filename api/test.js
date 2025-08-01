export default function handler(req, res) {
  console.log('[TEST] API endpoint called');
  return res.status(200).json({
    message: 'Test API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
} 