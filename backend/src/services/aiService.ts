import OpenAI from 'openai';
<<<<<<< HEAD
import retry from 'async-retry';

// Initialize AI clients
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
}) : null;

const USE_AI = !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
=======

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  dangerouslyAllowBrowser: true
});

const USE_LOCAL_MODE = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-default-key-for-testing' || process.env.OPENAI_API_KEY === 'dummy-key';
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec

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

<<<<<<< HEAD
=======
const generateFeedback = (score: number) => {
  const feedbacks = {
    5: ["Excellent! You demonstrated deep understanding of the topic.", "Outstanding answer with great clarity and depth."],
    4: ["Good job! You have a solid understanding.", "Well explained with good practical knowledge."],
    3: ["Decent attempt. There's room for improvement.", "You covered the basics but can go deeper."],
    2: ["You have the right direction but need more depth.", "Consider exploring this topic further."],
    1: ["Let's explore this topic more. Can you elaborate?", "That's a start, but we need more details."],
  };
  const options = feedbacks[score as keyof typeof feedbacks] || feedbacks[3];
  return options[Math.floor(Math.random() * options.length)];
};

const generateStrengths = (score: number) => {
  if (score >= 4) return ["Good technical knowledge", "Clear communication", "Practical approach"];
  if (score >= 3) return ["Basic understanding", "Good attempt", "Decent communication"];
  return ["Enthusiasm to learn", "Willing to discuss", "Started in the right direction"];
};

const generateImprovements = (score: number, category: string) => {
  if (score >= 4) return ["Could add more real-world examples", "Consider system design aspects"];
  if (score >= 3) return ["Need more practice", "Study edge cases", "Add practical examples"];
  return ["Focus on fundamentals", "Practice more problems", "Read more about best practices"];
};

>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
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

<<<<<<< HEAD
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
      } catch (error) {
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
      } catch (error) {
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
      onRetry: (error, attempt) => {
        console.log(`Retrying AI call, attempt ${attempt}:`, error.message);
      }
    });
  } catch (error) {
    console.error('All AI attempts failed:', error);
    throw new Error('AI service temporarily unavailable');
  }
}

=======
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
export const generateInterviewQuestion = async (
  category: string,
  difficulty: string,
  conversationHistory: any[] = [],
  resumeSkills?: string[],
  projectNames?: string[]
): Promise<GeneratedQuestion> => {
<<<<<<< HEAD
  if (!USE_AI) {
=======
  if (USE_LOCAL_MODE || !process.env.OPENAI_API_KEY) {
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
    const q = getRandomQuestion(category);
    return {
      question: q.question,
      category,
      difficulty: q.difficulty,
      idealAnswer: "A comprehensive answer covering key concepts and practical examples."
    };
  }

  try {
<<<<<<< HEAD
    const prompt = `Generate a ${difficulty} level interview question for the category: ${category}. 
    ${resumeSkills ? `Base it on these skills: ${resumeSkills.join(', ')}.` : ''}
    ${projectNames ? `Base it on these projects: ${projectNames.join(', ')}.` : ''}
    Response format: Only return the question text.`;

    const response = await getAICompletion(prompt);
    
=======
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are Alex, a friendly technical interviewer.' },
        { role: 'user', content: `Generate a ${difficulty} ${category} interview question.` }
      ],
      temperature: 0.7,
    });
    const response = completion.choices[0]?.message?.content;
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
    return {
      question: response || getRandomQuestion(category).question,
      category,
      difficulty,
      idealAnswer: "Expected answer with practical examples"
    };
  } catch (error) {
<<<<<<< HEAD
=======
    console.error('API Error, using local mode:', error);
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
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
<<<<<<< HEAD
  if (!USE_AI) {
    // Fallback logic
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
    
    // Parse JSON safely
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
    console.error('Evaluation Error:', error);
    return {
      score: 3,
      feedback: "The AI evaluator is briefly unavailable, but you're doing great! Keep going.",
      strengths: ["Persistence", "Communication"],
      improvements: ["N/A"],
      idealAnswer: idealAnswer || "A detailed technical explanation.",
      followUpQuestion: "Next question coming up..."
    };
  }
=======
  const score = Math.floor(Math.random() * 3) + 3;
  const feedback = generateFeedback(score);
  const strengths = generateStrengths(score);
  const improvements = generateImprovements(score, category);

  const followUps: Record<string, string[]> = {
    DSA: ["Can you elaborate on the time complexity?", "What are the space considerations?"],
    SystemDesign: ["How would you scale this?", "What are potential bottlenecks?"],
    DB: ["When would you choose this over alternatives?", "How does this perform at scale?"],
    HR: ["Can you give me an example?", "What did you learn from that?"],
    Project: ["What was the biggest challenge?", "How would you improve it?"]
  };
  
  const categoryFollowUps = followUps[category] || followUps.HR;
  const followUpQuestion = categoryFollowUps[Math.floor(Math.random() * categoryFollowUps.length)];

  return {
    score,
    feedback,
    strengths,
    improvements,
    idealAnswer: idealAnswer || "Expected comprehensive answer",
    followUpQuestion
  };
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
};

