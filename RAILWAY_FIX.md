# 🔧 Railway Deployment Fix

## Problem
Railway was trying to build the frontend as part of the backend deployment, causing the error:
```
sh: 1: next: not found
```

## Solution Applied
I've created several files to fix this:

### 1. `.railwayignore` - Tells Railway to ignore frontend
```
frontend/
node_modules/
.git/
```

### 2. `nixpacks.toml` - Explicit Python configuration
```toml
[phases.setup]
nixPkgs = ["python311", "pip"]

[phases.install]
cmds = ["pip install -r requirements.txt"]

[start]
cmd = "python main.py"
```

### 3. Updated `railway.json` - Backend-only build
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  }
}
```

### 4. Removed build scripts from root `package.json`

## Next Steps

1. **Commit these changes** to your GitHub repository
2. **Redeploy on Railway** - it should now only build the Python backend
3. **Deploy frontend separately** on Vercel

## Railway Deployment Steps

1. **Go to your Railway project**
2. **Click "Redeploy"** or push changes to GitHub
3. **Railway will now:**
   - Only install Python dependencies
   - Ignore the frontend directory
   - Start the FastAPI backend
4. **Copy your Railway URL** for the frontend deployment

## Vercel Deployment Steps

1. **Go to [vercel.com](https://vercel.com)**
2. **Import your repository**
3. **Set Root Directory to `frontend`**
4. **Add environment variable:**
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL
5. **Deploy**

## Expected Result

- **Backend**: `https://your-app.railway.app` (Python/FastAPI)
- **Frontend**: `https://your-app.vercel.app` (Next.js/React)

The error should be resolved! 🎉
