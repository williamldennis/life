import React from 'react';
import { AssessmentInsights } from '@/lib/firebase';

interface RecentInsightsProps {
  insights: AssessmentInsights | null;
  isLoading: boolean;
}

export default function RecentInsights({ insights, isLoading }: RecentInsightsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Recent Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-6 shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Recent Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Key Takeaways</h3>
            <p className="text-gray-600">Your recent insights and takeaways will appear here...</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold mb-4">Action Items</h3>
            <p className="text-gray-600">Your personalized action items will appear here...</p>
          </div>
        </div>
      </div>
    );
  }

  const areas = ['health', 'work', 'play', 'love'] as const;
  const areaIcons = {
    health: '💪',
    work: '💼',
    play: '🎮',
    love: '❤️'
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Recent Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Key Takeaways</h3>
          <div className="space-y-4">
            {areas.map(area => (
              <div key={`takeaway-${area}`} className="space-y-2">
                <h4 className="text-md font-medium flex items-center">
                  <span className="mr-2">{areaIcons[area]}</span>
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {insights.takeaways[area].map((takeaway, index) => (
                    <li key={index} className="text-gray-600 text-sm">
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Action Items</h3>
          <div className="space-y-4">
            {areas.map(area => (
              <div key={`action-${area}`} className="space-y-2">
                <h4 className="text-md font-medium flex items-center">
                  <span className="mr-2">{areaIcons[area]}</span>
                  {area.charAt(0).toUpperCase() + area.slice(1)}
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {insights.actionItems[area].map((action, index) => (
                    <li key={index} className="text-gray-600 text-sm">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 