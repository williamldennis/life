'use client';

import { useState } from 'react';

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
  const [activeArea, setActiveArea] = useState<string | null>(null);

  const handleScoreChange = (area: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [area]: value
    }));
    // TODO: Save to database
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Life Balance</h2>
          <p className="text-sm text-gray-600">
            Hover over any gauge to adjust your current satisfaction level
          </p>
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
