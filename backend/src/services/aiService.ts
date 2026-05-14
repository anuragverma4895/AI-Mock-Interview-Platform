import OpenAI from 'openai';
import retry from 'async-retry';

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
}) : null;

const USE_AI = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);

const QUESTION_BANK = {
  DSA: [
    { question: "Can you explain the difference between an array and a linked list?", difficulty: "easy" },
    { question: "What is the time complexity of accessing an element in an array?", difficulty: "easy" },
    { question: "Explain how a hash table works and what is hashing?", difficulty: "medium" },
    { question: "What is the difference between BFS and DFS?", difficulty: "medium" },
    { question: "Explain the concept of recursion and when would you use it?", difficulty: "easy" },
    { question: "What is a binary search tree and how does insertion work?", difficulty: "medium" },
    { question: "Can you explain the difference between stack and queue?", difficulty: "easy" },
    { question: "What is dynamic programming and when is it used?", difficulty: "hard" },
  ],
  SystemDesign: [
    { question: "How would you design a URL shortener like bit.ly?", difficulty: "medium" },
    { question: "Explain the architecture of a typical e-commerce platform?", difficulty: "hard" },
    { question: "What is load balancing and why is it important?", difficulty: "medium" },
    { question: "How would you design a chat application?", difficulty: "hard" },
    { question: "Explain the concept of microservices vs monolithic architecture?", difficulty: "medium" },
    { question: "What is caching and how would you implement it?", difficulty: "medium" },
  ],
  DB: [
    { question: "What is the difference between SQL and NoSQL databases?", difficulty: "easy" },
    { question: "Explain normalization and its types?", difficulty: "medium" },
    { question: "What are database indexes and how do they improve performance?", difficulty: "medium" },
    { question: "Explain ACID properties in databases?", difficulty: "medium" },
    { question: "What is the difference between INNER JOIN and OUTER JOIN?", difficulty: "easy" },
    { question: "How would you optimize a slow SQL query?", difficulty: "hard" },
  ],
  HR: [
    { question: "Tell me about yourself and your journey in tech?", difficulty: "easy" },
    { question: "What are your strengths and weaknesses?", difficulty: "easy" },
    { question: "Where do you see yourself in 5 years?", difficulty: "easy" },
    { question: "Why do you want to join our company?", difficulty: "easy" },
    { question: "Describe a challenging project you worked on?", difficulty: "medium" },
    { question: "How do you handle conflict in a team?", difficulty: "medium" },
  ],
  Project: [
    { question: "Walk me through a project you're most proud of?", difficulty: "medium" },
    { question: "What was the most difficult technical problem you solved?", difficulty: "medium" },
    { question: "Explain the architecture of your recent project?", difficulty: "hard" },
    { question: "What technologies did you use in your last project and why?", difficulty: "medium" },
    { question: "How do you handle debugging in your projects?", difficulty: "easy" },
  ]
};

const selectQuestion = (category: string, difficulty: string, conversationHistory: any[] = []) => {
  const questions = QUESTION_BANK[category as keyof typeof QUESTION_BANK] || QUESTION_BANK.DSA;
  const usedQuestions = new Set(
    conversationHistory
      .map(item => String(item.content || item.question || '').trim().toLowerCase())
      .filter(Boolean)
  );

  const matchingDifficulty = questions.filter(q => q.difficulty === difficulty);
  const candidates = matchingDifficulty.length > 0 ? matchingDifficulty : questions;
  return candidates.find(q => !usedQuestions.has(q.question.toLowerCase())) || candidates[0];
};

const clampScore = (score: unknown): number => {
  const numericScore = Number(score);
  if (!Number.isFinite(numericScore)) return 0;
  return Math.max(0, Math.min(5, Math.round(numericScore * 10) / 10));
};

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  DSA: ['complexity', 'time', 'space', 'array', 'linked', 'hash', 'tree', 'stack', 'queue', 'recursion', 'algorithm'],
  SystemDesign: ['scale', 'cache', 'database', 'load', 'latency', 'queue', 'service', 'api', 'storage', 'partition'],
  DB: ['index', 'query', 'table', 'schema', 'transaction', 'acid', 'join', 'normalization', 'sql', 'nosql'],
  HR: ['experience', 'team', 'communication', 'challenge', 'learning', 'strength', 'weakness', 'goal', 'conflict'],
  Project: ['architecture', 'technology', 'debug', 'problem', 'solution', 'feature', 'testing', 'deployment', 'impact'],
};

