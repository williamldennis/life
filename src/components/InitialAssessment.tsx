import React, { useState, useEffect } from 'react';
import { saveInsights, type AssessmentInsights } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [currentArea, setCurrentArea] = useState<'health' | 'work' | 'play' | 'love'>('health');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentResponse, setCurrentResponse] = useState('');

  const areaQuestions = questions.filter(q => q.area === currentArea);
  const currentQuestionIndex = areaQuestions.findIndex(q => !responses[q.id]);
  const currentQuestion = areaQuestions[currentQuestionIndex];

  // Check if all questions are completed
  useEffect(() => {
    if (Object.keys(responses).length === questions.length) {
      onComplete(responses);
    }
  }, [responses, onComplete]);

  const areas = ['health', 'work', 'play', 'love'] as const;
  const areaColors = {
    health: 'bg-green-500',
    work: 'bg-blue-500',
    play: 'bg-yellow-500',
    love: 'bg-red-500'
  };

  const generateInsights = (responses: Record<string, string>): AssessmentInsights => {
    console.log('Generating insights from responses:', responses);
    
    const insights: AssessmentInsights = {
      takeaways: {
        health: [],
        work: [],
        play: [],
        love: []
      },
      actionItems: {
        health: [],
        work: [],
        play: [],
        love: []
      },
      generatedAt: Date.now()
    };

    // Group responses by area
    const responsesByArea: Record<string, string[]> = {
      health: [],
      work: [],
      play: [],
      love: []
    };

    questions.forEach(question => {
      const response = responses[question.id];
      if (response) {
        responsesByArea[question.area].push(response);
      }
    });

    console.log('Responses grouped by area:', responsesByArea);

    // Generate insights for each area
    Object.entries(responsesByArea).forEach(([area, areaResponses]) => {
      if (area === 'health') {
        insights.takeaways.health = [
          'Your current exercise routine shows room for improvement',
          'Sleep patterns could be optimized for better rest',
          'Nutrition habits indicate a balanced approach'
        ];
        insights.actionItems.health = [
          'Schedule 3 workout sessions per week',
          'Set a consistent sleep schedule',
          'Plan meals in advance'
        ];
      } else if (area === 'work') {
        insights.takeaways.work = [
          'Career goals are well-defined',
          'Work-life balance needs attention',
          'Professional development is a priority'
        ];
        insights.actionItems.work = [
          'Create a 5-year career plan',
          'Set boundaries for work hours',
          'Identify key skills to develop'
        ];
      } else if (area === 'play') {
        insights.takeaways.play = [
          'Regular leisure activities contribute to well-being',
          'New experiences are valued',
          'Creative outlets are important'
        ];
        insights.actionItems.play = [
          'Try one new activity monthly',
          'Schedule dedicated hobby time',
          'Plan a fun weekend activity'
        ];
      } else if (area === 'love') {
        insights.takeaways.love = [
          'Relationships are a priority',
          'Communication patterns show care',
          'Personal growth in relationships is valued'
        ];
        insights.actionItems.love = [
          'Plan quality time with loved ones',
          'Practice active listening',
          'Express gratitude daily'
        ];
      }
    });

    console.log('Generated insights:', insights);
    return insights;
  };

  const handleNext = async () => {
    if (!currentResponse.trim() || !currentQuestion) return;

    // Save current response
    const updatedResponses = {
      ...responses,
      [currentQuestion.id]: currentResponse.trim()
    };
    setResponses(updatedResponses);
    setCurrentResponse('');

    // If we've completed all questions in this area, move to next area
    if (currentQuestionIndex === areaQuestions.length - 1) {
      const currentAreaIndex = areas.indexOf(currentArea);
      if (currentAreaIndex < areas.length - 1) {
        setCurrentArea(areas[currentAreaIndex + 1]);
      } else {
        // All questions are completed
        console.log('Assessment completed, generating insights...');
        const insights = generateInsights(updatedResponses);
        try {
          if (user) {
            console.log('Saving insights for user:', user.uid);
            await saveInsights(user.uid, insights);
            console.log('Insights saved successfully');
          }
        } catch (error) {
          console.error('Error saving insights:', error);
        }
        onComplete(updatedResponses);
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

  // If all questions are answered, show loading state
  if (!currentQuestion) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
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

      <div className="flex-1 overflow-y-auto p-4">
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

      <div className="p-4 border-t">
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
  );
} 