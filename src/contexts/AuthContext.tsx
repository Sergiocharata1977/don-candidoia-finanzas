'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { onAuthChange, FirebaseUser } from '@/firebase/auth';
import { auth } from '@/firebase/config';
import { UserService } from '@/services/auth/UserService';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const userData = await UserService.getById(firebaseUser.uid);
        setUser(userData);
      } catch (err) {
        console.error('Error refreshing user:', err);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async fbUser => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          // Check if user exists in Firestore
          let userData = await UserService.getById(fbUser.uid);

          // If not, create user profile
          if (!userData) {
            userData = await UserService.create(fbUser.uid, {
              email: fbUser.email || '',
              displayName: fbUser.displayName || undefined,
              photoURL: fbUser.photoURL || undefined,
            });
          }

          setUser(userData);
          setError(null);

          // Set auth cookie for middleware
          if (typeof document !== 'undefined') {
            document.cookie = `auth-token=${fbUser.uid}; path=/; max-age=604800; SameSite=Lax`;
          }
        } catch (err) {
          console.error('Error loading user data:', err);
          setError('Error al cargar datos del usuario');
          setUser(null);

          // Clear cookie on error
          if (typeof document !== 'undefined') {
            document.cookie =
              'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
        }
      } else {
        setUser(null);
        setError(null);

        // Clear cookie on logout
        if (typeof document !== 'undefined') {
          document.cookie =
            'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);

      // Clear auth cookie
      if (typeof document !== 'undefined') {
        document.cookie =
          'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }

      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Error al cerrar sesión');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