const evaluateAnswerLocally = (
  question: string,
  answer: string,
  category: string,
  idealAnswer?: string
): AnswerEvaluation => {
  const trimmedAnswer = answer.trim();
  const words = tokenize(trimmedAnswer);
  const uniqueWords = new Set(words);
  const expectedTokens = new Set([
    ...tokenize(question),
    ...tokenize(idealAnswer || ''),
    ...(CATEGORY_KEYWORDS[category] || []),
  ]);
  const matchedExpected = [...uniqueWords].filter(word => expectedTokens.has(word)).length;

  const lengthScore =
    words.length >= 90 ? 2 :
    words.length >= 50 ? 1.5 :
    words.length >= 25 ? 1 :
    words.length >= 10 ? 0.5 : 0;
  const relevanceScore = Math.min(2, matchedExpected * 0.35);
  const exampleScore = /\b(example|for instance|because|trade-?off|complexity|use case|in my project|we used)\b/i.test(trimmedAnswer) ? 0.7 : 0;
  const structureScore = /[.!?]\s+\w/.test(trimmedAnswer) || /first|second|then|finally|step/i.test(trimmedAnswer) ? 0.3 : 0;
  const score = clampScore(1 + lengthScore + relevanceScore + exampleScore + structureScore);

  const strengths = [
    words.length >= 25 ? 'Answer has enough detail to evaluate.' : 'Answer was submitted clearly.',
    matchedExpected > 0 ? `Covered relevant ${category} terms from the question.` : 'Stayed on the interview question.',
  ];

  const improvements = [
    words.length < 50 ? 'Add more depth with reasoning and concrete examples.' : 'Tighten the answer by highlighting trade-offs and decisions.',
    matchedExpected < 3 ? `Use more precise ${category} concepts connected to the question.` : 'Mention edge cases, limitations, or alternatives where relevant.',
  ];

  return {
    score,
    feedback: `Score is based on answer length, relevance to the question, use of ${category} concepts, examples, and structure.`,
    strengths,
    improvements,
    idealAnswer: idealAnswer || 'A strong answer should explain the core concept, discuss trade-offs, and include a practical example.',
    followUpQuestion: `Can you add one concrete example or trade-off for your ${category} answer?`,
  };
};

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
  followUpQuestion?: string;
}

/**
 * Generic AI completion helper using native fetch for Gemini with retry logic
 */
async function getAICompletion(prompt: string, systemPrompt: string = "You are Alex, a friendly technical interviewer."): Promise<string> {
  const callAI = async (bail: (error: Error) => void, attempt: number) => {
    console.log(`AI attempt ${attempt}`);

    // Try Gemini First using native fetch (no dependency needed)
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }]
          })
        });

        if (!response.ok) {
          const error = new Error(`Gemini API error: ${response.status}`);
          if (response.status >= 500) throw error; // Retry on server errors
          bail(error); // Don't retry on client errors
        }

        const data: any = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!result) throw new Error('Empty response from Gemini');
        return result;
      } catch (error: any) {
        console.error('Gemini API Error:', error);
        if (error.message.includes('API error')) throw error; // Retry
        // If network error, try OpenAI
      }
    }

    // Try OpenAI Second
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        });
        const result = completion.choices[0]?.message?.content;
        if (!result) throw new Error('Empty response from OpenAI');
        return result;
      } catch (error: any) {
        console.error('OpenAI API Error:', error);
        if (error.message.includes('rate limit') || error.message.includes('timeout')) {
          throw error; // Retry
        }
        bail(error); // Don't retry other errors
      }
    }

    throw new Error('No AI service available');
  };

  try {
    return await retry(callAI, {
      retries: 3,
      minTimeout: 1000,
      maxTimeout: 5000,
      onRetry: (error: any, attempt: number) => {
        console.log(`Retrying AI call, attempt ${attempt}:`, error.message);
      }
    });
  } catch (error) {
    console.error('All AI attempts failed:', error);
    throw new Error('AI service temporarily unavailable');
  }
}

export const generateInterviewQuestion = async (
  category: string,
  difficulty: string,
  conversationHistory: any[] = [],
  resumeSkills?: string[],
  projectNames?: string[]
): Promise<GeneratedQuestion> => {
  if (!USE_AI) {
    const q = selectQuestion(category, difficulty, conversationHistory);
    return {
      question: q.question,
      category,
      difficulty: q.difficulty,
      idealAnswer: "A comprehensive answer covering key concepts and practical examples."
    };
  }

  try {
    const prompt = `Generate a ${difficulty} level interview question for the category: ${category}. 
    ${resumeSkills ? `Base it on these skills: ${resumeSkills.join(', ')}.` : ''}
    ${projectNames ? `Base it on these projects: ${projectNames.join(', ')}.` : ''}
    Response format: Only return the question text.`;

    const response = await getAICompletion(prompt);
    
    return {
      question: response || selectQuestion(category, difficulty, conversationHistory).question,
      category,
      difficulty,
      idealAnswer: "Expected answer with practical examples"
    };
  } catch (error) {
    const q = selectQuestion(category, difficulty, conversationHistory);
    return {
      question: q.question,
      category,
      difficulty: q.difficulty,
      idealAnswer: "Expected answer with practical examples"
    };
  }
};

