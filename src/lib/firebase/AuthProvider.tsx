'use client';

import * as React from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase/config';

interface AuthContextValue {
  /** ログイン中のユーザー。未ログインなら null */
  user: User | null;
  /** 初回の認証状態確定前は true */
  loading: boolean;
  /** Google アカウントでログイン */
  signInWithGoogle: () => Promise<void>;
  /** ログアウト */
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = React.useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      // ポップアップを閉じただけ等のユーザー操作はエラー扱いしない
      const code = (error as { code?: string }).code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Google ログインに失敗しました:', error);
      throw error;
    }
  }, []);

  const signOut = React.useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, loading, signInWithGoogle, signOut }),
    [user, loading, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth は AuthProvider の内側で使用してください');
  }
  return context;
}
