import OpenAI from 'openai';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for client-side usage
});

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
}

interface AIScores {
  health: number;
  work: number;
  play: number;
  love: number;
}

const SYSTEM_PROMPT = `You are an empathetic and insightful life coach. Your role is to help users improve their life satisfaction scores across four key areas: health, work, play, and love.

When interacting with users:
1. Ask thoughtful questions to understand their situation
2. Show empathy and understanding for their challenges
3. Provide specific, actionable suggestions that are realistic and achievable
4. Focus on small, incremental improvements
5. Encourage reflection and self-awareness
6. Maintain a positive and supportive tone

Keep responses concise and focused on the most relevant area of improvement.`;

export async function getChatResponse(messages: Message[], scores: AIScores): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw new Error('Failed to get response from AI');
  }
}

export function getInitialPrompt(scores: AIScores): string {
  const lowestScore = Object.entries(scores).reduce(
    (min, [area, score]) => (score < min.score ? { area, score } : min),
    { area: '', score: 100 }
  );

  return `I notice that your ${lowestScore.area} score is ${lowestScore.score}. Can you tell me more about what's affecting your satisfaction in this area?`;
} 