# Vercel Deployment Guide

This project has been configured to deploy on Vercel. Here's what you need to know:

## What's Changed

1. **Converted from Bun to Node.js**: The original project used Bun's `serve` function and WebSocket functionality, which doesn't work on Vercel's serverless environment.

2. **API Routes**: Created dedicated API routes for each endpoint:
   - `/api/webhooks` - Webhook management
   - `/api/users` - User management  
   - `/webhooks/twitter` - Twitter webhook endpoint

3. **Static File Serving**: Static files are served from the `/public` directory.

## Environment Variables

Make sure to set these environment variables in your Vercel project settings:

- `X_CONSUMER_KEY`
- `X_CONSUMER_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`
- `X_USER_ID`

## Deployment Steps

1. **Connect to Vercel**: Import your GitHub repository to Vercel
2. **Set Environment Variables**: Add the required environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy your application

## Limitations

- **WebSockets**: WebSocket functionality for live events won't work in the serverless environment. The live events feature will need to be reimplemented using Server-Sent Events or polling.
- **State**: Serverless functions are stateless, so any in-memory state (like WebSocket connections) won't persist between requests.

## Local Development

To run locally with the new Node.js setup:

```bash
npm install
npm run dev
```

## API Endpoints

- `GET /` - Serves the main dashboard
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Add webhook
- `GET /api/users` - User management
- `GET /webhooks/twitter?crc_token=...` - CRC validation
- `POST /webhooks/twitter` - Receive webhook events

## Troubleshooting

If you get 404 errors:
1. Check that all environment variables are set
2. Verify the API routes are correctly configured
3. Check Vercel function logs for errors 