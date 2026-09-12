/**
 * Coding challenge bank — 50 LeetCode-style problems with multi-language support.
 * Each challenge includes starter code in JavaScript, Python, Java, C, and C++.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Language = 'javascript' | 'python' | 'java' | 'c' | 'cpp';

export const SUPPORTED_LANGUAGES: Language[] = ['javascript', 'python', 'java', 'c', 'cpp'];

export const LANGUAGE_LABELS: Record<Language, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
};

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  timeLimit: number; // seconds
  language: string; // default language
  starterCode: string; // default (JS) starter code
  starterCodes: Record<Language, string>;
  testCases: TestCase[];
}

// ─── Helper to build a challenge with all 5 language starters ───────────────

function challenge(
  id: string,
  title: string,
  description: string,
  difficulty: Difficulty,
  category: string,
  timeLimitMinutes: number,
  starters: Record<Language, string>,
  testCases: TestCase[]
): CodingChallenge {
  return {
    id,
    title,
    description,
    difficulty,
    category,
    timeLimit: timeLimitMinutes * 60,
    language: 'javascript',
    starterCode: starters.javascript,
    starterCodes: starters,
    testCases,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// 50 CODING CHALLENGES
// ═════════════════════════════════════════════════════════════════════════════

export const CODING_CHALLENGES: CodingChallenge[] = [
  // ─── EASY (1–17) ──────────────────────────────────────────────────────────

  challenge('two-sum', 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.', 'easy', 'Arrays', 30,
    {
      javascript: `function twoSum(nums, target) {\n  // Return an array of two indices\n  return [];\n}`,
      python: `def twoSum(nums, target):\n    # Return a list of two indices\n    return []`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Return an array of two indices\n        return new int[]{};\n    }\n}`,
      c: `#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Return an array of two indices, set *returnSize\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Return a vector of two indices\n        return {};\n    }\n};`,
    },
    [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
      { input: '[3,3], 6', expectedOutput: '[0,1]' },
    ]
  ),

  challenge('valid-parentheses', 'Valid Parentheses', 'Given a string s containing just the characters (, ), {, }, [ and ], determine if the input string is valid. An input string is valid if: open brackets must be closed by the same type, and open brackets must be closed in the correct order.', 'easy', 'Stack', 25,
    {
      javascript: `function isValid(s) {\n  // Return true if the string of brackets is valid\n  return false;\n}`,
      python: `def isValid(s):\n    # Return True if the string of brackets is valid\n    return False`,
      java: `class Solution {\n    public boolean isValid(String s) {\n        // Return true if valid\n        return false;\n    }\n}`,
      c: `#include <stdbool.h>\n#include <string.h>\n\nbool isValid(char* s) {\n    // Return true if valid\n    return false;\n}`,
      cpp: `#include <string>\n#include <stack>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Return true if valid\n        return false;\n    }\n};`,
    },
    [
      { input: '"()"', expectedOutput: 'true' },
      { input: '"()[]{}"', expectedOutput: 'true' },
      { input: '"(]"', expectedOutput: 'false' },
      { input: '"([)]"', expectedOutput: 'false' },
      { input: '"{[]}"', expectedOutput: 'true' },
    ]
  ),

  challenge('reverse-string', 'Reverse String', 'Write a function that reverses a string. The input string is given as an array of characters. Do not allocate extra space for another array; you must do this by modifying the input array in-place.', 'easy', 'Strings', 20,
    {
      javascript: `function reverseString(s) {\n  // Reverse the array in-place and return it\n  return s;\n}`,
      python: `def reverseString(s):\n    # Reverse the list in-place and return it\n    return s`,
      java: `class Solution {\n    public char[] reverseString(char[] s) {\n        // Reverse in-place and return\n        return s;\n    }\n}`,
      c: `void reverseString(char* s, int sSize) {\n    // Reverse the array in-place\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Reverse in-place\n    }\n};`,
    },
    [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' },
    ]
  ),

  challenge('palindrome-number', 'Palindrome Number', 'Given an integer x, return true if x is a palindrome, and false otherwise. An integer is a palindrome when it reads the same forward and backward.', 'easy', 'Math', 20,
    {
      javascript: `function isPalindrome(x) {\n  // Return true if x is a palindrome\n  return false;\n}`,
      python: `def isPalindrome(x):\n    # Return True if x is a palindrome\n    return False`,
      java: `class Solution {\n    public boolean isPalindrome(int x) {\n        // Return true if x is a palindrome\n        return false;\n    }\n}`,
      c: `#include <stdbool.h>\n\nbool isPalindrome(int x) {\n    // Return true if x is a palindrome\n    return false;\n}`,
      cpp: `class Solution {\npublic:\n    bool isPalindrome(int x) {\n        // Return true if x is a palindrome\n        return false;\n    }\n};`,
    },
    [
      { input: '121', expectedOutput: 'true' },
      { input: '-121', expectedOutput: 'false' },
      { input: '10', expectedOutput: 'false' },
    ]
  ),

  challenge('merge-two-sorted-lists', 'Merge Two Sorted Lists', 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list by splicing together the nodes. Return the head of the merged linked list.', 'easy', 'Linked List', 30,
    {
      javascript: `/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} list1\n * @param {ListNode} list2\n * @return {ListNode}\n */\nvar mergeTwoLists = function(list1, list2) {\n    \n};`,
      python: `# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        pass`,
      java: `/**\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode() {}\n *     ListNode(int val) { this.val = val; }\n *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n * }\n */\nclass Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        \n    }\n}`,
      c: `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     struct ListNode *next;\n * };\n */\nstruct ListNode* mergeTwoLists(struct ListNode* list1, struct ListNode* list2) {\n    \n}`,
      cpp: `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n *     ListNode(int x, ListNode *next) : val(x), next(next) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        \n    }\n};`,
    },
    [
      { input: '[1,2,4], [1,3,4]', expectedOutput: '[1,1,2,3,4,4]' },
      { input: '[], []', expectedOutput: '[]' },
      { input: '[], [0]', expectedOutput: '[0]' },
    ]
  ),

  challenge('best-time-to-buy-sell-stock', 'Best Time to Buy and Sell Stock', 'You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy and a single day to sell. Return the maximum profit you can achieve. If no profit is possible, return 0.', 'easy', 'Arrays', 25,
    {
      javascript: `function maxProfit(prices) {\n  // Return maximum profit\n  return 0;\n}`,
      python: `def maxProfit(prices):\n    # Return maximum profit\n    return 0`,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        // Return maximum profit\n        return 0;\n    }\n}`,
      c: `int maxProfit(int* prices, int pricesSize) {\n    // Return maximum profit\n    return 0;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '[7,1,5,3,6,4]', expectedOutput: '5' },
      { input: '[7,6,4,3,1]', expectedOutput: '0' },
    ]
  ),

  challenge('valid-anagram', 'Valid Anagram', 'Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram uses all original letters exactly once.', 'easy', 'Hash Map', 20,
    {
      javascript: `function isAnagram(s, t) {\n  // Return true if t is an anagram of s\n  return false;\n}`,
      python: `def isAnagram(s, t):\n    # Return True if t is an anagram of s\n    return False`,
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        return false;\n    }\n}`,
      c: `#include <stdbool.h>\n#include <string.h>\n\nbool isAnagram(char* s, char* t) {\n    return false;\n}`,
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        return false;\n    }\n};`,
    },
    [
      { input: '"anagram", "nagaram"', expectedOutput: 'true' },
      { input: '"rat", "car"', expectedOutput: 'false' },
    ]
  ),

  challenge('contains-duplicate', 'Contains Duplicate', 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.', 'easy', 'Arrays', 20,
    {
      javascript: `function containsDuplicate(nums) {\n  // Return true if any duplicates exist\n  return false;\n}`,
      python: `def containsDuplicate(nums):\n    # Return True if any duplicates exist\n    return False`,
      java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}`,
      c: `#include <stdbool.h>\n\nbool containsDuplicate(int* nums, int numsSize) {\n    return false;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        return false;\n    }\n};`,
    },
    [
      { input: '[1,2,3,1]', expectedOutput: 'true' },
      { input: '[1,2,3,4]', expectedOutput: 'false' },
      { input: '[1,1,1,3,3,4,3,2,4,2]', expectedOutput: 'true' },
    ]
  ),

  challenge('max-depth-binary-tree', 'Maximum Depth of Binary Tree', 'Given the root of a binary tree, return its maximum depth. A binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.', 'easy', 'Trees', 25,
    {
      javascript: `/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\n/**\n * @param {TreeNode} root\n * @return {number}\n */\nvar maxDepth = function(root) {\n    \n};`,
      python: `# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\nclass Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        pass`,
      java: `/**\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode() {}\n *     TreeNode(int val) { this.val = val; }\n *     TreeNode(int val, TreeNode left, TreeNode right) {\n *         this.val = val;\n *         this.left = left;\n *         this.right = right;\n *     }\n * }\n */\nclass Solution {\n    public int maxDepth(TreeNode root) {\n        \n    }\n}`,
      c: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     struct TreeNode *left;\n *     struct TreeNode *right;\n * };\n */\nint maxDepth(struct TreeNode* root) {\n    \n}`,
      cpp: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     TreeNode *left;\n *     TreeNode *right;\n *     TreeNode() : val(0), left(nullptr), right(nullptr) {}\n *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n * };\n */\nclass Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        \n    }\n};`,
    },
    [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '3' },
      { input: '[1,null,2]', expectedOutput: '2' },
    ]
  ),

  challenge('climbing-stairs', 'Climbing Stairs', 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?', 'easy', 'Dynamic Programming', 25,
    {
      javascript: `function climbStairs(n) {\n  // Return the number of distinct ways to climb n stairs\n  return 0;\n}`,
      python: `def climbStairs(n):\n    # Return the number of distinct ways to climb n stairs\n    return 0`,
      java: `class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}`,
      c: `int climbStairs(int n) {\n    return 0;\n}`,
      cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '2', expectedOutput: '2' },
      { input: '3', expectedOutput: '3' },
      { input: '5', expectedOutput: '8' },
    ]
  ),

  challenge('roman-to-integer', 'Roman to Integer', 'Given a roman numeral string, convert it to an integer. Roman numerals: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Subtraction: IV=4, IX=9, XL=40, XC=90, CD=400, CM=900.', 'easy', 'Strings', 25,
    {
      javascript: `function romanToInt(s) {\n  // Convert roman numeral string to integer\n  return 0;\n}`,
      python: `def romanToInt(s):\n    # Convert roman numeral string to integer\n    return 0`,
      java: `class Solution {\n    public int romanToInt(String s) {\n        return 0;\n    }\n}`,
      c: `int romanToInt(char* s) {\n    return 0;\n}`,
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int romanToInt(string s) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '"III"', expectedOutput: '3' },
      { input: '"LVIII"', expectedOutput: '58' },
      { input: '"MCMXCIV"', expectedOutput: '1994' },
    ]
  ),

  challenge('linked-list-cycle', 'Linked List Cycle', 'Given head, the head of a linked list, determine if the linked list has a cycle in it. There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the next pointer. Return true if there is a cycle in the linked list. Otherwise, return false.', 'easy', 'Linked List', 25,
    {
      javascript: `/**\n * Definition for singly-linked list.\n * function ListNode(val) {\n *     this.val = val;\n *     this.next = null;\n * }\n */\n/**\n * @param {ListNode} head\n * @return {boolean}\n */\nvar hasCycle = function(head) {\n    \n};`,
      python: `# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, x):\n#         self.val = x\n#         self.next = None\n\nclass Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        pass`,
      java: `/**\n * Definition for singly-linked list.\n * class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode(int x) {\n *         val = x;\n *         next = null;\n *     }\n * }\n */\npublic class Solution {\n    public boolean hasCycle(ListNode head) {\n        \n    }\n}`,
      c: `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     struct ListNode *next;\n * };\n */\nbool hasCycle(struct ListNode *head) {\n    \n}`,
      cpp: `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode(int x) : val(x), next(NULL) {}\n * };\n */\nclass Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        \n    }\n};`,
    },
    [
      { input: '[3,2,0,-4], 1', expectedOutput: 'true' },
      { input: '[1,2], 0', expectedOutput: 'true' },
      { input: '[1], -1', expectedOutput: 'false' },
    ]
  ),

  challenge('single-number', 'Single Number', 'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one. You must implement a solution with linear runtime complexity and use only constant extra space.', 'easy', 'Bit Manipulation', 20,
    {
      javascript: `function singleNumber(nums) {\n  // Return the number that appears only once\n  return 0;\n}`,
      python: `def singleNumber(nums):\n    # Return the number that appears only once\n    return 0`,
      java: `class Solution {\n    public int singleNumber(int[] nums) {\n        return 0;\n    }\n}`,
      c: `int singleNumber(int* nums, int numsSize) {\n    return 0;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '[2,2,1]', expectedOutput: '1' },
      { input: '[4,1,2,1,2]', expectedOutput: '4' },
      { input: '[1]', expectedOutput: '1' },
    ]
  ),

  challenge('move-zeroes', 'Move Zeroes', 'Given an integer array nums, move all 0s to the end of it while maintaining the relative order of the non-zero elements. You must do this in-place without making a copy of the array.', 'easy', 'Arrays', 20,
    {
      javascript: `function moveZeroes(nums) {\n  // Move all zeroes to end in-place, return the array\n  return nums;\n}`,
      python: `def moveZeroes(nums):\n    # Move all zeroes to end in-place, return the list\n    return nums`,
      java: `class Solution {\n    public int[] moveZeroes(int[] nums) {\n        // Move in-place and return\n        return nums;\n    }\n}`,
      c: `void moveZeroes(int* nums, int numsSize) {\n    // Move in-place\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void moveZeroes(vector<int>& nums) {\n        // Move in-place\n    }\n};`,
    },
    [
      { input: '[0,1,0,3,12]', expectedOutput: '[1,3,12,0,0]' },
      { input: '[0]', expectedOutput: '[0]' },
    ]
  ),

  challenge('intersection-two-arrays', 'Intersection of Two Arrays II', 'Given two integer arrays nums1 and nums2, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays. You may return the result in any order.', 'easy', 'Hash Map', 25,
    {
      javascript: `function intersect(nums1, nums2) {\n  // Return the intersection array\n  return [];\n}`,
      python: `def intersect(nums1, nums2):\n    # Return the intersection list\n    return []`,
      java: `class Solution {\n    public int[] intersect(int[] nums1, int[] nums2) {\n        return new int[]{};\n    }\n}`,
      c: `#include <stdlib.h>\n\nint* intersect(int* nums1, int n1, int* nums2, int n2, int* returnSize) {\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> intersect(vector<int>& nums1, vector<int>& nums2) {\n        return {};\n    }\n};`,
    },
    [
      { input: '[1,2,2,1], [2,2]', expectedOutput: '[2,2]' },
      { input: '[4,9,5], [9,4,9,8,4]', expectedOutput: '[4,9]' },
    ]
  ),

  challenge('plus-one', 'Plus One', 'You are given a large integer represented as an integer array digits, where each digits[i] is the ith digit of the integer. Increment the large integer by one and return the resulting array of digits.', 'easy', 'Arrays', 20,
    {
      javascript: `function plusOne(digits) {\n  // Increment the number and return new array\n  return [];\n}`,
      python: `def plusOne(digits):\n    # Increment the number and return new list\n    return []`,
      java: `class Solution {\n    public int[] plusOne(int[] digits) {\n        return new int[]{};\n    }\n}`,
      c: `#include <stdlib.h>\n\nint* plusOne(int* digits, int digitsSize, int* returnSize) {\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> plusOne(vector<int>& digits) {\n        return {};\n    }\n};`,
    },
    [
      { input: '[1,2,3]', expectedOutput: '[1,2,4]' },
      { input: '[4,3,2,1]', expectedOutput: '[4,3,2,2]' },
      { input: '[9,9,9]', expectedOutput: '[1,0,0,0]' },
    ]
  ),

  challenge('sqrt-x', 'Sqrt(x)', 'Given a non-negative integer x, return the square root of x rounded down to the nearest integer. Do not use any built-in exponent function or operator.', 'easy', 'Binary Search', 25,
    {
      javascript: `function mySqrt(x) {\n  // Return floor(sqrt(x))\n  return 0;\n}`,
      python: `def mySqrt(x):\n    # Return floor(sqrt(x))\n    return 0`,
      java: `class Solution {\n    public int mySqrt(int x) {\n        return 0;\n    }\n}`,
      c: `int mySqrt(int x) {\n    return 0;\n}`,
      cpp: `class Solution {\npublic:\n    int mySqrt(int x) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '4', expectedOutput: '2' },
      { input: '8', expectedOutput: '2' },
      { input: '16', expectedOutput: '4' },
    ]
  ),

  // ─── MEDIUM (18–35) ───────────────────────────────────────────────────────

  challenge('max-subarray', 'Maximum Subarray', 'Given an integer array nums, find the subarray with the largest sum and return its sum.', 'medium', 'Dynamic Programming', 30,
    {
      javascript: `function maxSubArray(nums) {\n  // Return the largest subarray sum\n  return 0;\n}`,
      python: `def maxSubArray(nums):\n    # Return the largest subarray sum\n    return 0`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}`,
      c: `int maxSubArray(int* nums, int numsSize) {\n    return 0;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' },
      { input: '[5,4,-1,7,8]', expectedOutput: '23' },
    ]
  ),

  challenge('merge-intervals', 'Merge Intervals', 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.', 'medium', 'Sorting', 35,
    {
      javascript: `function merge(intervals) {\n  // Merge overlapping intervals\n  return [];\n}`,
      python: `def merge(intervals):\n    # Merge overlapping intervals\n    return []`,
      java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        return new int[][]{};\n    }\n}`,
      c: `#include <stdlib.h>\n\nint** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        return {};\n    }\n};`,
    },
    [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]' },
    ]
  ),

  challenge('group-anagrams', 'Group Anagrams', 'Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word formed by rearranging the letters of another word.', 'medium', 'Hash Map', 30,
    {
      javascript: `function groupAnagrams(strs) {\n  // Return an array of grouped anagram arrays\n  return [];\n}`,
      python: `def groupAnagrams(strs):\n    # Return a list of grouped anagram lists\n    return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        return new ArrayList<>();\n    }\n}`,
      c: `// Group anagrams - return count of groups\nint groupAnagrams(char** strs, int strsSize) {\n    return 0;\n}`,
      cpp: `#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        return {};\n    }\n};`,
    },
    [
      { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: '[""]', expectedOutput: '[[""]]' },
      { input: '["a"]', expectedOutput: '[["a"]]' },
    ]
  ),

  challenge('three-sum', '3Sum', 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.', 'medium', 'Two Pointers', 40,
    {
      javascript: `function threeSum(nums) {\n  // Return array of unique triplets that sum to zero\n  return [];\n}`,
      python: `def threeSum(nums):\n    # Return list of unique triplets that sum to zero\n    return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        return new ArrayList<>();\n    }\n}`,
      c: `#include <stdlib.h>\n\nint** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        return {};\n    }\n};`,
    },
    [
      { input: '[-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]' },
      { input: '[0,1,1]', expectedOutput: '[]' },
      { input: '[0,0,0]', expectedOutput: '[[0,0,0]]' },
    ]
  ),

  challenge('container-with-most-water', 'Container With Most Water', 'You are given an integer array height of length n. There are n vertical lines. Find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water a container can store.', 'medium', 'Two Pointers', 30,
    {
      javascript: `function maxArea(height) {\n  // Return the maximum water area\n  return 0;\n}`,
      python: `def maxArea(height):\n    # Return the maximum water area\n    return 0`,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        return 0;\n    }\n}`,
      c: `int maxArea(int* height, int heightSize) {\n    return 0;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '[1,8,6,2,5,4,8,3,7]', expectedOutput: '49' },
      { input: '[1,1]', expectedOutput: '1' },
    ]
  ),

  challenge('longest-substring-no-repeat', 'Longest Substring Without Repeating Characters', 'Given a string s, find the length of the longest substring without repeating characters.', 'medium', 'Sliding Window', 30,
    {
      javascript: `function lengthOfLongestSubstring(s) {\n  // Return the length of the longest substring without repeating chars\n  return 0;\n}`,
      python: `def lengthOfLongestSubstring(s):\n    # Return the length of the longest substring without repeating chars\n    return 0`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}`,
      c: `int lengthOfLongestSubstring(char* s) {\n    return 0;\n}`,
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '"abcabcbb"', expectedOutput: '3' },
      { input: '"bbbbb"', expectedOutput: '1' },
      { input: '"pwwkew"', expectedOutput: '3' },
    ]
  ),

  challenge('product-except-self', 'Product of Array Except Self', 'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. You must solve it without using division and in O(n) time.', 'medium', 'Arrays', 30,
    {
      javascript: `function productExceptSelf(nums) {\n  // Return the product array\n  return [];\n}`,
      python: `def productExceptSelf(nums):\n    # Return the product list\n    return []`,
      java: `class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        return new int[]{};\n    }\n}`,
      c: `#include <stdlib.h>\n\nint* productExceptSelf(int* nums, int numsSize, int* returnSize) {\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        return {};\n    }\n};`,
    },
    [
      { input: '[1,2,3,4]', expectedOutput: '[24,12,8,6]' },
      { input: '[-1,1,0,-3,3]', expectedOutput: '[0,0,9,0,0]' },
    ]
  ),

  challenge('sort-colors', 'Sort Colors', 'Given an array nums with n objects colored red (0), white (1), or blue (2), sort them in-place so that objects of the same color are adjacent. You must solve this without using the library sort function.', 'medium', 'Sorting', 30,
    {
      javascript: `function sortColors(nums) {\n  // Sort in-place and return\n  return nums;\n}`,
      python: `def sortColors(nums):\n    # Sort in-place and return\n    return nums`,
      java: `class Solution {\n    public int[] sortColors(int[] nums) {\n        // Sort in-place and return\n        return nums;\n    }\n}`,
      c: `void sortColors(int* nums, int numsSize) {\n    // Sort in-place\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void sortColors(vector<int>& nums) {\n        // Sort in-place\n    }\n};`,
    },
    [
      { input: '[2,0,2,1,1,0]', expectedOutput: '[0,0,1,1,2,2]' },
      { input: '[2,0,1]', expectedOutput: '[0,1,2]' },
    ]
  ),

  challenge('rotate-image', 'Rotate Image', 'You are given an n x n 2D matrix representing an image. Rotate the image by 90 degrees clockwise. You have to rotate the image in-place.', 'medium', 'Matrix', 35,
    {
      javascript: `function rotate(matrix) {\n  // Rotate matrix 90 degrees clockwise in-place\n  return matrix;\n}`,
      python: `def rotate(matrix):\n    # Rotate matrix 90 degrees clockwise in-place\n    return matrix`,
      java: `class Solution {\n    public int[][] rotate(int[][] matrix) {\n        // Rotate in-place and return\n        return matrix;\n    }\n}`,
      c: `void rotate(int** matrix, int matrixSize, int* matrixColSize) {\n    // Rotate in-place\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void rotate(vector<vector<int>>& matrix) {\n        // Rotate in-place\n    }\n};`,
    },
    [
      { input: '[[1,2,3],[4,5,6],[7,8,9]]', expectedOutput: '[[7,4,1],[8,5,2],[9,6,3]]' },
      { input: '[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]', expectedOutput: '[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]' },
    ]
  ),

  challenge('binary-tree-level-order', 'Binary Tree Level Order Traversal', 'Given the root of a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).', 'medium', 'Trees', 35,
    {
      javascript: `/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\n/**\n * @param {TreeNode} root\n * @return {number[][]}\n */\nvar levelOrder = function(root) {\n    \n};`,
      python: `# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\nclass Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        pass`,
      java: `/**\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode() {}\n *     TreeNode(int val) { this.val = val; }\n *     TreeNode(int val, TreeNode left, TreeNode right) {\n *         this.val = val;\n *         this.left = left;\n *         this.right = right;\n *     }\n * }\n */\nclass Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        \n    }\n}`,
      c: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     struct TreeNode *left;\n *     struct TreeNode *right;\n * };\n */\nint** levelOrder(struct TreeNode* root, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     TreeNode *left;\n *     TreeNode *right;\n *     TreeNode() : val(0), left(nullptr), right(nullptr) {}\n *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n * };\n */\nclass Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        return {};\n    }\n};`,
    },
    [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]' },
      { input: '[1]', expectedOutput: '[[1]]' },
    ]
  ),

  challenge('validate-bst', 'Validate Binary Search Tree', 'Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has all left subtree values less than the node, and all right subtree values greater.', 'medium', 'Trees', 35,
    {
      javascript: `/**\n * Definition for a binary tree node.\n * function TreeNode(val, left, right) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.left = (left===undefined ? null : left)\n *     this.right = (right===undefined ? null : right)\n * }\n */\n/**\n * @param {TreeNode} root\n * @return {boolean}\n */\nvar isValidBST = function(root) {\n    \n};`,
      python: `# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\nclass Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        pass`,
      java: `/**\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode() {}\n *     TreeNode(int val) { this.val = val; }\n *     TreeNode(int val, TreeNode left, TreeNode right) {\n *         this.val = val;\n *         this.left = left;\n *         this.right = right;\n *     }\n * }\n */\nclass Solution {\n    public boolean isValidBST(TreeNode root) {\n        \n    }\n}`,
      c: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     struct TreeNode *left;\n *     struct TreeNode *right;\n * };\n */\nbool isValidBST(struct TreeNode* root) {\n    \n}`,
      cpp: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     TreeNode *left;\n *     TreeNode *right;\n *     TreeNode() : val(0), left(nullptr), right(nullptr) {}\n *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n * };\n */\nclass Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        \n    }\n};`,
    },
    [
      { input: '[2,1,3]', expectedOutput: 'true' },
      { input: '[5,1,4,null,null,3,6]', expectedOutput: 'false' },
    ]
  ),

  challenge('coin-change', 'Coin Change', 'You are given an integer array coins representing coin denominations and an integer amount. Return the fewest number of coins needed to make up that amount. If that amount cannot be made up, return -1.', 'medium', 'Dynamic Programming', 35,
    {
      javascript: `function coinChange(coins, amount) {\n  // Return minimum number of coins, or -1\n  return -1;\n}`,
      python: `def coinChange(coins, amount):\n    # Return minimum number of coins, or -1\n    return -1`,
      java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        return -1;\n    }\n}`,
      c: `int coinChange(int* coins, int coinsSize, int amount) {\n    return -1;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        return -1;\n    }\n};`,
    },
    [
      { input: '[1,5,11], 11', expectedOutput: '1' },
      { input: '[2], 3', expectedOutput: '-1' },
      { input: '[1], 0', expectedOutput: '0' },
    ]
  ),

  challenge('number-of-islands', 'Number of Islands', 'Given an m x n 2D grid map of "1"s (land) and "0"s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.', 'medium', 'Graph', 35,
    {
      javascript: `function numIslands(grid) {\n  // Return the number of islands\n  return 0;\n}`,
      python: `def numIslands(grid):\n    # Return the number of islands\n    return 0`,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}`,
      c: `int numIslands(char** grid, int gridSize, int* gridColSize) {\n    return 0;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1' },
      { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3' },
    ]
  ),

  challenge('letter-combinations', 'Letter Combinations of a Phone Number', 'Given a string containing digits from 2-9, return all possible letter combinations that the number could represent (like on a phone keypad). 2=abc, 3=def, 4=ghi, 5=jkl, 6=mno, 7=pqrs, 8=tuv, 9=wxyz.', 'medium', 'Backtracking', 30,
    {
      javascript: `function letterCombinations(digits) {\n  // Return all possible letter combinations\n  return [];\n}`,
      python: `def letterCombinations(digits):\n    # Return all possible letter combinations\n    return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<String> letterCombinations(String digits) {\n        return new ArrayList<>();\n    }\n}`,
      c: `#include <stdlib.h>\n\nchar** letterCombinations(char* digits, int* returnSize) {\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp: `#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<string> letterCombinations(string digits) {\n        return {};\n    }\n};`,
    },
    [
      { input: '"23"', expectedOutput: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' },
      { input: '""', expectedOutput: '[]' },
      { input: '"2"', expectedOutput: '["a","b","c"]' },
    ]
  ),

  challenge('search-rotated-sorted', 'Search in Rotated Sorted Array', 'Given a rotated sorted array nums and a target value, search target in nums. Return its index if found, otherwise return -1. You must write an algorithm with O(log n) runtime complexity.', 'medium', 'Binary Search', 35,
    {
      javascript: `function search(nums, target) {\n  // Return index of target, or -1\n  return -1;\n}`,
      python: `def search(nums, target):\n    # Return index of target, or -1\n    return -1`,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}`,
      c: `int search(int* nums, int numsSize, int target) {\n    return -1;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};`,
    },
    [
      { input: '[4,5,6,7,0,1,2], 0', expectedOutput: '4' },
      { input: '[4,5,6,7,0,1,2], 3', expectedOutput: '-1' },
      { input: '[1], 0', expectedOutput: '-1' },
    ]
  ),

  challenge('find-first-last-position', 'Find First and Last Position', 'Given an array of integers nums sorted in non-decreasing order, find the starting and ending position of a given target value. If target is not found, return [-1, -1]. Must be O(log n).', 'medium', 'Binary Search', 30,
    {
      javascript: `function searchRange(nums, target) {\n  // Return [first, last] position\n  return [-1, -1];\n}`,
      python: `def searchRange(nums, target):\n    # Return [first, last] position\n    return [-1, -1]`,
      java: `class Solution {\n    public int[] searchRange(int[] nums, int target) {\n        return new int[]{-1, -1};\n    }\n}`,
      c: `#include <stdlib.h>\n\nint* searchRange(int* nums, int numsSize, int target, int* returnSize) {\n    *returnSize = 2;\n    int* result = (int*)malloc(2 * sizeof(int));\n    result[0] = -1; result[1] = -1;\n    return result;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> searchRange(vector<int>& nums, int target) {\n        return {-1, -1};\n    }\n};`,
    },
    [
      { input: '[5,7,7,8,8,10], 8', expectedOutput: '[3,4]' },
      { input: '[5,7,7,8,8,10], 6', expectedOutput: '[-1,-1]' },
      { input: '[], 0', expectedOutput: '[-1,-1]' },
    ]
  ),

  challenge('subsets', 'Subsets', 'Given an integer array nums of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.', 'medium', 'Backtracking', 30,
    {
      javascript: `function subsets(nums) {\n  // Return all subsets\n  return [];\n}`,
      python: `def subsets(nums):\n    # Return all subsets\n    return []`,
      java: `import java.util.*;\n\nclass Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        return new ArrayList<>();\n    }\n}`,
      c: `#include <stdlib.h>\n\nint** subsets(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {\n    *returnSize = 0;\n    return NULL;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        return {};\n    }\n};`,
    },
    [
      { input: '[1,2,3]', expectedOutput: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
      { input: '[0]', expectedOutput: '[[],[0]]' },
    ]
  ),

  challenge('word-search', 'Word Search', 'Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically).', 'medium', 'Backtracking', 35,
    {
      javascript: `function exist(board, word) {\n  // Return true if word exists in grid\n  return false;\n}`,
      python: `def exist(board, word):\n    # Return True if word exists in grid\n    return False`,
      java: `class Solution {\n    public boolean exist(char[][] board, String word) {\n        return false;\n    }\n}`,
      c: `#include <stdbool.h>\n\nbool exist(char** board, int boardSize, int* boardColSize, char* word) {\n    return false;\n}`,
      cpp: `#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool exist(vector<vector<char>>& board, string word) {\n        return false;\n    }\n};`,
    },
    [
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], "ABCCED"', expectedOutput: 'true' },
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], "SEE"', expectedOutput: 'true' },
      { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], "ABCB"', expectedOutput: 'false' },
    ]
  ),

  challenge('decode-ways', 'Decode Ways', 'A message containing letters A-Z can be encoded as numbers: A=1, B=2, ..., Z=26. Given a string s containing only digits, return the number of ways to decode it.', 'medium', 'Dynamic Programming', 30,
    {
      javascript: `function numDecodings(s) {\n  // Return number of ways to decode\n  return 0;\n}`,
      python: `def numDecodings(s):\n    # Return number of ways to decode\n    return 0`,
      java: `class Solution {\n    public int numDecodings(String s) {\n        return 0;\n    }\n}`,
      c: `int numDecodings(char* s) {\n    return 0;\n}`,
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int numDecodings(string s) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '"12"', expectedOutput: '2' },
      { input: '"226"', expectedOutput: '3' },
      { input: '"06"', expectedOutput: '0' },
    ]
  ),

  challenge('house-robber', 'House Robber', 'You are a robber planning to rob houses along a street. Each house has a certain amount of money. Adjacent houses have security systems connected — if two adjacent houses are broken into, the police will be alerted. Given an array of non-negative integers representing the amount at each house, determine the maximum amount you can rob without alerting the police.', 'medium', 'Dynamic Programming', 30,
    {
      javascript: `function rob(nums) {\n  // Return maximum amount you can rob\n  return 0;\n}`,
      python: `def rob(nums):\n    # Return maximum amount you can rob\n    return 0`,
      java: `class Solution {\n    public int rob(int[] nums) {\n        return 0;\n    }\n}`,
      c: `int rob(int* nums, int numsSize) {\n    return 0;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int rob(vector<int>& nums) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '[1,2,3,1]', expectedOutput: '4' },
      { input: '[2,7,9,3,1]', expectedOutput: '12' },
    ]
  ),

  // ─── HARD (36–50) ─────────────────────────────────────────────────────────

  challenge('trapping-rain-water', 'Trapping Rain Water', 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.', 'hard', 'Two Pointers', 45,
    {
      javascript: `function trap(height) {\n  // Return amount of trapped water\n  return 0;\n}`,
      python: `def trap(height):\n    # Return amount of trapped water\n    return 0`,
      java: `class Solution {\n    public int trap(int[] height) {\n        return 0;\n    }\n}`,
      c: `int trap(int* height, int heightSize) {\n    return 0;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6' },
      { input: '[4,2,0,3,2,5]', expectedOutput: '9' },
    ]
  ),

  challenge('merge-k-sorted-lists', 'Merge K Sorted Lists', 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.', 'hard', 'Heap', 45,
    {
      javascript: `/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode[]} lists\n * @return {ListNode}\n */\nvar mergeKLists = function(lists) {\n    \n};`,
      python: `# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        pass`,
      java: `/**\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode() {}\n *     ListNode(int val) { this.val = val; }\n *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n * }\n */\nclass Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        \n    }\n}`,
      c: `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     struct ListNode *next;\n * };\n */\nstruct ListNode* mergeKLists(struct ListNode** lists, int listsSize) {\n    \n}`,
      cpp: `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n *     ListNode(int x, ListNode *next) : val(x), next(next) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        \n    }\n};`,
    },
    [
      { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]' },
      { input: '[]', expectedOutput: '[]' },
      { input: '[[]]', expectedOutput: '[]' },
    ]
  ),

  challenge('lru-cache', 'LRU Cache', 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement get(key) which returns the value or -1, and put(key, value) which inserts or updates. When capacity is reached, evict the least recently used key.', 'hard', 'Design', 50,
    {
      javascript: `class LRUCache {\n  constructor(capacity) {\n    // Initialize\n  }\n  get(key) {\n    // Return value or -1\n    return -1;\n  }\n  put(key, value) {\n    // Insert or update\n  }\n}`,
      python: `class LRUCache:\n    def __init__(self, capacity):\n        # Initialize\n        pass\n\n    def get(self, key):\n        # Return value or -1\n        return -1\n\n    def put(self, key, value):\n        # Insert or update\n        pass`,
      java: `import java.util.*;\n\nclass LRUCache {\n    public LRUCache(int capacity) {\n        // Initialize\n    }\n    public int get(int key) {\n        return -1;\n    }\n    public void put(int key, int value) {\n        // Insert or update\n    }\n}`,
      c: `#include <stdlib.h>\n\ntypedef struct {\n    int capacity;\n    // Add your data structure here\n} LRUCache;\n\nLRUCache* lRUCacheCreate(int capacity) {\n    return NULL;\n}\n\nint lRUCacheGet(LRUCache* obj, int key) {\n    return -1;\n}\n\nvoid lRUCachePut(LRUCache* obj, int key, int value) {\n}`,
      cpp: `#include <unordered_map>\n#include <list>\nusing namespace std;\n\nclass LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // Initialize\n    }\n    int get(int key) {\n        return -1;\n    }\n    void put(int key, int value) {\n        // Insert or update\n    }\n};`,
    },
    [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"], [[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', expectedOutput: '[null,null,null,1,null,-1,null,-1,3,4]' },
    ]
  ),

  challenge('longest-increasing-subsequence', 'Longest Increasing Subsequence', 'Given an integer array nums, return the length of the longest strictly increasing subsequence.', 'hard', 'Dynamic Programming', 40,
    {
      javascript: `function lengthOfLIS(nums) {\n  // Return length of longest increasing subsequence\n  return 0;\n}`,
      python: `def lengthOfLIS(nums):\n    # Return length of longest increasing subsequence\n    return 0`,
      java: `class Solution {\n    public int lengthOfLIS(int[] nums) {\n        return 0;\n    }\n}`,
      c: `int lengthOfLIS(int* nums, int numsSize) {\n    return 0;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '[10,9,2,5,3,7,101,18]', expectedOutput: '4' },
      { input: '[0,1,0,3,2,3]', expectedOutput: '4' },
      { input: '[7,7,7,7,7,7,7]', expectedOutput: '1' },
    ]
  ),

  challenge('word-break', 'Word Break', 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.', 'hard', 'Dynamic Programming', 40,
    {
      javascript: `function wordBreak(s, wordDict) {\n  // Return true if s can be segmented\n  return false;\n}`,
      python: `def wordBreak(s, wordDict):\n    # Return True if s can be segmented\n    return False`,
      java: `import java.util.*;\n\nclass Solution {\n    public boolean wordBreak(String s, List<String> wordDict) {\n        return false;\n    }\n}`,
      c: `#include <stdbool.h>\n\nbool wordBreak(char* s, char** wordDict, int wordDictSize) {\n    return false;\n}`,
      cpp: `#include <string>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool wordBreak(string s, vector<string>& wordDict) {\n        return false;\n    }\n};`,
    },
    [
      { input: '"leetcode", ["leet","code"]', expectedOutput: 'true' },
      { input: '"applepenapple", ["apple","pen"]', expectedOutput: 'true' },
      { input: '"catsandog", ["cats","dog","sand","and","cat"]', expectedOutput: 'false' },
    ]
  ),

  challenge('serialize-deserialize-bt', 'Serialize and Deserialize Binary Tree', 'Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.', 'hard', 'Trees', 50,
    {
      javascript: `/**\n * Definition for a binary tree node.\n * function TreeNode(val) {\n *     this.val = val;\n *     this.left = this.right = null;\n * }\n */\n\n/**\n * Encodes a tree to a single string.\n *\n * @param {TreeNode} root\n * @return {string}\n */\nvar serialize = function(root) {\n    \n};\n\n/**\n * Decodes your encoded data to tree.\n *\n * @param {string} data\n * @return {TreeNode}\n */\nvar deserialize = function(data) {\n    \n};`,
      python: `# Definition for a binary tree node.\n# class TreeNode(object):\n#     def __init__(self, x):\n#         self.val = x\n#         self.left = None\n#         self.right = None\n\nclass Codec:\n\n    def serialize(self, root):\n        """Encodes a tree to a single string.\n        \n        :type root: TreeNode\n        :rtype: str\n        """\n        pass\n\n    def deserialize(self, data):\n        """Decodes your encoded data to tree.\n        \n        :type data: str\n        :rtype: TreeNode\n        """\n        pass`,
      java: `/**\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode(int x) { val = x; }\n * }\n */\npublic class Codec {\n\n    // Encodes a tree to a single string.\n    public String serialize(TreeNode root) {\n        \n    }\n\n    // Decodes your encoded data to tree.\n    public TreeNode deserialize(String data) {\n        \n    }\n}`,
      c: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     struct TreeNode *left;\n *     struct TreeNode *right;\n * };\n */\n/** Encodes a tree to a single string. */\nchar* serialize(struct TreeNode* root) {\n    \n}\n\n/** Decodes your encoded data to tree. */\nstruct TreeNode* deserialize(char* data) {\n    \n}`,
      cpp: `/**\n * Definition for a binary tree node.\n * struct TreeNode {\n *     int val;\n *     TreeNode *left;\n *     TreeNode *right;\n *     TreeNode(int x) : val(x), left(NULL), right(NULL) {}\n * };\n */\nclass Codec {\npublic:\n\n    // Encodes a tree to a single string.\n    string serialize(TreeNode* root) {\n        \n    }\n\n    // Decodes your encoded data to tree.\n    TreeNode* deserialize(string data) {\n        \n    }\n};`,
    },
    [
      { input: '[1,2,3,null,null,4,5]', expectedOutput: '[1,2,3,null,null,4,5]' },
      { input: '[]', expectedOutput: '[]' },
    ]
  ),

  challenge('course-schedule', 'Course Schedule', 'There are numCourses courses labeled from 0 to numCourses-1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first before course ai. Return true if you can finish all courses.', 'hard', 'Graph', 40,
    {
      javascript: `function canFinish(numCourses, prerequisites) {\n  // Return true if all courses can be finished\n  return false;\n}`,
      python: `def canFinish(numCourses, prerequisites):\n    # Return True if all courses can be finished\n    return False`,
      java: `class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        return false;\n    }\n}`,
      c: `#include <stdbool.h>\n\nbool canFinish(int numCourses, int** prerequisites, int prerequisitesSize, int* prerequisitesColSize) {\n    return false;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        return false;\n    }\n};`,
    },
    [
      { input: '2, [[1,0]]', expectedOutput: 'true' },
      { input: '2, [[1,0],[0,1]]', expectedOutput: 'false' },
    ]
  ),

  challenge('minimum-window-substring', 'Minimum Window Substring', 'Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window. If there is no such substring, return the empty string "".', 'hard', 'Sliding Window', 45,
    {
      javascript: `function minWindow(s, t) {\n  // Return minimum window substring\n  return "";\n}`,
      python: `def minWindow(s, t):\n    # Return minimum window substring\n    return ""`,
      java: `class Solution {\n    public String minWindow(String s, String t) {\n        return "";\n    }\n}`,
      c: `#include <string.h>\n#include <stdlib.h>\n\nchar* minWindow(char* s, char* t) {\n    return "";\n}`,
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    string minWindow(string s, string t) {\n        return "";\n    }\n};`,
    },
    [
      { input: '"ADOBECODEBANC", "ABC"', expectedOutput: '"BANC"' },
      { input: '"a", "a"', expectedOutput: '"a"' },
      { input: '"a", "aa"', expectedOutput: '""' },
    ]
  ),

  challenge('edit-distance', 'Edit Distance', 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2. You have three operations: insert a character, delete a character, replace a character.', 'hard', 'Dynamic Programming', 45,
    {
      javascript: `function minDistance(word1, word2) {\n  // Return minimum edit distance\n  return 0;\n}`,
      python: `def minDistance(word1, word2):\n    # Return minimum edit distance\n    return 0`,
      java: `class Solution {\n    public int minDistance(String word1, String word2) {\n        return 0;\n    }\n}`,
      c: `int minDistance(char* word1, char* word2) {\n    return 0;\n}`,
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '"horse", "ros"', expectedOutput: '3' },
      { input: '"intention", "execution"', expectedOutput: '5' },
    ]
  ),

  challenge('median-two-sorted-arrays', 'Median of Two Sorted Arrays', 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).', 'hard', 'Binary Search', 50,
    {
      javascript: `function findMedianSortedArrays(nums1, nums2) {\n  // Return the median\n  return 0;\n}`,
      python: `def findMedianSortedArrays(nums1, nums2):\n    # Return the median\n    return 0`,
      java: `class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        return 0;\n    }\n}`,
      c: `double findMedianSortedArrays(int* nums1, int nums1Size, int* nums2, int nums2Size) {\n    return 0;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '[1,3], [2]', expectedOutput: '2.0' },
      { input: '[1,2], [3,4]', expectedOutput: '2.5' },
    ]
  ),

  challenge('regex-matching', 'Regular Expression Matching', 'Given a string s and a pattern p, implement regular expression matching with support for "." and "*" where "." matches any single character and "*" matches zero or more of the preceding element.', 'hard', 'Dynamic Programming', 50,
    {
      javascript: `function isMatch(s, p) {\n  // Return true if pattern matches entire string\n  return false;\n}`,
      python: `def isMatch(s, p):\n    # Return True if pattern matches entire string\n    return False`,
      java: `class Solution {\n    public boolean isMatch(String s, String p) {\n        return false;\n    }\n}`,
      c: `#include <stdbool.h>\n\nbool isMatch(char* s, char* p) {\n    return false;\n}`,
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isMatch(string s, string p) {\n        return false;\n    }\n};`,
    },
    [
      { input: '"aa", "a"', expectedOutput: 'false' },
      { input: '"aa", "a*"', expectedOutput: 'true' },
      { input: '"ab", ".*"', expectedOutput: 'true' },
    ]
  ),

  challenge('longest-valid-parentheses', 'Longest Valid Parentheses', 'Given a string containing just "(" and ")", return the length of the longest valid (well-formed) parentheses substring.', 'hard', 'Stack', 45,
    {
      javascript: `function longestValidParentheses(s) {\n  // Return the length of the longest valid parentheses substring\n  return 0;\n}`,
      python: `def longestValidParentheses(s):\n    # Return the length of the longest valid parentheses substring\n    return 0`,
      java: `class Solution {\n    public int longestValidParentheses(String s) {\n        return 0;\n    }\n}`,
      c: `int longestValidParentheses(char* s) {\n    return 0;\n}`,
      cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestValidParentheses(string s) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '"(()"', expectedOutput: '2' },
      { input: '")()())"', expectedOutput: '4' },
      { input: '""', expectedOutput: '0' },
    ]
  ),

  challenge('maximal-rectangle', 'Maximal Rectangle', 'Given a rows x cols binary matrix filled with 0s and 1s, find the largest rectangle containing only 1s and return its area.', 'hard', 'Stack', 50,
    {
      javascript: `function maximalRectangle(matrix) {\n  // Return area of largest rectangle of 1s\n  return 0;\n}`,
      python: `def maximalRectangle(matrix):\n    # Return area of largest rectangle of 1s\n    return 0`,
      java: `class Solution {\n    public int maximalRectangle(char[][] matrix) {\n        return 0;\n    }\n}`,
      c: `int maximalRectangle(char** matrix, int matrixSize, int* matrixColSize) {\n    return 0;\n}`,
      cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int maximalRectangle(vector<vector<char>>& matrix) {\n        return 0;\n    }\n};`,
    },
    [
      { input: '[["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]', expectedOutput: '6' },
      { input: '[["0"]]', expectedOutput: '0' },
      { input: '[["1"]]', expectedOutput: '1' },
    ]
  ),
];

// ═════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

export function getChallenge(id: string): CodingChallenge | undefined {
  return CODING_CHALLENGES.find((c) => c.id === id);
}

export function listChallenges(difficulty?: Difficulty, language?: Language): CodingChallenge[] {
  let challenges = CODING_CHALLENGES;
  if (difficulty) {
    challenges = challenges.filter((c) => c.difficulty === difficulty);
  }
  // All challenges support all languages, so language filter is a no-op
  // but we include it for API consistency
  return challenges;
}

export function getChallengesByDifficulty(difficulty: Difficulty): CodingChallenge[] {
  return CODING_CHALLENGES.filter((c) => c.difficulty === difficulty);
}

export function getStarterCode(challenge: CodingChallenge, language: Language): string {
  return challenge.starterCodes[language] || challenge.starterCodes.javascript;
}