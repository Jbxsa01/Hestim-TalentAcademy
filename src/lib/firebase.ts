import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

console.log('🔧 Firebase initializing with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app initialized');

export const auth = getAuth(app);
console.log('✅ Firebase Auth initialized');

// Enable persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log('✅ Firebase persistence enabled'))
  .catch(err => console.error('❌ Persistence error:', err));

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
console.log('✅ Firestore initialized');

export const storage = getStorage(app);
console.log('✅ Storage initialized');

export const googleProvider = new GoogleAuthProvider();
console.log('✅ Google Provider configured');
