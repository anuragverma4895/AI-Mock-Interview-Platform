import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QuestionCategory {
  category: 'DSA' | 'SystemDesign' | 'DB' | 'HR' | 'Project';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GeneratedQuestion {
  question: string;
  category: string;
  difficulty: string;
  idealAnswer: string;
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
}

export const generateQuestion = async (
  category: string,
  difficulty: string,
  resumeSkills?: string[],
  projectNames?: string[]
): Promise<GeneratedQuestion> => {
  const skillContext = resumeSkills?.length ? `Based on candidate's skills: ${resumeSkills.join(', ')}.` : '';
  const projectContext = projectNames?.length ? `Related to projects: ${projectNames.join(', ')}.` : '';

  const prompt = `You are an expert technical interviewer. Generate a ${difficulty} level ${category} interview question.

${skillContext}
${projectContext}

Provide a practical, real-world question that tests real-world understanding.

Return ONLY a JSON object with this exact format:
{
  "question": "the interview question",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "idealAnswer": "a comprehensive ideal answer"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates interview questions in JSON format.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Empty response from OpenAI');
    }

    return JSON.parse(response) as GeneratedQuestion;
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error('Failed to generate question');
  }
};

export const evaluateAnswer = async (
  question: string,
  answer: string,
  category: string,
  difficulty: string,
  idealAnswer?: string
): Promise<AnswerEvaluation> => {
  const prompt = `You are an expert technical interviewer. Evaluate the following interview answer.

Question: ${question}
Category: ${category}
Difficulty: ${difficulty}
User's Answer: ${answer}
${idealAnswer ? `Reference Ideal Answer: ${idealAnswer}` : ''}

Evaluate based on these criteria (each scored 0-5):
1. Understanding of the problem
2. Approach and methodology
3. Edge cases handling
4. Time/space complexity awareness
5. Communication and clarity

Return ONLY a JSON object with this exact format:
{
  "score": number (0-5),
  "feedback": "overall feedback summary",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "idealAnswer": "ideal answer for reference"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that evaluates interview answers in JSON format.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('Empty response from OpenAI');
    }

    return JSON.parse(response) as AnswerEvaluation;
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw new Error('Failed to evaluate answer');
  }
};

export const generateFinalReport = async (
  questions: Array<{ question: string; answer: string; score: number; feedback: string }>,
  bodyLanguageData?: { confidenceScore: number; suggestions: string[] }
): Promise<string> => {
  const questionsSummary = questions
    .map((q, i) => `Q${i + 1}: ${q.question}\nScore: ${q.score}/5\nFeedback: ${q.feedback}`)
    .join('\n\n');

  const bodyLanguageSummary = bodyLanguageData
    ? `\n\nBody Language Analysis:\n- Confidence Score: ${bodyLanguageData.confidenceScore}/100\n- Suggestions: ${bodyLanguageData.suggestions.join(', ')}`
    : '';

  const prompt = `Generate a comprehensive final interview report.

Interview Performance Summary:
${questionsSummary}
${bodyLanguageSummary}

Provide a detailed report with:
1. Overall performance summary
2. Strengths demonstrated
3. Areas for improvement
4. Specific recommendations for preparation
5. Final verdict and next steps

Return as a well-formatted report.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates interview reports.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content || 'Failed to generate report';
  } catch (error) {
    console.error('Error generating final report:', error);
    return 'Failed to generate final report';
  }
};

export const generateFollowUpQuestion = async (
  previousQuestion: string,
  previousAnswer: string,
  category: string
): Promise<string> => {
  const prompt = `Generate a follow-up question based on the previous question and answer.

Previous Question: ${previousQuestion}
Previous Answer: ${previousAnswer}
Category: ${category}

The follow-up should probe deeper into the same topic or test understanding of edge cases.

Return ONLY the follow-up question as a string.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Could you elaborate more on your approach?';
  } catch (error) {
    console.error('Error generating follow-up:', error);
    return 'Could you elaborate more on your approach?';
  }
};