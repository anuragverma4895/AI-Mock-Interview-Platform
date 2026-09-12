/**
 * Coding challenge bank used for the standalone "Coding Practice" sessions.
 * Each challenge is a self-contained problem with starter code and test cases
 * that can be evaluated locally in the browser (no AI required).
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  timeLimit: number; // seconds
  language: string;
  starterCode: string;
  testCases: TestCase[];
}

export const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'easy',
    timeLimit: 30 * 60,
    language: 'javascript',
    starterCode: `function twoSum(nums, target) {
  // Write your solution here
  // Example: nums = [2,7,11,15], target = 9
  // Return indices of two numbers that add up to target

  return [];
}`,
    testCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
      { input: '[3,3], 6', expectedOutput: '[0,1]' },
    ],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    description:
      'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order.',
    difficulty: 'easy',
    timeLimit: 30 * 60,
    language: 'javascript',
    starterCode: `function isValid(s) {
  // Return true if the string of brackets is valid, otherwise false

  return false;
}`,
    testCases: [
      { input: '"()"', expectedOutput: 'true' },
      { input: '"()[]{}"', expectedOutput: 'true' },
      { input: '"(]"', expectedOutput: 'false' },
      { input: '"([)]"', expectedOutput: 'false' },
      { input: '"{[]}"', expectedOutput: 'true' },
    ],
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    description:
      'Write a function that reverses a string. The input string is given as an array of characters char[]. Do not allocate extra space for another array, you must do this by modifying the input array in-place.',
    difficulty: 'easy',
    timeLimit: 20 * 60,
    language: 'javascript',
    starterCode: `function reverseString(s) {
  // Reverse the array of characters in-place and return it

  return s;
}`,
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' },
    ],
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    description:
      'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    difficulty: 'medium',
    timeLimit: 40 * 60,
    language: 'javascript',
    starterCode: `function maxSubArray(nums) {
  // Find the contiguous subarray with the largest sum and return the sum

  return 0;
}`,
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' },
      { input: '[5,4,-1,7,8]', expectedOutput: '23' },
      { input: '[-1,-2,-3,-4]', expectedOutput: '-1' },
    ],
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    description:
      'Given an array of intervals intervals where intervals[i] = [starti, endi], merge all overlapping intervals and return non-overlapping intervals that cover all the intervals in the input.',
    difficulty: 'medium',
    timeLimit: 40 * 60,
    language: 'javascript',
    starterCode: `function merge(intervals) {
  // Merge all overlapping intervals and return the result

  return [];
}`,
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]' },
      { input: '[[1,4],[0,4]]', expectedOutput: '[[0,4]]' },
      { input: '[[1,4]]', expectedOutput: '[[1,4]]' },
    ],
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    description:
      'Design and implement a data structure for Least Recently Used (LRU) cache. It should support get and put operations in O(1) average time. get(key) - Return the value of the key if the key exists, otherwise -1. put(key, value) - Insert or update the value of the key. When the cache reaches its capacity, it should invalidate the least recently used item before inserting a new item.',
    difficulty: 'hard',
    timeLimit: 60 * 60,
    language: 'javascript',
    starterCode: `/**
 * @param {number} capacity
 */
var LRUCache = function(capacity) {
  // Initialize the cache with the given capacity
};

/**
 * @param {number} key
 * @return {number}
 */
LRUCache.prototype.get = function(key) {
  // Return the value, or -1 if not present
};

/**
 * @param {number} key
 * @param {number} value
 * @return {void}
 */
LRUCache.prototype.put = function(key, value) {
  // Insert or update the value
};

// Usage example:
// var obj = new LRUCache(2);
// obj.put(1, 1);
// obj.put(2, 2);
// var param_1 = obj.get(1);
`,
    testCases: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]', expectedOutput: '[null,null,null,1,null,-1,null,-1,3,3]' },
    ],
  },
];

export function getChallenge(id: string): CodingChallenge | undefined {
  return CODING_CHALLENGES.find((c) => c.id === id);
}

export function listChallenges(): CodingChallenge[] {
  return CODING_CHALLENGES;
}