export const generateFollowUpQuestion = async (
  previousQuestion: string,
  previousAnswer: string,
  category: string,
  conversationHistory: any[] = []
): Promise<string> => {
<<<<<<< HEAD
  if (!USE_AI) return "Can you explain that in more detail?";

  try {
    const prompt = `The candidate just answered: "${previousAnswer}" to the question: "${previousQuestion}".
    Generate a natural, deep-dive follow-up question in the ${category} domain. 
    Output ONLY the question text.`;
    
    return await getAICompletion(prompt);
  } catch (error) {
    return "Can you explain your thought process behind that?";
  }
=======
  const followUps: Record<string, string[]> = {
    DSA: ["Can you explain that in more detail?", "What's the time complexity of your approach?"],
    SystemDesign: ["How would you handle millions of users?", "What are the tradeoffs?"],
    DB: ["How would you optimize this?", "What if the data grows 10x?"],
    HR: ["What was the outcome?", "How did you handle that?"],
    Project: ["What would you do differently?", "What did you learn?"]
  };
  
  const options = followUps[category] || followUps.DSA;
  return options[Math.floor(Math.random() * options.length)];
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
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
    return `Good effort! You have a solid foundation. Focus on ${improvements[0] || 'practicing more'} and you'll improve quickly. Best of luck!`;
  } else {
    return `Thank you for completing the interview! Keep practicing and don't give up. Every interview is a learning opportunity. All the best!`;
  }
};

export const generateFinalReport = async (
  questions: any[],
  bodyLanguageData?: any
): Promise<string> => {
<<<<<<< HEAD
  const validScores = questions.filter(q => q.score !== undefined);
  const avgScore = validScores.length > 0 
    ? validScores.reduce((sum, q) => sum + q.score, 0) / validScores.length 
    : 0;
=======
  const avgScore = questions.reduce((sum, q) => sum + (q.score || 0), 0) / questions.length;
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
  
  let report = `# Interview Report\n\n`;
  report += `## Overall Performance\n`;
  report += `Average Score: ${avgScore.toFixed(1)}/5\n\n`;
  report += `## Question Summary\n`;
  
  questions.forEach((q, i) => {
<<<<<<< HEAD
    report += `Q${i+1}: ${q.category} (${q.difficulty}) - Score: ${q.score || 'N/A'}/5\n`;
  });
  
  report += `\n## Recommendations\n`;
  const weakCategories = Array.from(new Set(questions.filter(q => (q.score || 0) < 3).map(q => q.category)));
  report += `- Continue practicing ${weakCategories.join(', ') || 'technical skills'}\n`;
=======
    report += `Q${i+1}: ${q.category} (${q.difficulty}) - Score: ${q.score}/5\n`;
  });
  
  report += `\n## Recommendations\n`;
  report += `- Continue practicing ${questions.filter(q => q.score < 3).map(q => q.category).join(', ') || 'technical skills'}\n`;
>>>>>>> 8e4c4577256d606d315d53def20a09a124bdb3ec
  report += `- Focus on communication skills\n`;
  report += `- Practice more real interview scenarios\n`;
  
  return report;
};