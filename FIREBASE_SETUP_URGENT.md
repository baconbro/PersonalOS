# 🔥 URGENT: Firebase Setup Required

Your Personal OS app is configured but Firebase services are not enabled. Here's what you need to do:

## Step 1: Enable Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **personalos-a60e4**
3. Click **"Firestore Database"** in the left sidebar
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for now)
6. Select a location (choose closest to you)

## Step 2: Enable Authentication
1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Email/Password"**:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

## Step 3: Set Up Security Rules (After testing)
Once everything works, update Firestore rules:
1. Go to **Firestore Database** > **Rules** tab
2. Replace the rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Quick Test
After enabling Firestore and Authentication:
1. Reload your app
2. Check the browser console for diagnostic messages
3. Try registering a new account
4. Add a goal and reload to test persistence

## Current Status
- ✅ Firebase project created: personalos-a60e4
- ✅ App configuration updated
- ❌ Firestore Database not created
- ❌ Authentication not enabled

The 400 error and data not persisting will be fixed once you complete Steps 1 and 2 above.
