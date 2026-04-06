import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-default-key',
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
  followUp?: string;
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  idealAnswer: string;
  followUpQuestion?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const INTERVIEW_SYSTEM_PROMPT = `You are a professional technical interviewer named "Alex". You conduct friendly, conversational interviews. 

Key guidelines:
- Speak naturally like a human interviewer
- Ask one question at a time
- Listen to the candidate's response and respond naturally
- Don't just read questions - have a conversation
- Use the candidate's name occasionally (if known)
- Be encouraging but professional
- Ask follow-up questions based on their answers
- Keep responses conversational, not formal

Categories you can ask about: DSA, System Design, Database, HR, Project-based questions.
Difficulty levels: easy, medium, hard.

Remember: You're a human interviewer conducting a real conversation, not a quiz.`;

export const generateInterviewQuestion = async (
  category: string,
  difficulty: string,
  conversationHistory: ConversationMessage[],
  resumeSkills?: string[],
  projectNames?: string[]
): Promise<GeneratedQuestion> => {
  const skillContext = resumeSkills?.length ? `Candidate's skills: ${resumeSkills.join(', ')}.` : '';
  const projectContext = projectNames?.length ? `Candidate's projects: ${projectNames.join(', ')}.` : '';
  
  const historyText = conversationHistory
    .slice(-6)
    .map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`)
    .join('\n');

  const prompt = `${INTERVIEW_SYSTEM_PROMPT}

${skillContext}
${projectContext}

Conversation so far:
${historyText}

Generate your next interview question as a natural conversational question. The question should be ${difficulty} level and about ${category}.

Return ONLY a JSON object:
{
  "question": "your conversational question here",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "idealAnswer": "brief ideal answer outline"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: INTERVIEW_SYSTEM_PROMPT },
        ...conversationHistory.slice(-8).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('Empty response');

    return JSON.parse(response) as GeneratedQuestion;
  } catch (error) {
    console.error('Error generating question:', error);
    return {
      question: `Let me ask you about ${category}. Can you explain ${category === 'DSA' ? 'a data structure you frequently use?' : category === 'SystemDesign' ? 'how you would design a scalable system?' : 'your experience with this?'}`,
      category,
      difficulty,
      idealAnswer: 'Expected a detailed response'
    };
  }
};

export const generateFollowUpQuestion = async (
  previousQuestion: string,
  previousAnswer: string,
  category: string,
  conversationHistory: ConversationMessage[]
): Promise<string> => {
  const prompt = `As a natural interviewer, ask a follow-up question based on this exchange:

Interviewer: ${previousQuestion}
Candidate: ${previousAnswer}

Ask a natural follow-up that probes deeper. Keep it conversational.
Return ONLY the follow-up question as a string.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: INTERVIEW_SYSTEM_PROMPT },
        ...conversationHistory.slice(-6).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Could you tell me more about that?';
  } catch (error) {
    return 'Could you elaborate on that point?';
  }
};

export const evaluateAnswer = async (
  question: string,
  answer: string,
  category: string,
  difficulty: string,
  conversationHistory: ConversationMessage[],
  idealAnswer?: string
): Promise<AnswerEvaluation> => {
  const prompt = `Evaluate this interview answer as a professional interviewer:

Question: ${question}
Candidate's Answer: ${answer}
${idealAnswer ? `Reference: ${idealAnswer}` : ''}

Evaluate on a scale of 0-5 for:
1. Understanding
2. Technical depth
3. Communication clarity
4. Problem-solving approach

Also provide brief conversational feedback and a potential follow-up question.

Return ONLY JSON:
{
  "score": number,
  "feedback": "conversational feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1"],
  "idealAnswer": "brief ideal answer",
  "followUpQuestion": "natural follow-up"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You evaluate interview answers professionally and give conversational feedback.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) throw new Error('Empty response');

    return JSON.parse(response) as AnswerEvaluation;
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return {
      score: 3,
      feedback: 'Good attempt. Let me follow up on that.',
      strengths: ['Attempted the question'],
      improvements: ['Provide more details'],
      idealAnswer: 'Detailed explanation expected',
      followUpQuestion: 'Can you explain further?'
    };
  }
};

export const generateFinalReport = async (
  questions: Array<{ question: string; answer: string; score: number; feedback: string }>,
  bodyLanguageData?: { confidenceScore: number; suggestions: string[] },
  conversationHistory?: ConversationMessage[]
): Promise<string> => {
  const summary = questions.map((q, i) => 
    `Q${i + 1}: ${q.question.substring(0, 100)}...\nScore: ${q.score}/5\nFeedback: ${q.feedback}`
  ).join('\n\n');

  const prompt = `Generate a comprehensive interview report:

${summary}

${bodyLanguageData ? `Body Language: Confidence ${bodyLanguageData.confidenceScore}%` : ''}

Provide:
1. Overall performance summary
2. Key strengths
3. Areas to improve
4. Recommendations
5. Final verdict

Write in a professional but conversational tone.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You generate professional interview reports.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content || 'Report generation failed';
  } catch (error) {
    return 'Failed to generate final report';
  }
};

export const getGreeting = async (candidateName?: string): Promise<string> => {
  const namePart = candidateName ? `, ${candidateName}` : '';
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a friendly professional interviewer. Greet the candidate warmly.' },
        { role: 'user', content: `Generate a welcoming greeting for the interview${namePart}. Keep it natural and conversational, not too long.` },
      ],
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || `Hi there! Welcome to your mock interview. I'm Alex, and I'll be your interviewer today. Let's get started!`;
  } catch (error) {
    return `Hi there! Welcome to your mock interview. I'm Alex, and I'll be your interviewer today. Let's get started!`;
  }
};

export const getClosingMessage = async (
  finalScore: number,
  strongAreas: string[],
  improvements: string[]
): Promise<string> => {
  const prompt = `Generate a natural closing message for the interview.
Score: ${finalScore}/5
Strong areas: ${strongAreas.join(', ')}
Areas to improve: ${improvements.join(', ')}

Keep it conversational, encouraging, and professional.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You give friendly, encouraging interview feedback.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content || `Thank you for completing the interview! Based on your performance, you've shown good skills in ${strongAreas[0] || 'technical knowledge'}. Keep working on ${improvements[0] || 'improving your answers'} and you'll do great. All the best!`;
  } catch (error) {
    return `Thank you for completing the interview! Great effort today. Keep practicing and you'll improve even more. All the best!`;
  }
};