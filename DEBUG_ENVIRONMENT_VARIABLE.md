# 🔍 Debug Environment Variable Issue

## Problem
Environment variable is set correctly in Vercel, but the app is still making requests to the wrong URL.

## Debug Steps

### 1. Check Console Logs
After deploying the updated code with debug logs:

1. **Open your Vercel app**
2. **Open browser dev tools (F12)**
3. **Go to Console tab**
4. **Try uploading an image or entering a recipe**
5. **Look for these logs:**
   - `API URL being used: [URL]`
   - `Image upload URL: [URL]` or `Recipe URL: [URL]`

### 2. Verify Environment Variable in Vercel

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Settings → Environment Variables**
4. **Check `NEXT_PUBLIC_API_URL`:**
   - Should be: `https://web-production-43944c.up.railway.app`
   - Should NOT have trailing slash
   - Should NOT be: `https://adaptive-eats.vercel.app/web-production-43944c.up.railway.app`

### 3. Check Vercel Deployment

1. **Go to Deployments tab**
2. **Click on latest deployment**
3. **Check build logs** for any environment variable issues
4. **Verify the deployment used the correct environment**

### 4. Test Environment Variable

Add this to your page temporarily to see what's actually being used:

```javascript
// Add this to your page component
console.log('Environment check:');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
```

## Common Issues

### Issue 1: Environment Variable Not Set for Production
- **Problem**: Variable only set for development
- **Solution**: Make sure it's set for "Production" environment in Vercel

### Issue 2: Caching
- **Problem**: Old deployment cached
- **Solution**: Force redeploy or clear browser cache

### Issue 3: Wrong Environment
- **Problem**: Variable set for wrong environment
- **Solution**: Check all environments (Production, Preview, Development)

### Issue 4: Typos in Variable Name
- **Problem**: Variable name is wrong
- **Solution**: Verify it's exactly `NEXT_PUBLIC_API_URL`

## Expected Console Output

If working correctly, you should see:
```
API URL being used: https://web-production-43944c.up.railway.app
Image upload URL: https://web-production-43944c.up.railway.app/adapt-from-image
```

If broken, you might see:
```
API URL being used: https://adaptive-eats.vercel.app/web-production-43944c.up.railway.app
```

## Next Steps

1. **Deploy the debug version**
2. **Check console logs**
3. **Report what you see**
4. **Fix based on findings**

The debug logs will tell us exactly what's happening! 🔍
