# ⚡ Quick Deploy Guide

## 🚀 Deploy in 10 Minutes

### **Step 1: Backend (Railway) - 5 minutes**

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "Deploy from GitHub repo"**
4. **Select `adaptive-eats` repository**
5. **Add environment variable:**
   - `OPENAI_API_KEY` = `your_api_key_here`
6. **Copy your Railway URL** (e.g., `https://adaptive-eats-backend.railway.app`)

### **Step 2: Frontend (Vercel) - 5 minutes**

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "Import Project"**
4. **Select `adaptive-eats` repository**
5. **Set Root Directory to `frontend`**
6. **Add environment variable:**
   - `NEXT_PUBLIC_API_URL` = `your_railway_url_here`
7. **Click "Deploy"**

### **Step 3: Update CORS (2 minutes)**

After getting your Vercel URL:

1. **Edit `main.py`** line 24-25
2. **Replace** `https://adaptive-eats.vercel.app` with your actual Vercel URL
3. **Redeploy** to Railway (it will auto-deploy from GitHub)

## ✅ Test Your App

Visit your Vercel URL and test:
- [ ] Upload a food image
- [ ] Enter a recipe
- [ ] Select dietary restrictions
- [ ] Add allergies
- [ ] Verify AI adaptation works

## 🎉 You're Live!

Your AdaptiveEats app is now accessible worldwide!

**Frontend**: `https://your-app.vercel.app`
**Backend**: `https://your-app.railway.app`

## 🆘 Need Help?

- **Railway issues**: Check Railway dashboard logs
- **Vercel issues**: Check Vercel dashboard logs
- **CORS errors**: Verify URLs match exactly
- **API errors**: Check environment variables

## 📱 Next Steps

1. **Share your app** with friends
2. **Test on mobile** devices
3. **Collect feedback** from users
4. **Plan mobile app** development
5. **Add analytics** and monitoring

Your food-themed AdaptiveEats app is ready to help people adapt recipes for their dietary needs! 🍞✨
