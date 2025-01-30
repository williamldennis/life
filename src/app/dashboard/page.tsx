'use client';

import React, { useState } from 'react';
import AIChat from '@/components/AIChat';
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
  const [scores, setScores] = useState({
    health: 75,
    work: 60,
    play: 85,
    love: 70,
  });
  const [showChat, setShowChat] = useState(false);
  const [activeArea, setActiveArea] = useState<string | null>(null);

  const handleScoreChange = (area: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [area]: value
    }));
    // TODO: Save to database
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Life Balance</h2>
                <p className="text-sm text-gray-600">
                  Track your satisfaction levels and get AI coaching to improve each area
                </p>
              </div>
              <Link
                href="/settings"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {lifeAreas.map((area) => (
                <div
                  key={area.id}
                  className="flex flex-col items-center"
                  onMouseEnter={() => setActiveArea(area.id)}
                  onMouseLeave={() => setActiveArea(null)}
                >
                  <div className="relative w-20 h-[200px] group">
                    {/* Background gauge */}
                    <div className="absolute inset-0 bg-gray-200 rounded-lg border-2 border-gray-300" />
                    
                    {/* Colored fill */}
                    <div
                      className={`absolute bottom-0 w-full transition-all duration-300 ${area.color} rounded-lg`}
                      style={{ height: `${scores[area.id as keyof typeof scores]}%` }}
                    />

                    {/* Score display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-700">
                        {scores[area.id as keyof typeof scores]}%
                      </span>
                    </div>

                    {/* Hover slider */}
                    {activeArea === area.id && (
                      <div className="absolute -right-28 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-lg shadow-lg z-10 w-24">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={scores[area.id as keyof typeof scores]}
                          onChange={(e) => handleScoreChange(area.id, parseInt(e.target.value))}
                          className={`w-full h-2 appearance-none rounded-lg ${area.color} cursor-pointer`}
                        />
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-lg font-semibold text-gray-700">{area.label}</span>
                  <span className="text-sm text-gray-500">{area.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Coach Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">AI Life Coach</h3>
                <p className="text-sm text-gray-600">Get personalized guidance and actionable steps</p>
              </div>
              <button
                onClick={() => setShowChat(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Chat with AI Coach
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Recent Insights</h4>
                <p className="text-gray-600">
                  Your recent conversations and insights will appear here...
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Action Items</h4>
                <p className="text-gray-600">
                  Your personalized action items will appear here...
                </p>
              </div>
            </div>
          </div>
        </div>

        {showChat && (
          <AIChat 
            scores={scores} 
            onClose={() => setShowChat(false)} 
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
