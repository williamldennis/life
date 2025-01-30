import React, { useState, useRef, useEffect } from 'react';

interface LifeBalanceGaugeProps {
  area: 'health' | 'work' | 'play' | 'love';
  score: number;
  onScoreChange: (value: number) => void;
}

const areaConfig = {
  health: {
    label: 'Health',
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    description: 'Physical and mental wellbeing'
  },
  work: {
    label: 'Work',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    description: 'Career and productivity'
  },
  play: {
    label: 'Play',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    description: 'Fun and recreation'
  },
  love: {
    label: 'Love',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    description: 'Relationships and connection'
  }
};

export default function LifeBalanceGauge({ area, score, onScoreChange }: LifeBalanceGaugeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const config = areaConfig[area];
  
  // SVG parameters
  const size = 100;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Calculate the circumference
  const circumference = 2 * Math.PI * radius;
  
  // We'll show 75% of the circle (270 degrees)
  const maxAngle = 270;
  const startAngle = 135; // Start at 135 degrees (bottom center)
  
  // Calculate the dash offset based on score
  const dashOffset = circumference - (score / 100) * (circumference * 0.75);
  
  // Calculate the SVG arc path
  const arcPath = `
    M ${center + radius * Math.cos((startAngle * Math.PI) / 180)} 
      ${center + radius * Math.sin((startAngle * Math.PI) / 180)}
    A ${radius} ${radius} 0 1 1
      ${center + radius * Math.cos(((startAngle + maxAngle) * Math.PI) / 180)}
      ${center + radius * Math.sin(((startAngle + maxAngle) * Math.PI) / 180)}
  `;

  const calculateScore = (event: React.MouseEvent<SVGSVGElement> | MouseEvent) => {
    if (!svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const centerX = svgRect.left + svgRect.width / 2;
    const centerY = svgRect.top + svgRect.height / 2;

    // Calculate angle from center to mouse position
    const angle = Math.atan2(
      event.clientY - centerY,
      event.clientX - centerX
    ) * 180 / Math.PI;

    // Normalize the angle to start from bottom left (135 degrees) going clockwise
    let adjustedAngle = (angle - 135) % 360;
    if (adjustedAngle < 0) adjustedAngle += 360;
    
    // Clamp the angle to our maxAngle (270)
    if (adjustedAngle > maxAngle) {
      adjustedAngle = maxAngle;
    }

    // Convert angle to score (0-100)
    // Now 0 degrees (bottom left) = 0 score, 270 degrees (bottom right) = 100 score
    const newScore = Math.round((adjustedAngle / maxAngle) * 100);
    onScoreChange(newScore);
  };

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    setIsDragging(true);
    calculateScore(event);
  };

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    // Only handle click if we weren't dragging
    if (!isDragging) {
      calculateScore(event);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      calculateScore(event);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[100px] h-[100px] group cursor-pointer">
        <svg
          ref={svgRef}
          width={size}
          height={size}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          {/* Background track */}
          <path
            d={arcPath}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Colored progress */}
          <path
            d={arcPath}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={`${config.color} ${isDragging ? 'opacity-75' : ''}`}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: isDragging ? 'none' : 'stroke-dashoffset 0.3s ease' }}
          />
          
          {/* White background circle for score */}
          <circle
            cx={center}
            cy={center}
            r={20}
            fill="white"
          />
          
          {/* Score text - no rotation needed since we're not rotating the SVG */}
          <text
            x="50%"
            y="50%"
            dy=".35em"
            textAnchor="middle"
            className="text-2xl font-bold fill-gray-900"
          >
            {score}
          </text>
        </svg>
      </div>
      <span className="mt-2 text-sm font-semibold text-gray-700">{config.label}</span>
      <span className="text-xs text-gray-500 text-center">{config.description}</span>
    </div>
  );
} 