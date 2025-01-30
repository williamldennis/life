'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    console.log('ProtectedRoute state:', {
      isAuthenticated: !!user,
      loading,
      isRedirecting,
      pathname: window.location.pathname
    });

    if (!loading && !user && !isRedirecting) {
      console.log('Starting redirect to home - user not authenticated');
      setIsRedirecting(true);
      router.replace('/');
    }
  }, [user, loading, router, isRedirecting]);

  // Show loading state while authenticating or redirecting
  if (loading || isRedirecting) {
    console.log('ProtectedRoute showing loading state:', { loading, isRedirecting });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    console.log('ProtectedRoute returning null - no user');
    return null;
  }

  console.log('ProtectedRoute rendering protected content for user:', user.email);
  return <>{children}</>;
} 