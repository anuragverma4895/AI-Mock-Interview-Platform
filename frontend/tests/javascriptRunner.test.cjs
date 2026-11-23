const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const workerSource = fs.readFileSync(
  path.join(__dirname, '../src/workers/javascriptRunner.worker.ts'), 'utf8');
const compiled = ts.transpileModule(workerSource, {
  compilerOptions: {target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.None},
}).outputText;

function simulateBrowserWorker(code, testCases, title = 'Two Sum', functionName = 'twoSum') {
  let message = null;
  const ctx = vm.createContext({
    self: {postMessage: result => { message = result; }},
    console: { log() {}, error() {} },
  });
  vm.runInContext(compiled, ctx, {timeout: 2000});
  ctx.payload = {data: {code, cases: testCases, title, functionName}};
  vm.runInContext('self.onmessage(payload)', ctx, {timeout: 2000});
  return JSON.parse(JSON.stringify(message));
}

const cases = [
  {input:'[2,7,11,15], 9', expectedOutput:'[0,1]'},
  {input:'[3,2,4], 6', expectedOutput:'[1,2]'},
  {input:'[3,3], 6', expectedOutput:'[0,1]'},
];
test('Two Sum runs all real JS cases without a Gemini/OpenAI call', () => {
  const code = 'function twoSum(nums, target) { const map = new Map(); for(let i=0;i<nums.length;i++){const need=target-nums[i]; if(map.has(need))return [map.get(need),i];map.set(nums[i],i);}return [];}';
  const response = simulateBrowserWorker(code, cases);
  assert.equal(response.error, undefined);
  assert.equal(response.results.length, 3);
  assert.deepEqual(response.results.map(r => r.passed), [true,true,true]);
  assert.deepEqual(response.results.map(r => r.actual), ['[0,1]','[1,2]','[0,1]']);
});
test('Wrong code fails actual input/output comparisons', () => {
  const response = simulateBrowserWorker('function twoSum(){return [0,0]}', cases);
  assert.deepEqual(response.results.map(r => r.passed), [false,false,false]);
});
test('In-place JavaScript solutions are handled without a return value', () => {
  const response = simulateBrowserWorker(
    'function reverseString(s) { s.reverse(); }',
    [{input:'["h","i"]', expectedOutput:'["i","h"]'}],
    'Reverse String', 'reverseString');
  assert.equal(response.results[0].passed,true);
});
test('Syntax errors are reported, not falsely marked as passes', () => {
  const response = simulateBrowserWorker('function twoSum( {', cases);
  assert.match(response.error, /Unexpected|missing|end/i);
});
