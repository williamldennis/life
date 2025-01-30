'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('Attempting authentication:', {
      isSignUp,
      hasEmail: !!email,
      emailLength: email.length,
      hasPassword: !!password,
      passwordLength: password.length
    });

    try {
      if (isSignUp) {
        // Create new user
        console.log('Creating new user...');
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created successfully');
        router.push('/assessment');
      } else {
        // Sign in existing user
        console.log('Signing in user...');
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully');
        router.push('/dashboard');
      }
    } catch (err: any) {
      const errorDetails = {
        code: err?.code,
        message: err?.message,
        fullError: JSON.stringify(err)
      };
      console.error('Authentication error:', errorDetails);
      
      // More user-friendly error messages
      let errorMessage = 'An error occurred during authentication';
      if (err?.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (err?.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (err?.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (err?.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Life Coach</h1>
          <p className="text-gray-600">
            Track and improve your life balance across health, work, play, and love
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
