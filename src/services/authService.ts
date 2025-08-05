import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// ✅ Define the User type right here
export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export const authService = {
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData: Omit<User, 'id'> = {
        email: firebaseUser.email!,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      const user: User = {
        id: firebaseUser.uid,
        ...userData,
      };

      return { user, error: null };
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message;
      }

      return { user: null, error: errorMessage };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await firebaseUser.getIdToken(true); // ensure token is refreshed

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        return { user: null, error: 'User profile not found' };
      }

      const userData = userDoc.data();

      const user: User = {
        id: firebaseUser.uid,
        email: userData.email,
        full_name: userData.full_name,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };

      return { user, error: null };
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message;
      }

      return { user: null, error: errorMessage };
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        unsubscribe();

        if (!firebaseUser) {
          resolve(null);
          return;
        }

        try {
          await firebaseUser.getIdToken(true);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (!userDoc.exists()) {
            resolve(null);
            return;
          }

          const userData = userDoc.data();
          const user: User = {
            id: firebaseUser.uid,
            email: userData.email,
            full_name: userData.full_name,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
          };

          resolve(user);
        } catch (error) {
          resolve(null);
        }
      });
    });
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      try {
        await firebaseUser.getIdToken(true);
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          callback(null);
          return;
        }

        const userData = userDoc.data();
        const user: User = {
          id: firebaseUser.uid,
          email: userData.email,
          full_name: userData.full_name,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        };

        callback(user);
      } catch (error) {
        callback(null);
      }
    });
  },
};
