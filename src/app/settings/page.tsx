'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteUser } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // TODO: Delete user data from Supabase here

      // Delete Firebase user
      await deleteUser(user);
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Don't render content if not logged in
  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>

            <div className="space-y-6">
              {/* Account Info Section */}
              <div className="border-b pb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Account Information</h2>
                <p className="text-sm text-gray-600">
                  Email: {user.email}
                </p>
              </div>

              {/* Account Deletion Section */}
              <div className="pt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Delete Account</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                {showConfirmation ? (
                  <div className="space-y-4">
                    <p className="text-sm text-red-600 font-medium">
                      Are you sure you want to delete your account? This action cannot be undone.
                    </p>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
                      </button>
                      <button
                        onClick={() => setShowConfirmation(false)}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Delete Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 