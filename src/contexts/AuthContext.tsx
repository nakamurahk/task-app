import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Firebaseの認証状態の監視
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    }, (error) => {
      setError('認証エラーが発生しました');
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // メール認証メールを送信
      await sendEmailVerification(user);

      // Firestoreにユーザー情報を保存
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        emailVerified: false
      });

      // デフォルトのカテゴリーを作成
      await setDoc(doc(db, 'categories', `default_${user.uid}`), {
        user_id: user.uid,
        name: 'デフォルト',
        color: '#808080',
        is_default: true
      });
    } catch (error) {
      console.error('Error signing up:', error);
      setError(error instanceof Error ? error.message : 'サインアップ中にエラーが発生しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // メール認証が完了していない場合、エラーを表示
      if (!user.emailVerified) {
        setError('メールアドレスの認証が完了していません。認証メールをご確認ください。');
        await signOut(auth);
        return false;
      }

      // トークンの取得と保存を確実に待つ
      const token = await user.getIdToken();
      await new Promise<void>((resolve) => {
        localStorage.setItem('token', token);
        resolve();
      });
      
      // Firestoreのユーザー情報を更新
      await setDoc(doc(db, 'users', user.uid), {
        emailVerified: true
      }, { merge: true });

      return true; // ログイン成功を示す
    } catch (error) {
      console.error('Error logging in:', error);
      setError(error instanceof Error ? error.message : 'ログイン中にエラーが発生しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
      // トークンを削除
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error logging out:', error);
      setError(error instanceof Error ? error.message : 'ログアウト中にエラーが発生しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 初回ログインの場合、ユーザー情報を保存
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          createdAt: new Date().toISOString(),
          emailVerified: true
        });

        // デフォルトのカテゴリーを作成
        await setDoc(doc(db, 'categories', `default_${user.uid}`), {
          user_id: user.uid,
          name: 'デフォルト',
          color: '#808080',
          is_default: true
        });
      }
    } catch (error) {
      console.error('Error logging in with Google:', error);
      setError(error instanceof Error ? error.message : 'Googleログイン中にエラーが発生しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithApple = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 初回ログインの場合、ユーザー情報を保存
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName,
          email: user.email,
          createdAt: new Date().toISOString(),
          emailVerified: true
        });

        // デフォルトのカテゴリーを作成
        await setDoc(doc(db, 'categories', `default_${user.uid}`), {
          user_id: user.uid,
          name: 'デフォルト',
          color: '#808080',
          is_default: true
        });
      }
    } catch (error) {
      console.error('Error logging in with Apple:', error);
      setError(error instanceof Error ? error.message : 'Appleログイン中にエラーが発生しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) {
        throw new Error('ユーザーがログインしていません');
      }
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Error sending verification email:', error);
      setError(error instanceof Error ? error.message : '認証メールの送信中にエラーが発生しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      await applyActionCode(auth, code);
    } catch (error) {
      console.error('Error verifying email:', error);
      setError(error instanceof Error ? error.message : 'メール認証中にエラーが発生しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setError(error instanceof Error ? error.message : 'パスワードリセットメールの送信中にエラーが発生しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmResetPassword = async (code: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      await confirmPasswordReset(auth, code, newPassword);
    } catch (error) {
      console.error('Error confirming password reset:', error);
      setError(error instanceof Error ? error.message : 'パスワードのリセット中にエラーが発生しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    loginWithGoogle,
    loginWithApple,
    sendVerificationEmail,
    verifyEmail,
    resetPassword,
    confirmResetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 