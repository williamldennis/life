'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const lifeAreas = [
  { 
    id: 'health', 
    label: 'Health',
    description: 'Physical and mental wellbeing, fitness, nutrition, and sleep',
    color: 'bg-green-500' 
  },
  { 
    id: 'work', 
    label: 'Work',
    description: 'Career growth, professional development, and work-life balance',
    color: 'bg-blue-500' 
  },
  { 
    id: 'play', 
    label: 'Play',
    description: 'Hobbies, recreation, fun activities, and personal interests',
    color: 'bg-yellow-500' 
  },
  { 
    id: 'love', 
    label: 'Love',
    description: 'Relationships, family, friendships, and emotional connections',
    color: 'bg-red-500' 
  },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [scores, setScores] = useState({
    health: 50,
    work: 50,
    play: 50,
    love: 50,
  });

  const handleScoreChange = (area: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [area]: value
    }));
  };

  const handleSubmit = async () => {
    // TODO: Save scores to database
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Life Coach Journey
          </h1>
          <p className="text-lg text-gray-600">
            Let's start by assessing where you are in each area of your life.
            Rate each area from 0 to 100, where 0 means "needs significant improvement"
            and 100 means "completely satisfied".
          </p>
        </div>

        <div className="space-y-8">
          {lifeAreas.map((area) => (
            <div key={area.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{area.label}</h2>
                <span className="text-2xl font-bold text-gray-700">
                  {scores[area.id as keyof typeof scores]}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{area.description}</p>
              <input
                type="range"
                min="0"
                max="100"
                value={scores[area.id as keyof typeof scores]}
                onChange={(e) => handleScoreChange(area.id, parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Needs Improvement</span>
                <span>Satisfied</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
