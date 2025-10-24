#!/bin/bash

# Cloudflare Workers Deployment Script
# Make sure you have wrangler CLI installed: npm install -g wrangler

echo "🚀 Deploying URL Shortener to Cloudflare Workers..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login to Cloudflare (if not already logged in)
echo "🔐 Checking Cloudflare authentication..."
wrangler whoami || {
    echo "Please login to Cloudflare:"
    wrangler auth
}

# Deploy to Cloudflare Workers
echo "🌐 Deploying to Cloudflare Workers..."
wrangler deploy

echo "✅ Deployment complete!"
echo ""
echo "Your URL Shortener is now live on Cloudflare Workers!"
echo ""
echo "Next steps:"
echo "1. Test your API: curl -X POST https://your-worker.your-subdomain.workers.dev/api/shorten -H 'Content-Type: application/json' -d '{\"url\":\"https://example.com\"}'"
echo "2. Optional: Add custom domain in Cloudflare dashboard"
echo "3. Optional: Add KV namespace for persistent storage"