export function getInitialPrompt(scores: Record<string, number>): string {
  return `I am your AI life coach. Based on your current life balance scores:
  
Health: ${scores.health}%
Work: ${scores.work}%
Play: ${scores.play}%
Love: ${scores.love}%

How can I help you improve these areas of your life?`;
}

export async function getChatResponse(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  scores: Record<string, number>,
  assessment?: Record<string, string>
): Promise<string> {
  // TODO: Implement actual OpenAI chat completion
  return "I'm here to help you improve your life balance. What specific area would you like to focus on?";
} 