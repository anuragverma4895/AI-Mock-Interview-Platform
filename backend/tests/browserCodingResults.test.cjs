const test = require('node:test');
const assert = require('node:assert/strict');
const { sameCodingOutput, normalizeBrowserResults } = require('../dist/utils/browserCodingResults.js');

test('Two Sum correct and incorrect results compare locally', () => {
  assert.equal(sameCodingOutput('[0,1]', '[0,1]', 'Two Sum'), true);
  assert.equal(sameCodingOutput('[1,2]', '[0,1]', 'Two Sum'), false);
});
test('unordered intersections are compared without order', () => {
  assert.equal(sameCodingOutput('[9,4]', '[4,9]', 'Intersection of Two Arrays II'), true);
});
test('server validates browser outputs rather than trusting client passed flags', () => {
  const t = [{input:'[2,7,11,15], 9', expectedOutput:'[0,1]'}];
  assert.equal(normalizeBrowserResults(t,[{passed:true,actual:'[1,2]'}],'Two Sum')[0].passed,false);
});
test('reject malformed and extra browser results', () => {
  const t = [{input:'1',expectedOutput:'2'}];
  assert.throws(() => normalizeBrowserResults(t, [], 'Example'), /number/);
  assert.throws(() => normalizeBrowserResults(t, [{actual:{x:1}}], 'Example'), /Invalid/);
});
