import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question } from './storage';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ScoreResult {
  score: number;
  recommendation: 'Advance' | 'Maybe' | 'Pass';
  reasoning: string;
}

export async function scoreApplication(
  jobTitle: string,
  jobDescription: string,
  questions: Question[],
  answers: Record<string, string>,
  resumeText: string
): Promise<ScoreResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const questionsAndAnswers = questions.map(q =>
    `Q: ${q.text}\nA: ${answers[q.id] || 'No answer provided'}`
  ).join('\n\n');

  const prompt = `You are a hiring assistant. Score this job application from 1-10 and give a recommendation.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION:
${jobDescription}

APPLICANT ANSWERS:
${questionsAndAnswers}

RESUME:
${resumeText || 'No resume provided'}

Respond with ONLY valid JSON in this exact format, no markdown:
{
  "score": <integer 1-10>,
  "recommendation": "<Advance | Maybe | Pass>",
  "reasoning": "<2-3 sentences explaining the score>"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response');
  return JSON.parse(jsonMatch[0]);
}
