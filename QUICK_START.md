# 🚀 Quick Start Guide

## ⚠️ CRITICAL: Environment Setup

**The app won't work without this step!**

### 1. Create `.env.local` file

Create a file named `.env.local` in the `Auto-Advertisment-Frontend` directory:

```bash
# In Auto-Advertisment-Frontend directory
touch .env.local
```

### 2. Add Configuration

Copy this content into `.env.local`:

```env
VITE_API_URL=http://localhost:3000

VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ Settings > Project Settings
4. Scroll to "Your apps" section
5. Copy the config values to your `.env.local`

### 4. Start the App

```bash
# Terminal 1 - Backend
cd Auto-Advertisment-Backend
npm start

# Terminal 2 - Frontend
cd Auto-Advertisment-Frontend
npm run dev
```

### 5. Test Login

- Open browser to `http://localhost:5173` (or whatever Vite shows)
- Click "Sign in with Google"
- Should see Firebase login popup
- After login, should see your dashboard

---

## 🐛 Still Not Working?

**Check Console (F12)** for errors:
- If you see "API_URL is undefined" → `.env.local` not created or missing VITE_API_URL
- If you see CORS error → Backend not running or wrong URL
- If you see Firebase error → Wrong Firebase credentials in `.env.local`

**Check Network Tab (F12)**:
- Should see requests to `http://localhost:3000/auth/google`
- If URL is `undefined/auth/google` → `.env.local` issue

---

## ✅ What Was Fixed

1. **Google login** - now properly sends requests to backend
2. **Email login** - refactored to use Firebase SDK
3. **Business switching** - fetches only relevant products
4. **Socket events** - real-time updates work correctly

See `SETUP_AND_FIX_SUMMARY.md` for complete details.

