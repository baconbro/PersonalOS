# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "personal-os-app")
4. Enable Google Analytics (optional)
5. Create project

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" → "Get started"
2. Click "Sign-in method" tab
3. Enable "Email/Password" provider
4. Enable "Google" provider (optional but recommended)

## 3. Enable Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (we'll deploy security rules later)
3. Select a location close to your users

## 4. Enable Hosting

1. Go to "Hosting" → "Get started"
2. Follow the setup instructions

## 5. Get Your Config

1. Go to Project Settings (gear icon) → "General" tab
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app icon (</>)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

## 6. Update Your App

1. Open `src/lib/firebase.ts`
2. Replace the placeholder config with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## 7. Deploy Your App

```bash
# Build the app
npm run build

# Login to Firebase (if not already logged in)
firebase login

# Initialize Firebase in your project (if not already done)
firebase init

# Deploy to Firebase Hosting
firebase deploy
```

## 8. Your App is Live!

After deployment, your Personal OS app will be available at:
`https://your-project-id.web.app`

## Environment Variables (Optional)

For better security, you can use environment variables:

1. Create `.env` file:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

2. Update `firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```
