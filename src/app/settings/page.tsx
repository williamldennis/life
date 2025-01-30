'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { db, getAssessment, saveAssessment, deleteAssessmentData } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import questions from InitialAssessment
const questions = [
  // Health Questions
  {
    id: 'health-1',
    text: 'How would you describe your current exercise routine?',
    area: 'health'
  },
  {
    id: 'health-2',
    text: 'What are your sleeping habits like?',
    area: 'health'
  },
  {
    id: 'health-3',
    text: 'How would you describe your eating habits and nutrition?',
    area: 'health'
  },
  {
    id: 'health-4',
    text: 'How do you currently manage stress in your life?',
    area: 'health'
  },
  
  // Work Questions
  {
    id: 'work-1',
    text: 'What aspects of your current work do you find most fulfilling?',
    area: 'work'
  },
  {
    id: 'work-2',
    text: 'What are your main career goals for the next 1-2 years?',
    area: 'work'
  },
  {
    id: 'work-3',
    text: 'How would you describe your work-life balance?',
    area: 'work'
  },
  {
    id: 'work-4',
    text: 'What skills would you like to develop in your professional life?',
    area: 'work'
  },

  // Play Questions
  {
    id: 'play-1',
    text: 'What hobbies or activities bring you the most joy?',
    area: 'play'
  },
  {
    id: 'play-2',
    text: 'How often do you make time for activities purely for fun?',
    area: 'play'
  },
  {
    id: 'play-3',
    text: 'What new experiences would you like to try?',
    area: 'play'
  },
  {
    id: 'play-4',
    text: 'How do you typically spend your free time?',
    area: 'play'
  },

  // Love Questions
  {
    id: 'love-1',
    text: 'How would you describe your most important relationships?',
    area: 'love'
  },
  {
    id: 'love-2',
    text: 'What qualities do you value most in relationships?',
    area: 'love'
  },
  {
    id: 'love-3',
    text: 'How do you maintain connections with friends and family?',
    area: 'love'
  },
  {
    id: 'love-4',
    text: 'What would you like to improve in your relationships?',
    area: 'love'
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [assessment, setAssessment] = useState<Record<string, string>>({});
  const [editingResponse, setEditingResponse] = useState<string | null>(null);
  const [tempResponse, setTempResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Load assessment data
  useEffect(() => {
    async function loadAssessment() {
      if (!user) return;
      try {
        const data = await getAssessment(user.uid);
        if (data?.responses) {
          setAssessment(data.responses);
        }
      } catch (err) {
        console.error('Error loading assessment:', err);
      }
    }
    loadAssessment();
  }, [user]);

  const handleSaveResponse = async (questionId: string) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updatedAssessment = {
        ...assessment,
        [questionId]: tempResponse.trim()
      };
      await saveAssessment(user.uid, updatedAssessment);
      setAssessment(updatedAssessment);
      setEditingResponse(null);
    } catch (err) {
      console.error('Error saving response:', err);
    } finally {
      setIsSaving(false);
    }
  };

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

      // Delete user's assessment data
      await deleteDoc(doc(db, 'assessments', user.uid));
      
      // Delete Firebase user
      await deleteUser(user);
      
      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetAssessment = async () => {
    if (!showResetConfirmation) {
      setShowResetConfirmation(true);
      return;
    }

    setIsResetting(true);
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      await deleteAssessmentData(user.uid);
      setAssessment({});
      setShowResetConfirmation(false);
      // Refresh the page to show empty assessment
      router.refresh();
    } catch (err) {
      console.error('Error resetting assessment:', err);
    } finally {
      setIsResetting(false);
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
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back Button */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>

          {/* Account Info Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
            <div className="border-b pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Account Information</h2>
              <p className="text-sm text-gray-600">
                Email: {user.email}
              </p>
            </div>
          </div>

          {/* Assessment Review Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Initial Assessment</h2>
              <button
                onClick={handleResetAssessment}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 rounded-md"
              >
                Reset Assessment
              </button>
            </div>
            {showResetConfirmation && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 mb-3">
                  Are you sure you want to reset your assessment? This will delete all your responses and insights.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleResetAssessment}
                    disabled={isResetting}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    {isResetting ? 'Resetting...' : 'Yes, Reset Assessment'}
                  </button>
                  <button
                    onClick={() => setShowResetConfirmation(false)}
                    disabled={isResetting}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="border-b pb-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">{question.text}</p>
                  {editingResponse === question.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={tempResponse}
                        onChange={(e) => setTempResponse(e.target.value)}
                        className="w-full h-24 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Your response..."
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveResponse(question.id)}
                          disabled={isSaving}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingResponse(null)}
                          disabled={isSaving}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative">
                      <p className="text-gray-600 text-sm">
                        {assessment[question.id] || 'No response yet'}
                      </p>
                      <button
                        onClick={() => {
                          setEditingResponse(question.id);
                          setTempResponse(assessment[question.id] || '');
                        }}
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Account Deletion Section */}
          <div className="bg-white rounded-lg shadow p-6">
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
    </ProtectedRoute>
  );
} 