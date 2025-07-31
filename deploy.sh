#!/bin/bash

echo "🚀 Deploying to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

# Build the project
echo "📦 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Vercel dashboard:"
echo "   - X_CONSUMER_KEY"
echo "   - X_CONSUMER_SECRET" 
echo "   - X_ACCESS_TOKEN"
echo "   - X_ACCESS_TOKEN_SECRET"
echo "   - X_USER_ID"
echo "   - X_BEARER_TOKEN"
echo ""
echo "2. Test your webhook endpoint at:"
echo "   https://your-domain.vercel.app/webhooks/twitter"
echo ""
echo "3. Access your dashboard at:"
echo "   https://your-domain.vercel.app" 