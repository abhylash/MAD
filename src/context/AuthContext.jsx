import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, signInWithGoogle, signInWithGoogleRedirect, getGoogleRedirectResult, signOut } from '../firebase/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });
    
    // Handle redirect result on app initialization
    const handleRedirectResult = async () => {
      try {
        await getGoogleRedirectResult();
      } catch (error) {
        console.error('Error handling redirect result:', error);
      }
    };
    
    handleRedirectResult();
    
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      // Try popup first, fallback to redirect if COOP issues occur
      try {
        await signInWithGoogle();
      } catch (popupError) {
        // If popup fails due to COOP issues, use redirect
        if (popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/cancelled-popup-request' ||
            popupError.message.includes('Cross-Origin-Opener-Policy') ||
            popupError.message.includes('window.closed')) {
          await signInWithGoogleRedirect();
        } else {
          throw popupError;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};