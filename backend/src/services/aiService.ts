import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  dangerouslyAllowBrowser: true
});

const USE_LOCAL_MODE = !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-default-key-for-testing' || process.env.OPENAI_API_KEY === 'dummy-key';

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

export const generateInterviewQuestion = async (
  category: string,
  difficulty: string,
  conversationHistory: any[] = [],
  resumeSkills?: string[],
  projectNames?: string[]
): Promise<GeneratedQuestion> => {
  if (USE_LOCAL_MODE || !process.env.OPENAI_API_KEY) {
    const q = getRandomQuestion(category);
    return {
      question: q.question,
      category,
      difficulty: q.difficulty,
      idealAnswer: "A comprehensive answer covering key concepts and practical examples."
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are Alex, a friendly technical interviewer.' },
        { role: 'user', content: `Generate a ${difficulty} ${category} interview question.` }
      ],
      temperature: 0.7,
    });
    const response = completion.choices[0]?.message?.content;
    return {
      question: response || getRandomQuestion(category).question,
      category,
      difficulty,
      idealAnswer: "Expected answer with practical examples"
    };
  } catch (error) {
    console.error('API Error, using local mode:', error);
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
};

export const generateFollowUpQuestion = async (
  previousQuestion: string,
  previousAnswer: string,
  category: string,
  conversationHistory: any[] = []
): Promise<string> => {
  const followUps: Record<string, string[]> = {
    DSA: ["Can you explain that in more detail?", "What's the time complexity of your approach?"],
    SystemDesign: ["How would you handle millions of users?", "What are the tradeoffs?"],
    DB: ["How would you optimize this?", "What if the data grows 10x?"],
    HR: ["What was the outcome?", "How did you handle that?"],
    Project: ["What would you do differently?", "What did you learn?"]
  };
  
  const options = followUps[category] || followUps.DSA;
  return options[Math.floor(Math.random() * options.length)];
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
  const avgScore = questions.reduce((sum, q) => sum + (q.score || 0), 0) / questions.length;
  
  let report = `# Interview Report\n\n`;
  report += `## Overall Performance\n`;
  report += `Average Score: ${avgScore.toFixed(1)}/5\n\n`;
  report += `## Question Summary\n`;
  
  questions.forEach((q, i) => {
    report += `Q${i+1}: ${q.category} (${q.difficulty}) - Score: ${q.score}/5\n`;
  });
  
  report += `\n## Recommendations\n`;
  report += `- Continue practicing ${questions.filter(q => q.score < 3).map(q => q.category).join(', ') || 'technical skills'}\n`;
  report += `- Focus on communication skills\n`;
  report += `- Practice more real interview scenarios\n`;
  
  return report;
};