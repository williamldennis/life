import React, { useState } from 'react';

interface Question {
  id: string;
  text: string;
  area: 'health' | 'work' | 'play' | 'love';
}

const questions: Question[] = [
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

interface InitialAssessmentProps {
  onComplete: (responses: Record<string, string>) => void;
  onSkip?: () => void;
}

export default function InitialAssessment({ onComplete, onSkip }: InitialAssessmentProps) {
  const [currentArea, setCurrentArea] = useState<'health' | 'work' | 'play' | 'love'>('health');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentResponse, setCurrentResponse] = useState('');

  const areaQuestions = questions.filter(q => q.area === currentArea);
  const currentQuestionIndex = areaQuestions.findIndex(q => !responses[q.id]);
  const currentQuestion = areaQuestions[currentQuestionIndex];

  const areas = ['health', 'work', 'play', 'love'] as const;
  const areaColors = {
    health: 'bg-green-500',
    work: 'bg-blue-500',
    play: 'bg-yellow-500',
    love: 'bg-red-500'
  };

  const handleNext = () => {
    if (!currentResponse.trim()) return;

    // Save current response
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: currentResponse.trim()
    }));
    setCurrentResponse('');

    // If we've completed all questions in this area, move to next area
    if (currentQuestionIndex === areaQuestions.length - 1) {
      const currentAreaIndex = areas.indexOf(currentArea);
      if (currentAreaIndex < areas.length - 1) {
        setCurrentArea(areas[currentAreaIndex + 1]);
      } else {
        // We're done with all questions
        onComplete(responses);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const progress = (Object.keys(responses).length / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Let's get to know you better
            </h2>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip for now
              </button>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-6 flex-1">
          <div className="flex space-x-2 mb-6">
            {areas.map(area => (
              <div
                key={area}
                className={`px-3 py-1 rounded-full text-sm ${
                  currentArea === area
                    ? `${areaColors[area]} text-white`
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {area.charAt(0).toUpperCase() + area.slice(1)}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentQuestion.text}
            </h3>
            <textarea
              value={currentResponse}
              onChange={(e) => setCurrentResponse(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response here..."
              className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="p-6 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Question {Object.keys(responses).length + 1} of {questions.length}
            </span>
            <button
              onClick={handleNext}
              disabled={!currentResponse.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === areaQuestions.length - 1 && currentArea === 'love'
                ? 'Complete'
                : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 