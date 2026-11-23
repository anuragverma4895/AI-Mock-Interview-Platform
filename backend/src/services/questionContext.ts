/** Keep prompts bounded while retaining the complete interview history for deduplication. */
export interface InterviewHistoryItem {
  role?: string;
  question?: string;
  content?: string;
}

const RECENT_QUESTIONS_LIMIT = 4;
const EARLIER_TOPICS_LIMIT = 14;
const STOP_WORDS = new Set([
  'about', 'after', 'also', 'and', 'are', 'between', 'can', 'could', 'describe', 'different',
  'difference', 'discuss', 'does', 'explain', 'for', 'from', 'give', 'how', 'into',
  'interview', 'is', 'its', 'me', 'of', 'or', 'please', 'tell', 'that', 'the',
  'their', 'them', 'there', 'these', 'this', 'using', 'versus', 'what', 'when',
  'where', 'which', 'why', 'with', 'would', 'you', 'your', 'compare',
]);

export const normalizeQuestion = (question: string): string =>
  question.toLowerCase()
    .replace(/\bnon[\s-]?relational\b/g, 'nosql')
    .replace(/\brelational\b/g, 'sql')
    .replace(/\bhash[\s-]?table\b/g, 'hash map')
    .replace(/\bstructured query language\b/g, 'sql')
    .replace(/[^a-z0-9+#]+/g, ' ')
    .replace(/\s+/g, ' ').trim();

/** Prefer the actual question field; never treat a user's answer as a prior question. */
export const extractPreviousQuestions = (history: readonly InterviewHistoryItem[] = []): string[] =>
  history.map(entry => {
    if (typeof entry.question === 'string' && entry.question.trim()) return entry.question.trim();
    if (entry.role === 'assistant' && typeof entry.content === 'string') return entry.content.trim();
    return '';
  }).filter(Boolean);

export const areQuestionsSimilar = (left: string, right: string): boolean => {
  const a = normalizeQuestion(left);
  const b = normalizeQuestion(right);
  if (!a || !b) return false;
  if (a === b) return true;

  const relevantTerms = (question: string): Set<string> => new Set(
    question.split(' ').filter(term => term.length > 2 && !STOP_WORDS.has(term))
  );
  const aTerms = relevantTerms(a);
  const bTerms = relevantTerms(b);
  if (aTerms.size < 2 || bTerms.size < 2) return false;
  const overlap = [...aTerms].filter(term => bTerms.has(term)).length;
  return overlap / Math.max(aTerms.size, bTerms.size) >= 0.8;
};

/** Try unused questions of requested difficulty, then unused questions of other difficulties. */
export const selectUnusedQuestion = <T extends { question: string; difficulty: string }>(
  bank: readonly T[],
  difficulty: string,
  previousQuestions: readonly string[],
): T | undefined => {
  const ordered = [
    ...bank.filter(q => q.difficulty === difficulty),
    ...bank.filter(q => q.difficulty !== difficulty),
  ];
  return ordered.find(candidate =>
    !previousQuestions.some(previous => areQuestionsSimilar(previous, candidate.question))
  );
};

/**
 * Full history remains in MongoDB and is checked for duplicates locally.
 * Only recent questions and a small deterministic topic summary are sent to the model.
 */
export const buildBoundedQuestionContext = (history: readonly InterviewHistoryItem[] = []) => {
  const previousQuestions = extractPreviousQuestions(history);
  const recentQuestions = previousQuestions.slice(-RECENT_QUESTIONS_LIMIT);
  const olderQuestions = previousQuestions.slice(0, -RECENT_QUESTIONS_LIMIT);
  const topicCounts = new Map<string, number>();

  for (const question of olderQuestions) {
    const terms = new Set(
      normalizeQuestion(question).split(' ').filter(term => term.length > 2 && !STOP_WORDS.has(term))
    );
    for (const term of terms) topicCounts.set(term, (topicCounts.get(term) || 0) + 1);
  }

  const earlierTopics = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, EARLIER_TOPICS_LIMIT)
    .map(([term]) => term);

  return { previousQuestions, recentQuestions, earlierTopics };
};
