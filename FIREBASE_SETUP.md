# 🔥 Firebase Authentication Setup Guide

## Step 1: Create a Firebase Project

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Click "Create a project"**
3. **Enter project name**: `invoice-generator` (or your preferred name)
4. **Disable Google Analytics** (optional for this project)
5. **Click "Create project"**

## Step 2: Enable Authentication

1. **In your Firebase project**, click **"Authentication"** in the left sidebar
2. **Click "Get started"**
3. **Go to "Sign-in method" tab**
4. **Enable "Email/Password"**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Get Firebase Configuration

1. **Click the gear icon** (Project settings) in the left sidebar
2. **Scroll down to "Your apps"**
3. **Click the web icon** `</>`
4. **Enter app nickname**: `invoice-generator-web`
5. **Don't check "Firebase Hosting"** (we're using Cloudflare Pages)
6. **Click "Register app"**
7. **Copy the configuration object** that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 4: Update Environment Variables

Update your `.env` file with the values from Firebase:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Step 5: Configure Authentication Settings (Optional)

1. **In Firebase Console** → **Authentication** → **Settings**
2. **Authorized domains**: Add your domain when you deploy
3. **Email templates**: Customize verification emails if needed

## Step 6: Test the Setup

After updating your `.env` file:
1. Run `npm run dev`
2. Try creating a new account
3. Check Firebase Console → Authentication → Users to see new users

## Security Notes

- ✅ Firebase automatically handles password hashing
- ✅ Email verification can be enabled
- ✅ Rate limiting is built-in
- ✅ CORS is handled automatically

Your Firebase authentication is now ready! 🎉
