const test = require('node:test');
const assert = require('node:assert/strict');
const {
  extractPreviousQuestions,
  buildBoundedQuestionContext,
  areQuestionsSimilar,
  selectUnusedQuestion,
} = require('../dist/services/questionContext.js');

test('previous question wins over a submitted answer', () => {
  assert.deepEqual(extractPreviousQuestions([
    { role: 'user', question: 'What is a hash map?', content: 'I use a dictionary.' },
    { role: 'assistant', content: 'How does indexing work?' },
    { role: 'user', content: 'This is just an answer.' },
  ]), ['What is a hash map?', 'How does indexing work?']);
});

test('bounded context retains full history for local checks but sends only four recent questions', () => {
  const history = Array.from({ length: 50 }, (_, i) => ({ question: 'Explain database indexing concept ' + i }));
  const context = buildBoundedQuestionContext(history);
  assert.equal(context.previousQuestions.length, 50);
  assert.equal(context.recentQuestions.length, 4);
  assert.equal(context.earlierTopics.length <= 14, true);
  assert.equal(context.earlierTopics.includes('database'), true);
});

test('similarity checks ignore case/punctuation and catch common rephrasing', () => {
  assert.equal(areQuestionsSimilar('What is a Hash Table?', 'what is a hash table'), true);
  assert.equal(areQuestionsSimilar('Explain database indexing in SQL', 'Describe SQL database indexing'), true);
  assert.equal(areQuestionsSimilar('Explain database indexing in SQL', 'Explain a binary search tree'), false);
});

test('fallback tries an unused question of another difficulty', () => {
  const bank = [
    { difficulty: 'medium', question: 'What is a hash map?' },
    { difficulty: 'easy', question: 'Explain recursion with examples.' },
  ];
  assert.equal(selectUnusedQuestion(bank, 'medium', ['What is a hash map?'])?.question, 'Explain recursion with examples.');
});
