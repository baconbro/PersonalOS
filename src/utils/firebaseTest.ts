import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  console.log('🧪 Testing Firebase connection...');
  
  try {
    // Test basic Firestore connection
    const testCollection = collection(db, 'test');
    console.log('📁 Collection reference created successfully');
    
    // Test if user is authenticated
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        console.log('👤 Auth state:', user ? `Logged in as ${user.email}` : 'Not authenticated');
        
        try {
          if (user) {
            // Test authenticated operations
            const userCollection = collection(db, `users/${user.uid}/goals`);
            console.log('📁 User collection created for:', user.uid);
            
            // Try to write a test document
            const testDoc = {
              test: true,
              timestamp: new Date(),
              message: 'Firebase + Firestore is working perfectly! 🎉'
            };
            
            const docRef = await addDoc(userCollection, testDoc);
            console.log('✅ Test document written with ID:', docRef.id);
            
            // Try to read it back
            const snapshot = await getDocs(userCollection);
            console.log('📊 Documents in user collection:', snapshot.size);
            
            resolve({
              success: true,
              message: 'Firebase connection is working properly',
              authenticated: true,
              documentsFound: snapshot.size
            });
          } else {
            // Test unauthenticated read (should fail with proper security rules)
            const snapshot = await getDocs(testCollection);
            console.log('📊 Unauthenticated read successful. Documents found:', snapshot.size);
            
            resolve({
              success: true,
              message: 'Firebase connection working but user not authenticated',
              authenticated: false,
              documentsFound: snapshot.size,
              warning: 'Security rules may be too permissive'
            });
          }
        } catch (error: any) {
          console.error('❌ Firebase operation failed:', error);
          
          let message = 'Unknown Firebase error';
          let solution = 'Check Firebase console settings';
          
          if (error?.code) {
            switch (error.code) {
              case 'permission-denied':
                message = 'Firestore security rules are denying access';
                solution = user ? 
                  'Update Firestore security rules to allow authenticated users' :
                  'User needs to be authenticated to access data';
                break;
              case 'unavailable':
                message = 'Firestore service is unavailable';
                solution = 'Check internet connection and Firebase service status';
                break;
              case 'failed-precondition':
                message = 'Firestore database not created';
                solution = 'Go to Firebase Console > Firestore Database > Create Database';
                break;
              case 'not-found':
                message = 'Firestore database or collection not found';
                solution = 'Create Firestore database in Firebase Console';
                break;
              default:
                message = `Firebase error: ${error.code} - ${error.message}`;
                solution = 'Check Firebase Console and project configuration';
            }
          }
          
          resolve({
            success: false,
            error: error.code || 'unknown',
            message,
            solution,
            authenticated: !!user
          });
        }
      });
    });
  } catch (error: any) {
    console.error('❌ Firebase initialization failed:', error);
    return {
      success: false,
      error: 'initialization-failed',
      message: 'Firebase could not be initialized',
      solution: 'Check Firebase configuration and project setup'
    };
  }
};

// Auto-run test when this module is imported
if (typeof window !== 'undefined') {
  testFirebaseConnection().then((result: any) => {
    if (result.success) {
      console.log('🎉', result.message);
    } else {
      console.warn('⚠️', result.message);
      console.warn('💡 Solution:', result.solution);
    }
  });
}
