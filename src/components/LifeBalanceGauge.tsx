import React, { useState } from 'react';

interface LifeBalanceGaugeProps {
  area: 'health' | 'work' | 'play' | 'love';
  score: number;
  onScoreChange: (value: number) => void;
}

const areaConfig = {
  health: {
    label: 'Health',
    color: 'bg-green-500',
    description: 'Physical and mental wellbeing'
  },
  work: {
    label: 'Work',
    color: 'bg-blue-500',
    description: 'Career and productivity'
  },
  play: {
    label: 'Play',
    color: 'bg-yellow-500',
    description: 'Fun and recreation'
  },
  love: {
    label: 'Love',
    color: 'bg-red-500',
    description: 'Relationships and connection'
  }
};

export default function LifeBalanceGauge({ area, score, onScoreChange }: LifeBalanceGaugeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const config = areaConfig[area];

  return (
    <div
      className="flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-20 h-[200px] group">
        {/* Background gauge */}
        <div className="absolute inset-0 bg-gray-200 rounded-lg border-2 border-gray-300" />
        
        {/* Colored fill */}
        <div
          className={`absolute bottom-0 w-full transition-all duration-300 ${config.color} rounded-lg`}
          style={{ height: `${score}%` }}
        />

        {/* Score display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-700">
            {score}%
          </span>
        </div>

        {/* Hover slider */}
        {isHovered && (
          <div className="absolute -right-28 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-lg shadow-lg z-10 w-24">
            <input
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(e) => onScoreChange(parseInt(e.target.value))}
              className={`w-full h-2 appearance-none rounded-lg ${config.color} cursor-pointer`}
            />
          </div>
        )}
      </div>
      <span className="mt-2 text-lg font-semibold text-gray-700">{config.label}</span>
      <span className="text-sm text-gray-500">{config.description}</span>
    </div>
  );
} 