'use client';

import { useState } from 'react';

const lifeAreas = [
  { id: 'health', label: 'Health', color: 'bg-green-500' },
  { id: 'work', label: 'Work', color: 'bg-blue-500' },
  { id: 'play', label: 'Play', color: 'bg-yellow-500' },
  { id: 'love', label: 'Love', color: 'bg-red-500' },
];

export default function DashboardPage() {
  const [scores] = useState({
    health: 75,
    work: 60,
    play: 85,
    love: 70,
  });

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Life Balance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {lifeAreas.map((area) => (
            <div
              key={area.id}
              className="flex flex-col items-center"
            >
              <div className="relative w-20 h-[200px] bg-gray-200 rounded-lg overflow-hidden border-2 border-gray-300">
                <div
                  className={`absolute bottom-0 w-full transition-all duration-1000 ${area.color}`}
                  style={{ height: `${scores[area.id as keyof typeof scores]}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700">
                    {scores[area.id as keyof typeof scores]}%
                  </span>
                </div>
              </div>
              <span className="mt-2 text-lg font-semibold text-gray-700">{area.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-gray-600">Your activity feed will appear here...</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Insights</h3>
          <p className="text-gray-600">Your personalized insights will appear here...</p>
        </div>
      </div>
    </div>
  );
} 