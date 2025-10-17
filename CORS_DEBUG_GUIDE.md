# 🔧 CORS Debug Guide

## Problem
Getting 405 error when frontend tries to call Railway backend:
```
/web-production-43944c.up.railway.app/adapt-from-image:1 Failed to load resource: the server responded with a status of 405 ()
```

## Root Cause
405 = "Method Not Allowed" - This is typically a CORS preflight issue where the browser sends an OPTIONS request before the actual POST request, but the server doesn't handle OPTIONS properly.

## Fixes Applied

### 1. Added Explicit OPTIONS Handlers
```python
@app.options("/adapt-from-image")
async def adapt_from_image_options():
    return {"message": "OK"}

@app.options("/adapt-recipe")
async def adapt_recipe_options():
    return {"message": "OK"}
```

### 2. Updated CORS Configuration
```python
allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]  # Explicitly allow OPTIONS
```

### 3. Added Health Check Endpoint
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "AdaptiveEats API is running"}
```

## Testing Steps

### 1. Test Backend Health
```bash
curl https://web-production-43944c.up.railway.app/health
```
Should return: `{"status": "healthy", "message": "AdaptiveEats API is running"}`

### 2. Test CORS Preflight
```bash
curl -X OPTIONS https://web-production-43944c.up.railway.app/adapt-from-image \
  -H "Origin: https://your-vercel-app.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```
Should return: `{"message": "OK"}`

### 3. Test from Browser Console
Open your Vercel app and run in browser console:
```javascript
fetch('https://web-production-43944c.up.railway.app/health')
  .then(response => response.json())
  .then(data => console.log(data))
```

## Next Steps

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix CORS 405 error - add OPTIONS handlers"
   git push
   ```

2. **Wait for Railway redeploy** (usually 1-2 minutes)

3. **Test your Vercel app** - the 405 error should be resolved

## If Still Having Issues

### Check Railway Logs
1. Go to Railway dashboard
2. Click on your project
3. Check "Deployments" tab for any errors

### Check Browser Network Tab
1. Open browser dev tools
2. Go to Network tab
3. Try uploading an image
4. Look for the actual error details

### Common Issues
- **Wrong Vercel URL**: Make sure CORS origins include your actual Vercel URL
- **Environment variables**: Verify `NEXT_PUBLIC_API_URL` is set correctly
- **Railway not updated**: Wait for deployment to complete

## Expected Result
- ✅ No more 405 errors
- ✅ Image upload works
- ✅ Recipe adaptation works
- ✅ CORS preflight successful

The 405 error should be completely resolved! 🎉
