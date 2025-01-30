import React, { useState, useEffect } from 'react';
import { getChatResponse, getInitialPrompt } from '@/lib/openai';
import InitialAssessment from './InitialAssessment';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface AIScores {
  health: number;
  work: number;
  play: number;
  love: number;
}

interface AIChatProps {
  scores: AIScores;
  onClose?: () => void;
}

export default function AIChat({ scores, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAssessment, setShowAssessment] = useState(true);
  const [assessment, setAssessment] = useState<Record<string, string> | undefined>();

  useEffect(() => {
    // Only initialize chat after assessment is complete or skipped
    if (!showAssessment) {
      const initializeChat = async () => {
        setIsLoading(true);
        try {
          const initialMessage = getInitialPrompt(scores);
          setMessages([{ role: 'assistant', content: initialMessage }]);
        } catch (error) {
          console.error('Error initializing chat:', error);
        } finally {
          setIsLoading(false);
        }
      };

      initializeChat();
    }
  }, [scores, showAssessment]);

  const handleAssessmentComplete = (responses: Record<string, string>) => {
    setAssessment(responses);
    setShowAssessment(false);
  };

  const handleAssessmentSkip = () => {
    setShowAssessment(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const aiResponse = await getChatResponse(
        [...messages, { role: 'user', content: userMessage }],
        scores,
        assessment
      );
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I apologize, but I'm having trouble responding right now. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showAssessment) {
    return (
      <InitialAssessment
        onComplete={handleAssessmentComplete}
        onSkip={handleAssessmentSkip}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Life Coach Assistant</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'assistant'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-blue-100 text-blue-900 p-3 rounded-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 