"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFinalReport = exports.generateVideo = exports.generateImage = exports.getClosingMessage = exports.getGreeting = exports.generateFollowUpQuestion = exports.evaluateAnswer = exports.generateInterviewQuestion = void 0;
const openai_1 = __importDefault(require("openai"));
// Initialize AI clients with multiple keys for load distribution
const openaiApiKeys = process.env.OPENAI_API_KEYS ? process.env.OPENAI_API_KEYS.split(',') : [];
const geminiApiKeys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [];
const openaiClients = openaiApiKeys.map(key => new openai_1.default({
    apiKey: key.trim(),
    dangerouslyAllowBrowser: true
}));
const USE_AI = !!(geminiApiKeys.length > 0 || openaiClients.length > 0);
// Rotation counters
let openaiIndex = 0;
let geminiIndex = 0;
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
const getRandomQuestion = (category) => {
    const questions = QUESTION_BANK[category] || QUESTION_BANK.DSA;
    return questions[Math.floor(Math.random() * questions.length)];
};
/**
 * Generic AI completion helper using native fetch for Gemini and OpenAI with load distribution
 */
async function getAICompletion(prompt, systemPrompt = "You are Alex, a friendly technical interviewer.") {
    // Try Gemini First using rotation
    if (geminiApiKeys.length > 0) {
        const currentGeminiKey = geminiApiKeys[geminiIndex % geminiApiKeys.length];
        geminiIndex = (geminiIndex + 1) % geminiApiKeys.length;
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${currentGeminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }]
                })
            });
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
        catch (error) {
            console.error('Gemini API Error:', error);
        }
    }
    // Try OpenAI Second using rotation
    if (openaiClients.length > 0) {
        const currentOpenAIClient = openaiClients[openaiIndex % openaiClients.length];
        openaiIndex = (openaiIndex + 1) % openaiClients.length;
        try {
            const completion = await currentOpenAIClient.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
            });
            return completion.choices[0]?.message?.content || '';
        }
        catch (error) {
            console.error('OpenAI API Error:', error);
        }
    }
    throw new Error('No AI service available');
}
const generateInterviewQuestion = async (category, difficulty, conversationHistory = [], resumeSkills, projectNames) => {
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
        const prompt = `Generate a ${difficulty} level interview question for the category: ${category}. 
    ${resumeSkills ? `Base it on these skills: ${resumeSkills.join(', ')}.` : ''}
    ${projectNames ? `Base it on these projects: ${projectNames.join(', ')}.` : ''}
    Response format: Only return the question text.`;
        const response = await getAICompletion(prompt);
        return {
            question: response || getRandomQuestion(category).question,
            category,
            difficulty,
            idealAnswer: "Expected answer with practical examples"
        };
    }
    catch (error) {
        const q = getRandomQuestion(category);
        return {
            question: q.question,
            category,
            difficulty: q.difficulty,
            idealAnswer: "Expected answer with practical examples"
        };
    }
};
exports.generateInterviewQuestion = generateInterviewQuestion;
const evaluateAnswer = async (question, answer, category, difficulty, conversationHistory = [], idealAnswer) => {
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
    }
    catch (error) {
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
};
exports.evaluateAnswer = evaluateAnswer;
const generateFollowUpQuestion = async (previousQuestion, previousAnswer, category, conversationHistory = []) => {
    if (!USE_AI)
        return "Can you explain that in more detail?";
    try {
        const prompt = `The candidate just answered: "${previousAnswer}" to the question: "${previousQuestion}".
    Generate a natural, deep-dive follow-up question in the ${category} domain. 
    Output ONLY the question text.`;
        return await getAICompletion(prompt);
    }
    catch (error) {
        return "Can you explain your thought process behind that?";
    }
};
exports.generateFollowUpQuestion = generateFollowUpQuestion;
const getGreeting = async (candidateName) => {
    const greetings = [
        `Hi there! Welcome to your mock interview. I'm Alex, and I'll be your interviewer today. Let's get started!`,
        `Hello! Great to have you here. I'm Alex, your AI interviewer. We'll have a friendly conversation about your skills. Ready?`,
        `Hey! Welcome to AI Mock Interview Platform. I'm Alex and I'll be conducting your interview today. Let's begin!`,
        `Hi! I'm Alex, your virtual interviewer. We'll talk about your technical skills and experience. Are you ready?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
};
exports.getGreeting = getGreeting;
const getClosingMessage = async (finalScore, strongAreas, improvements) => {
    if (finalScore >= 4) {
        return `Great job! You showed excellent skills in ${strongAreas[0] || 'technical knowledge'}. Keep it up and you'll do amazing in real interviews!`;
    }
    else if (finalScore >= 3) {
        return `Good effort! You have a solid foundation. Focus on ${improvements[0] || 'practicing more'} and you'll improve quickly. Best of luck!`;
    }
    else {
        return `Thank you for completing the interview! Keep practicing and don't give up. Every interview is a learning opportunity. All the best!`;
    }
};
exports.getClosingMessage = getClosingMessage;
const generateImage = async (prompt) => {
    if (openaiClients.length === 0) {
        throw new Error('No OpenAI API keys available for image generation');
    }
    const currentOpenAIClient = openaiClients[openaiIndex % openaiClients.length];
    openaiIndex = (openaiIndex + 1) % openaiClients.length;
    try {
        const response = await currentOpenAIClient.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            size: '1024x1024',
            quality: 'standard',
            n: 1,
        });
        return response.data?.[0]?.url || '';
    }
    catch (error) {
        console.error('Image Generation Error:', error);
        throw new Error('Failed to generate image');
    }
};
exports.generateImage = generateImage;
const generateVideo = async (prompt) => {
    // Note: Video generation is not directly supported by current APIs
    // This is a placeholder for future implementation
    // You might need to integrate with services like Runway ML, Pika, or others
    throw new Error('Video generation not implemented yet. Consider using external video generation services.');
};
exports.generateVideo = generateVideo;
const generateFinalReport = async (questions, bodyLanguageData) => {
    const validScores = questions.filter(q => q.score !== undefined);
    const avgScore = validScores.length > 0
        ? validScores.reduce((sum, q) => sum + q.score, 0) / validScores.length
        : 0;
    let report = `# Interview Report\n\n`;
    report += `## Overall Performance\n`;
    report += `Average Score: ${avgScore.toFixed(1)}/5\n\n`;
    report += `## Question Summary\n`;
    questions.forEach((q, i) => {
        report += `Q${i + 1}: ${q.category} (${q.difficulty}) - Score: ${q.score || 'N/A'}/5\n`;
    });
    report += `\n## Recommendations\n`;
    const weakCategories = Array.from(new Set(questions.filter(q => (q.score || 0) < 3).map(q => q.category)));
    report += `- Continue practicing ${weakCategories.join(', ') || 'technical skills'}\n`;
    report += `- Focus on communication skills\n`;
    report += `- Practice more real interview scenarios\n`;
    return report;
};
exports.generateFinalReport = generateFinalReport;
//# sourceMappingURL=aiService.js.map