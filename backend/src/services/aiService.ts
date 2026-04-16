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

const getRandomQuestion = (category: string) => {
  const questions = QUESTION_BANK[category as keyof typeof QUESTION_BANK] || QUESTION_BANK.DSA;
  return questions[Math.floor(Math.random() * questions.length)];
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
 * Generic AI completion helper using native fetch for Gemini with OpenAI fallback and retry logic
 */
async function getAICompletion(prompt: string, systemPrompt: string = "You are Alex, a friendly technical interviewer."): Promise<string> {
  const callAI = async (bail: (error: Error) => void, attempt: number) => {
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
          if (response.status >= 500) throw error; 
          bail(error); 
        }

        const data: any = await response.json();
        const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!result) throw new Error('Empty response from Gemini');
        return result;
      } catch (error) {
        console.error('Gemini API Error:', error);
        // If it's the first attempt and we have OpenAI, fall through.
        // Otherwise throw to trigger retry or fail.
        if (attempt > 1 || !openai) {
           throw error;
        }
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
        if (error?.message?.includes('rate limit') || error?.message?.includes('timeout')) {
          throw error; 
        }
        bail(error);
      }
    }

    throw new Error('No AI service available');
  };

  try {
    return await retry(callAI, {
      retries: 2,
      minTimeout: 1000,
      maxTimeout: 3000
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
  projectNames?: string[],
  jobRole?: string
): Promise<GeneratedQuestion> => {
  if (!USE_AI) {
    const q = getRandomQuestion(category);
    return {
      question: q.question,
      category,
      difficulty: q.difficulty,
      idealAnswer: "A comprehensive answer covering key concepts and practical examples."
    };
  }

  try {
    const skillsContext = resumeSkills && resumeSkills.length > 0 
      ? `The candidate has these skills: ${resumeSkills.join(', ')}.` 
      : '';
    
    const projectContext = projectNames && projectNames.length > 0 
      ? `The candidate has worked on these projects: ${projectNames.join(', ')}.` 
      : '';

    const jobRoleContext = jobRole 
      ? `The candidate is interviewing for a ${jobRole} position.`
      : '';

    const prompt = `You are an expert technical interviewer. Generate a ${difficulty} level interview question for the category: ${category}.
    
    ${jobRoleContext}
    ${skillsContext}
    ${projectContext}
    
    Make the question specific to their background and target position if possible. Return ONLY the question text, nothing else.`;

    const questionText = await getAICompletion(prompt);
    
    const idealAnswerPrompt = `For this interview question: "${questionText}"
    
    The candidate is interviewing for a ${jobRole} position.
    
    Provide a concise but comprehensive ideal answer that would score 5/5 from an interviewer. Include:
    1. Main concept explanation
    2. Practical example or use case relevant to ${jobRole}
    3. Common pitfalls to avoid
    
    Keep the answer under 150 words but technical and detailed.`;

    const idealAnswer = await getAICompletion(idealAnswerPrompt, "You are preparing interview answer guidelines.");
    
    return {
      question: questionText || getRandomQuestion(category).question,
      category,
      difficulty,
      idealAnswer: idealAnswer || "Expected answer with practical examples"
    };
  } catch (error) {
    console.error('Error generating question:', error);
    const q = getRandomQuestion(category);
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
    return {
      score: 3,
      feedback: "Good attempt. Practice more to refine your answer.",
      strengths: ["Clear response", "Correct direction"],
      improvements: ["Add more detail", "Use technical terms"],
      idealAnswer: idealAnswer || "A detailed technical explanation.",
      followUpQuestion: "Can you elaborate on that?"
    };
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
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);

    return {
      score: data.score || 3,
      feedback: data.feedback || "Good attempt.",
      strengths: data.strengths || ["Basic understanding"],
      improvements: data.improvements || ["Need more depth"],
      idealAnswer: data.idealAnswer || idealAnswer || "A comprehensive technical answer.",
      followUpQuestion: data.followUpQuestion || "Tell me more."
    };
  } catch (error) {
    return {
      score: 3,
      feedback: "The AI evaluator is briefly unavailable, but you're doing great! Keep going.",
      strengths: ["Persistence", "Communication"],
      improvements: ["N/A"],
      idealAnswer: idealAnswer || "A detailed technical explanation.",
      followUpQuestion: "Next question coming up..."
    };
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
  const greetings = [
    `Hi there! Welcome to your mock interview. I'm Alex, and I'll be your interviewer today. Let's get started!`,
    `Hello! Great to have you here. I'm Alex, your AI interviewer. We'll have a friendly conversation about your skills. Ready?`,
    `Hey! Welcome to AI Mock Interview Platform. I'm Alex and I'll be conducting your interview today. Let's begin!`,
    `Hi! I'm Alex, your virtual interviewer. We'll talk about your technical skills and experience. Are you ready?`
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
};

export const getClosingMessage = async (
  finalScore: number,
  strongAreas: string[],
  improvements: string[]
): Promise<string> => {
  if (finalScore >= 4) {
    return `Great job! You showed excellent skills in ${strongAreas[0] || 'technical knowledge'}. Keep it up and you'll do amazing in real interviews!`;
  } else if (finalScore >= 3) {
    return `Good effort! You have a solid foundation in ${strongAreas[0] || 'several areas'}. Focus on ${improvements[0] || 'practicing more'} and you'll improve quickly. Best of luck!`;
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
    report += `Q${i+1}: ${q.category} (${q.difficulty}) - Score: ${q.score || 'N/A'}/5\n`;
  });
  
  report += `\n## Recommendations\n`;
  const weakCategories = Array.from(new Set(questions.filter(q => (q.score || 0) < 3).map(q => q.category)));
  report += `- Continue practicing ${weakCategories.join(', ') || 'technical skills'}\n`;
  report += `- Focus on communication skills\n`;
  report += `- Practice more real interview scenarios\n`;
  
  return report;
};