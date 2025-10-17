# 🚀 AdaptiveEats Deployment Guide

## Backend Deployment (Railway)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### Step 2: Deploy Backend
1. **Connect GitHub Repository:**
   - Click "Deploy from GitHub repo"
   - Select your `adaptive-eats` repository
   - Choose the root directory

2. **Set Environment Variables:**
   - Go to your project settings
   - Add environment variable:
     - `OPENAI_API_KEY` = your OpenAI API key

3. **Deploy:**
   - Railway will automatically detect Python and install dependencies
   - Your backend will be available at: `https://your-app-name.railway.app`

### Step 3: Get Backend URL
- Copy your Railway backend URL (e.g., `https://adaptive-eats-backend.railway.app`)
- You'll need this for the frontend deployment

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

### Step 2: Deploy Frontend
1. **Import Project:**
   - Click "Import Project"
   - Select your `adaptive-eats` repository
   - Set root directory to `frontend`

2. **Set Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_API_URL` = your Railway backend URL

3. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - Your app will be available at: `https://your-app-name.vercel.app`

## Alternative: One-Click Deploy

### Railway (Full Stack)
1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub"
3. Select your repository
4. Railway will deploy both backend and frontend

### Vercel (Frontend Only)
1. Go to [vercel.com](https://vercel.com)
2. Click "Deploy" button
3. Connect your GitHub repository
4. Set environment variables

## Environment Variables

### Backend (Railway)
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=8000
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

## Testing Your Deployment

1. **Backend Test:**
   ```bash
   curl https://your-backend-url.railway.app/
   ```

2. **Frontend Test:**
   - Visit your Vercel URL
   - Try uploading an image or entering a recipe
   - Check browser console for any errors

## Troubleshooting

### CORS Issues
- Make sure your backend URL is added to CORS origins in `main.py`
- Check that `NEXT_PUBLIC_API_URL` is set correctly

### Build Failures
- Check Railway/Vercel logs for specific error messages
- Ensure all dependencies are in `requirements.txt` (backend)
- Ensure all dependencies are in `package.json` (frontend)

### API Key Issues
- Verify your OpenAI API key is valid
- Check that the environment variable is set correctly
- Test the API key locally first

## Cost Estimates

### Railway (Backend)
- **Free tier**: $0/month (500 hours)
- **Pro tier**: $5/month (unlimited)

### Vercel (Frontend)
- **Free tier**: $0/month (100GB bandwidth)
- **Pro tier**: $20/month (unlimited)

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Add analytics** (Google Analytics, Mixpanel)
3. **Set up monitoring** (Sentry, LogRocket)
4. **Configure CI/CD** for automatic deployments
5. **Add user feedback** system

## Security Considerations

1. **API Key Security:**
   - Never commit API keys to GitHub
   - Use environment variables only
   - Rotate keys regularly

2. **CORS Configuration:**
   - Only allow necessary origins
   - Use HTTPS in production
   - Validate all inputs

3. **Rate Limiting:**
   - Implement rate limiting on API endpoints
   - Monitor usage and costs
   - Set up alerts for unusual activity

Your AdaptiveEats app will be live and accessible to users worldwide! 🌍
