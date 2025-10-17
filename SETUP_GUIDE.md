# AdaptiveEats Setup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.14 (or 3.11+)
- Node.js 18+ (for frontend)
- Git

### Backend Setup (FastAPI)

1. **Create and activate virtual environment:**
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # or
   source .venv/bin/activate  # macOS/Linux
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set your OpenAI API key:**
   - Edit `main.py` and replace the API key on line 32
   - Or set environment variable: `set OPENAI_API_KEY=your_key_here`

4. **Run the backend:**
   ```bash
   python main.py
   ```
   Backend will be available at `http://localhost:8000`

### Frontend Setup (React/Next.js)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the frontend:**
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

### Run Both Together

From the root directory:
```bash
npm run dev
```

## 🔧 Troubleshooting

### Python 3.14 Compatibility Issues

If you encounter the `AttributeError: 'typing.Union' object has no attribute '__module__'` error:

1. **Make sure you're using the virtual environment:**
   ```bash
   .venv\Scripts\activate
   ```

2. **Install compatible package versions:**
   ```bash
   pip install httpcore==1.0.9 httpx==0.27.0 openai==1.12.0
   ```

3. **If still having issues, try:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt --force-reinstall
   ```

### CORS Issues

The backend is configured with CORS middleware to allow requests from `http://localhost:3000`. If you're still getting CORS errors:

1. **Check that both servers are running:**
   - Backend: `http://localhost:8000`
   - Frontend: `http://localhost:3000`

2. **Verify CORS configuration in `main.py`:**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Port Already in Use

If you get "port already in use" errors:

1. **Kill existing processes:**
   ```bash
   # Windows
   taskkill /F /IM python.exe
   taskkill /F /IM node.exe
   
   # macOS/Linux
   pkill -f python
   pkill -f node
   ```

2. **Or use different ports:**
   - Backend: Change port in `main.py` (line 365)
   - Frontend: Change port in `frontend/package.json`

## 📱 Mobile Development

See `MOBILE_APP_GUIDE.md` for detailed instructions on converting to mobile apps.

## 🎯 Features

- **Recipe Adaptation**: AI-powered recipe modification for dietary restrictions
- **Image Recognition**: Upload food images to generate recipes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Discord-like interface with smooth animations
- **CORS Enabled**: Ready for cross-origin requests

## 🛠️ Development

### Project Structure
```
adaptive-eats/
├── main.py                 # FastAPI backend
├── requirements.txt        # Python dependencies
├── frontend/              # React/Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   └── components/   # React components
│   └── package.json      # Node.js dependencies
├── templates/            # HTML templates (legacy)
└── README.md
```

### API Endpoints

- `GET /` - Main page (HTML)
- `POST /adapt-recipe` - Adapt recipe from text
- `POST /adapt-from-image` - Adapt recipe from image

### Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)

## 🚀 Deployment

### Backend (FastAPI)
- **Railway**: `railway deploy`
- **Heroku**: `git push heroku main`
- **AWS EC2**: Use Docker or direct deployment

### Frontend (Next.js)
- **Vercel**: `vercel deploy`
- **Netlify**: Connect GitHub repository
- **AWS Amplify**: Connect GitHub repository

### Mobile Apps
- **iOS**: App Store via Xcode
- **Android**: Google Play Store
- **Expo**: `expo publish` for over-the-air updates

## 📞 Support

If you encounter any issues:

1. Check this setup guide
2. Verify all dependencies are installed correctly
3. Ensure both servers are running
4. Check console logs for error messages
5. Verify your OpenAI API key is valid

Happy coding! 🎉
