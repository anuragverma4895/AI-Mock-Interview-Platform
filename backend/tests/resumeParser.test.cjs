const test = require('node:test');
const assert = require('node:assert/strict');
const { extractSkills } = require('../dist/services/resumeParser.js');

test('resume skill extraction does not confuse Java and JavaScript', () => {
 const skills = extractSkills('Built a JavaScript React app.');
 assert.equal(skills.includes('javascript'), true);
 assert.equal(skills.includes('java'), false);
 assert.equal(skills.includes('react'), true);
});

test('resume skill extraction recognizes common Node and Mongo aliases', () => {
 const skills = extractSkills('Technical Skills: Node.js, MongoDB, C++, SQL, Python');
 assert.equal(skills.includes('nodejs'), true);
 assert.equal(skills.includes('mongodb'), true);
 assert.equal(skills.includes('c++'), true);
 assert.equal(skills.includes('sql'), true);
});

test('word boundaries avoid false AI and REST matches', () => {
 const skills = extractSkills('I completed training and studied strategy at university.');
 assert.equal(skills.includes('ai'), false);
 assert.equal(skills.includes('rest'), false);
});
