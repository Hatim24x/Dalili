import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  Unsubscribe
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { auth, db } from '@/src/lib/firebase';
import { UserProfile, UserRole } from '@/src/types';

const USERS_COLLECTION = 'users';

export const authService = {
  getCurrentUser: (): UserProfile | null => {
    return null; // Force using onAuthStateChange/AuthContext for data
  },

  loginWithGoogle: async (requestedRole: UserRole = 'user'): Promise<UserProfile> => {
    // ... existing loginWithGoogle content
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: requestedRole
        };
        await setDoc(userRef, newProfile);
        return newProfile;
      }
      
      const existingProfile = userSnap.data() as UserProfile;
      if (requestedRole === 'owner' && existingProfile.role === 'user') {
        const updatedProfile = { ...existingProfile, role: 'owner' as UserRole };
        await setDoc(userRef, updatedProfile, { merge: true });
        return updatedProfile;
      }
      return existingProfile;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    await signOut(auth);
  },

  onAuthStateChange: (callback: (user: UserProfile | null) => void) => {
    let unsubscribeSnapshot: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (user) {
        const userRef = doc(db, USERS_COLLECTION, user.uid);
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            callback(docSnap.data() as UserProfile);
          } else {
            callback({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              role: 'user'
            });
          }
        }, (error) => {
          console.error("Firestore onSnapshot error:", error);
          // Fallback to basic info if snapshot fails (e.g. permissions)
          callback({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: 'user'
          });
        });
      } else {
        callback(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }
};