export const evaluateAnswer = async (
  question: string,
  answer: string,
  category: string,
  difficulty: string,
  conversationHistory: any[] = [],
  idealAnswer?: string
): Promise<AnswerEvaluation> => {
  if (!USE_AI) {
    return evaluateAnswerLocally(question, answer, category, idealAnswer);
  }

  try {
    const prompt = `Question: ${question}
    Candidate's Answer: ${answer}
    Category: ${category}
    
    Evaluate the answer and provide:
    1. A score (1-5)
    2. Constructive feedback
    3. 2-3 specific strengths
    4. 2-3 areas for improvement
    5. A concise ideal answer
    6. A relevant follow-up question
    
    Return the response as a JSON object with this structure:
    {
      "score": number,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"],
      "idealAnswer": "string",
      "followUpQuestion": "string"
    }`;

    const responseText = await getAICompletion(prompt, "You are a professional technical interviewer AI. Output ONLY valid JSON.");
    
    // Parse JSON safely
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    return {
      score: clampScore(data.score),
      feedback: data.feedback || "Evaluation completed from your answer.",
      strengths: Array.isArray(data.strengths) ? data.strengths : [],
      improvements: Array.isArray(data.improvements) ? data.improvements : [],
      idealAnswer: data.idealAnswer || idealAnswer || "A comprehensive technical answer.",
      followUpQuestion: data.followUpQuestion || "Tell me more."
    };
  } catch (error) {
    console.error('Evaluation Error:', error);
    return evaluateAnswerLocally(question, answer, category, idealAnswer);
  }
};

export const generateFollowUpQuestion = async (
  previousQuestion: string,
  previousAnswer: string,
  category: string,
  conversationHistory: any[] = []
): Promise<string> => {
  if (!USE_AI) return "Can you explain that in more detail?";

  try {
    const prompt = `The candidate just answered: "${previousAnswer}" to the question: "${previousQuestion}".
    Generate a natural, deep-dive follow-up question in the ${category} domain. 
    Output ONLY the question text.`;
    
    return await getAICompletion(prompt);
  } catch (error) {
    return "Can you explain your thought process behind that?";
  }
};

export const getGreeting = async (candidateName?: string): Promise<string> => {
  const name = candidateName?.trim() || 'there';
  return `Hi ${name}! Welcome to your mock interview. I'm Alex, your AI interviewer. Let's get started.`;
};

export const getClosingMessage = async (
  finalScore: number,
  strongAreas: string[],
  improvements: string[]
): Promise<string> => {
  if (finalScore >= 4) {
    return `Great job! You showed excellent skills in ${strongAreas[0] || 'technical knowledge'}. Keep it up and you'll do amazing in real interviews!`;
  } else if (finalScore >= 3) {
    return `Good effort! You have a solid foundation. Focus on ${improvements[0] || 'practicing more'} and you'll improve quickly. Best of luck!`;
  } else {
    return `Thank you for completing the interview! Keep practicing and don't give up. Every interview is a learning opportunity. All the best!`;
  }
};

export const generateFinalReport = async (
  questions: any[],
  bodyLanguageData?: any
): Promise<string> => {
  const validScores = questions.filter(q => q.score !== undefined);
  const avgScore = validScores.length > 0 
    ? validScores.reduce((sum, q) => sum + q.score, 0) / validScores.length 
    : 0;
  
  let report = `# Interview Report\n\n`;
  report += `## Overall Performance\n`;
  report += `Average Score: ${avgScore.toFixed(1)}/5\n\n`;
  report += `## Question Summary\n`;
  
  questions.forEach((q, i) => {
    report += `Q${i+1}: ${q.category} (${q.difficulty}) - Score: ${q.score !== undefined ? q.score : 'N/A'}/5\n`;
  });
  
  report += `\n## Recommendations\n`;
  const weakCategories = Array.from(new Set(questions.filter(q => (q.score || 0) < 3).map(q => q.category)));
  report += `- Continue practicing ${weakCategories.join(', ') || 'technical skills'}\n`;
  report += `- Focus on communication skills\n`;
  report += `- Practice more real interview scenarios\n`;
  
  return report;
};
