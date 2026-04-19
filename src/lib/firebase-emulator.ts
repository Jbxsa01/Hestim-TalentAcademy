import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';
import { auth, db, storage } from './firebase';

export const initializeEmulators = () => {
  // Only use emulator in development and if not already connected
  if (process.env.NODE_ENV === 'development') {
    try {
      // Check if already connected to avoid errors
      if (location.hostname === 'localhost') {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('✅ Firebase Emulator Suite connected');
      }
    } catch (error) {
      console.log('Emulator already connected or not available');
    }
  }
};
