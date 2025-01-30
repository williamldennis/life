'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LifeBalanceGauge from '@/components/LifeBalanceGauge';
import AIChat from '@/components/AIChat';
import RecentInsights from '@/components/RecentInsights';
import { getInsights, type AssessmentInsights } from '@/lib/firebase';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

const lifeAreas = [
  { 
    id: 'health', 
    label: 'Health', 
    color: 'bg-green-500',
    description: 'Physical and mental wellbeing'
  },
  { 
    id: 'work', 
    label: 'Work', 
    color: 'bg-blue-500',
    description: 'Career and productivity'
  },
  { 
    id: 'play', 
    label: 'Play', 
    color: 'bg-yellow-500',
    description: 'Recreation and hobbies'
  },
  { 
    id: 'love', 
    label: 'Love', 
    color: 'bg-red-500',
    description: 'Relationships and connection'
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [insights, setInsights] = useState<AssessmentInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);
  const [scores, setScores] = useState({
    health: 50,
    work: 50,
    play: 50,
    love: 50
  });
  const [activeArea, setActiveArea] = useState<string | null>(null);

  useEffect(() => {
    async function loadInsights() {
      if (!user) return;
      setIsLoadingInsights(true);
      console.log('Loading insights for user:', user.uid);
      try {
        const data = await getInsights(user.uid);
        console.log('Loaded insights:', data);
        setInsights(data);
      } catch (error) {
        console.error('Error loading insights:', error);
      } finally {
        setIsLoadingInsights(false);
      }
    }
    loadInsights();
  }, [user]);

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
    router.push('/');
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-2xl font-bold text-indigo-600">Life Coach</h1>
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  href="/settings"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Life Balance and Insights */}
            <div className="lg:col-span-2 space-y-8">
              {/* Life Balance Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Life Balance</h2>
                <div className="grid grid-cols-2 gap-4">
                  <LifeBalanceGauge
                    area="health"
                    score={scores.health}
                    onScoreChange={(value: number) => setScores(prev => ({ ...prev, health: value }))}
                  />
                  <LifeBalanceGauge
                    area="work"
                    score={scores.work}
                    onScoreChange={(value: number) => setScores(prev => ({ ...prev, work: value }))}
                  />
                  <LifeBalanceGauge
                    area="play"
                    score={scores.play}
                    onScoreChange={(value: number) => setScores(prev => ({ ...prev, play: value }))}
                  />
                  <LifeBalanceGauge
                    area="love"
                    score={scores.love}
                    onScoreChange={(value: number) => setScores(prev => ({ ...prev, love: value }))}
                  />
                </div>
              </div>

              {/* Recent Insights Section */}
              <RecentInsights insights={insights} isLoading={isLoadingInsights} />
            </div>

            {/* Right Column: AI Chat */}
            <div className="lg:col-span-1">
              <AIChat scores={scores} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
