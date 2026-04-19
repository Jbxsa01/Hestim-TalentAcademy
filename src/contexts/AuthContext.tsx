import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  isTrainer: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isTrainer: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthContext: Setting up auth state listener');
    
    return onAuthStateChanged(auth, async (currentUser) => {
      console.log('👤 onAuthStateChanged triggered:', currentUser?.email || 'null');
      
      setUser(currentUser);
      
      if (currentUser) {
        try {
          console.log('📝 Creating/fetching profile for user:', currentUser.uid);
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            console.log('✅ User profile already exists:', userDoc.data());
            setProfile(userDoc.data());
          } else {
            console.log('🆕 Creating new user profile...');
            const newProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              roles: ['learner'],
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', currentUser.uid), newProfile);
            console.log('✅ New profile created:', newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error('❌ Error creating/fetching user profile:', err);
          setProfile(null);
        }
      } else {
        console.log('🚪 User logged out');
        setProfile(null);
      }
      
      console.log('✔️ Auth loading complete');
      setLoading(false);
    });
  }, []);

  const isAdmin = profile?.roles?.includes('admin') || false;
  const isTrainer = profile?.roles?.includes('trainer') || false;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isTrainer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
