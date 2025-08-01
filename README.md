# Account Activity Dashboard Enterprise

A Vercel serverless application to monitor and manage X (formerly Twitter) Account Activity API webhooks, subscriptions, and live events.

## 🚀 Deployment

This project is configured for deployment on Vercel.

### Quick Start

1. **Fork or clone this repository**
2. **Import to Vercel**: Go to [vercel.com](https://vercel.com) and import this repository
3. **Set Environment Variables** in Vercel dashboard:
   - `X_CONSUMER_KEY`
   - `X_CONSUMER_SECRET`
   - `X_ACCESS_TOKEN`
   - `X_ACCESS_TOKEN_SECRET`
   - `X_USER_ID`
   - `X_BEARER_TOKEN`
4. **Deploy**: Vercel will automatically build and deploy

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### API Endpoints

- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Add webhook
- `GET /api/users` - User management
- `GET /webhooks/twitter?crc_token=...` - CRC validation
- `POST /webhooks/twitter` - Receive webhook events

### Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Vercel Serverless Functions
- **Language**: TypeScript
- **Build Tool**: TypeScript Compiler
- **Deployment**: Vercel

### Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── health.ts          # Health check endpoint
│   ├── test.ts            # Test endpoint
│   ├── webhooks/          # Webhook management
│   └── users/             # User management
├── public/                # Static assets
├── src/                   # Source code
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies and scripts
```

## 🔧 Configuration

### Vercel Configuration

The project uses `vercel.json` for deployment configuration:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Node.js
- **Functions**: API routes with 30s timeout

### Environment Variables

Required environment variables for full functionality:

| Variable | Description |
|----------|-------------|
| `X_CONSUMER_KEY` | Twitter API consumer key |
| `X_CONSUMER_SECRET` | Twitter API consumer secret |
| `X_ACCESS_TOKEN` | Twitter API access token |
| `X_ACCESS_TOKEN_SECRET` | Twitter API access token secret |
| `X_USER_ID` | Twitter user ID |
| `X_BEARER_TOKEN` | Twitter API bearer token |

## 🐛 Troubleshooting

### Deployment Issues

1. **Check Vercel Dashboard**: Look for failed builds
2. **Verify Environment Variables**: All required variables must be set
3. **Test Endpoints**: Use `/api/health` and `/api/test` to verify deployment
4. **Check Logs**: Review Vercel function logs for errors

### Local Development Issues

1. **Port Conflicts**: Ensure port 3000 is available
2. **Dependencies**: Run `npm install` to install dependencies
3. **TypeScript**: Run `npm run build` to check for compilation errors

## 📄 License

This project is licensed under the MIT License.
