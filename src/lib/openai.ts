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

interface InitialAssessment {
  [key: string]: string;
}

function generateContextFromAssessment(assessment: InitialAssessment): string {
  const healthResponses = Object.entries(assessment)
    .filter(([key]) => key.startsWith('health'))
    .map(([_, value]) => value)
    .join('\n');

  const workResponses = Object.entries(assessment)
    .filter(([key]) => key.startsWith('work'))
    .map(([_, value]) => value)
    .join('\n');

  const playResponses = Object.entries(assessment)
    .filter(([key]) => key.startsWith('play'))
    .map(([_, value]) => value)
    .join('\n');

  const loveResponses = Object.entries(assessment)
    .filter(([key]) => key.startsWith('love'))
    .map(([_, value]) => value)
    .join('\n');

  return `User Background Information:

Health Context:
${healthResponses}

Work Context:
${workResponses}

Play Context:
${playResponses}

Love Context:
${loveResponses}`;
}

const SYSTEM_PROMPT = `You are an empathetic and insightful life coach. Your role is to help users improve their life satisfaction scores across four key areas: health, work, play, and love.

When interacting with users:
1. Ask thoughtful questions to understand their situation
2. Show empathy and understanding for their challenges
3. Provide specific, actionable suggestions that are realistic and achievable
4. Focus on small, incremental improvements
5. Encourage reflection and self-awareness
6. Maintain a positive and supportive tone
7. Reference their background information when relevant to show understanding
8. Make connections between different life areas when appropriate

Keep responses concise and focused on the most relevant area of improvement.`;

export async function getChatResponse(
  messages: Message[], 
  scores: AIScores,
  assessment?: InitialAssessment
): Promise<string> {
  try {
    const systemMessages: Message[] = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    if (assessment) {
      systemMessages.push({
        role: 'system',
        content: generateContextFromAssessment(assessment)
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        ...systemMessages,
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