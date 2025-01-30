import React, { useState, useEffect, useRef } from 'react';
import { getChatResponse, getInitialPrompt } from '@/lib/ai';
import { getAssessment, saveAssessment } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import InitialAssessment from './InitialAssessment';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  scores: Record<string, number>;
  onClose?: () => void;
}

export default function AIChat({ scores, onClose }: AIChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(true);
  const [assessment, setAssessment] = useState<Record<string, string> | undefined>();
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load existing assessment data
  useEffect(() => {
    async function loadAssessment() {
      if (!user) return;

      try {
        setError(null);
        const existingAssessment = await getAssessment(user.uid);
        if (existingAssessment) {
          setAssessment(existingAssessment.responses);
          setShowAssessment(false);
        }
      } catch (error: any) {
        console.error('Error loading assessment:', error);
        setError(error.message || 'Failed to load assessment data');
      } finally {
        setIsLoading(false);
      }
    }

    loadAssessment();
  }, [user]);

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

  const handleAssessmentComplete = async (responses: Record<string, string>) => {
    if (!user) return;

    try {
      setError(null);
      await saveAssessment(user.uid, responses);
      setAssessment(responses);
      setShowAssessment(false);
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      setError(error.message || 'Failed to save assessment data');
    }
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
      <div className="h-full flex flex-col">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        <InitialAssessment
          onComplete={handleAssessmentComplete}
          onSkip={handleAssessmentSkip}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Your Life Coach Assistant</h2>
        <p className="text-sm text-gray-600">Get personalized guidance and support</p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

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
        <div ref={messagesEndRef} />
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
  );
} 