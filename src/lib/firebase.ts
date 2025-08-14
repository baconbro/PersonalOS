import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBbLxwwrnxJlYQDbznnxODLRGqlissBLiA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "personalos-a60e4.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "personalos-a60e4",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "personalos-a60e4.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "640772582455",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:640772582455:web:2462e236f10d94185863b2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-179EE6ZZK7"
};

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey !== "your-api-key" && 
                            firebaseConfig.projectId !== "your-project-id" &&
                            firebaseConfig.projectId === "personalos-a60e4";

if (!isFirebaseConfigured) {
  console.warn(`
  ⚠️  Firebase is not configured properly!
  
  To set up Firebase:
  1. Follow the instructions in FIREBASE_SETUP.md
  2. Update the config values in src/lib/firebase.ts
  3. Or use environment variables (see .env.example)
  
  Without proper Firebase config, data will not persist between sessions.
  `);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Test Firestore connection
const testFirestoreConnection = async () => {
  try {
    console.log('🔥 Firebase initialized successfully');
    console.log('📦 Project ID:', firebaseConfig.projectId);
    console.log('🔐 Auth Domain:', firebaseConfig.authDomain);
  } catch (error) {
    console.error('❌ Firebase connection error:', error);
  }
};

// Run connection test
testFirestoreConnection();

export { isFirebaseConfigured };
export default app;
