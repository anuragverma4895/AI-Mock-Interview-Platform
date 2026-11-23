const test = require('node:test');
const assert = require('node:assert/strict');
const { createOpeningQuestion } = require('../dist/services/openingQuestion.js');

test('technical opening question is instant and tailored to resume programming language', () => {
  const q = createOpeningQuestion('DSA', 'medium', ['C++', 'React', 'MongoDB'], []);
  assert.match(q.question, /in C\+\+/);
  assert.equal(q.category, 'DSA');
  assert.equal(q.difficulty, 'medium');
  assert.match(q.idealAnswer, /O\(n\)/);
});

test('HR opening question uses candidate project', () => {
  const q = createOpeningQuestion('HR', 'easy', [], [{ name: 'AI Mock Interview Platform' }]);
  assert.match(q.question, /AI Mock Interview Platform/);
  assert.equal(q.category, 'HR');
});

test('opening question works without resume', () => {
  const q = createOpeningQuestion('DSA', 'hard');
  assert.match(q.question, /Two Sum/);
  assert.equal(q.difficulty, 'hard');
});

test('project opening question uses available project', () => {
  const q = createOpeningQuestion('Project', 'medium', [], [{ name: 'Payment Processing System' }]);
  assert.match(q.question, /Payment Processing System/);
});
