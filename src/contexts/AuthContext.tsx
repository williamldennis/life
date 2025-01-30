'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    console.log('Initial auth state:', {
      currentUser: auth.currentUser?.email
    });
    return auth.currentUser;
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('Setting up auth listener...', {
      currentUser: auth.currentUser?.email,
      contextUser: user?.email
    });
    
    // Set initial state from current user
    if (!initialized && auth.currentUser) {
      console.log('Setting initial user from auth.currentUser');
      setUser(auth.currentUser);
      setLoading(false);
      setInitialized(true);
    }
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Auth state changed:', {
        isAuthenticated: !!firebaseUser,
        email: firebaseUser?.email,
        loading: false
      });
      
      setUser(firebaseUser);
      setLoading(false);
      setInitialized(true);
    });

    return () => {
      console.log('Cleaning up auth listener...', {
        hadUser: !!user,
        wasInitialized: initialized
      });
      unsubscribe();
    };
  }, [initialized, user]);

  console.log('AuthProvider render:', {
    isAuthenticated: !!user,
    loading,
    initialized,
    email: user?.email
  });

  const value = {
    user,
    loading: loading || !initialized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 