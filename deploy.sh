#!/bin/bash

echo "🚀 Deploying AdaptiveEats..."

# Deploy backend to Railway
echo "📦 Deploying backend to Railway..."
railway up

# Get backend URL (you'll need to set this manually)
echo "🔗 Please set your Railway backend URL in the frontend environment variables"

# Deploy frontend to Vercel
echo "🌐 Deploying frontend to Vercel..."
cd frontend
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app should be live at your Vercel URL"
