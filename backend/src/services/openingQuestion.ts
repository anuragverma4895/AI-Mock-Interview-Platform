/**
 * Fast, deterministic opening question. This path makes no external AI calls,
 * so a slow Gemini request cannot delay creation of an interview session.
 * Following questions and answer evaluation still use the normal AI service.
 */
export interface OpeningQuestion {
  question: string;
  category: string;
  difficulty: string;
  idealAnswer: string;
}

export function createOpeningQuestion(
  category: string,
  difficulty: string,
  resumeSkills: readonly string[] = [],
  projects: readonly { name: string; description?: string }[] = [],
  jobRole?: string,
): OpeningQuestion {
  const firstProject = projects.find(p => typeof p.name === 'string' && p.name.trim());
  const projectName = firstProject?.name.trim().slice(0, 90);
  const skillSet = new Set(resumeSkills.map(skill => skill.toLowerCase().trim()));
  const language = ['C++', 'Python', 'Java', 'JavaScript', 'TypeScript']
    .find(candidate => skillSet.has(candidate.toLowerCase()));

  if (category === 'HR') {
    return {
      question: projectName
        ? `Tell me about a challenging situation you faced while building ${projectName}, and how you handled it.`
        : 'Tell me about a challenging situation you faced in a technical project, and how you handled it.',
      category,
      difficulty,
      idealAnswer: 'Describe the situation, your responsibility, the specific actions you took, and the outcome. Explain what you learned.',
    };
  }

  if (category === 'Project') {
    return {
      question: projectName
        ? `Can you explain how you designed ${projectName} and what your contribution was?`
        : 'Can you explain the architecture of a project you built and your contribution?',
      category,
      difficulty,
      idealAnswer: 'Explain the problem, overall architecture, key technologies, your implementation choices, and a challenge you solved.',
    };
  }

  // Technical and combined interviews start with a DSA question at the selected difficulty.
  const context = language ? ` in ${language}` : '';
  const challenges: Record<string, { question: string; idealAnswer: string }> = {
    easy: {
      question: `How would you check whether an array contains duplicate elements${context}, and what is the time complexity?`,
      idealAnswer: 'Use a hash set of seen values. If an element is already present, return true; otherwise add it. O(n) time and O(n) extra space.',
    },
    medium: {
      question: `How would you solve the Two Sum problem efficiently${context}, and what is its time complexity?`,
      idealAnswer: 'Use a hash map to store each value and its index. For each number, check whether target minus the number is already in the map. O(n) time and O(n) extra space.',
    },
    hard: {
      question: `How would you find the median of two sorted arrays in logarithmic time${context}?`,
      idealAnswer: 'Use binary search on the shorter array to find a partition where all left-side elements are smaller than the right-side elements. Then calculate the median from the partition boundaries. O(log(min(m,n))) time.',
    },
  };
  const chosen = challenges[difficulty] || challenges.medium;
  return {
    question: chosen.question,
    category: 'DSA',
    difficulty,
    idealAnswer: chosen.idealAnswer,
  };
}
