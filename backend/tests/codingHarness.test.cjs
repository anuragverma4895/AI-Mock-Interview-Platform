const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const { buildSubmission } = require('../dist/services/codingHarness.js');

const cases = [{ input: '[2,7,11,15], 9', expectedOutput: '[0,1]' }];
const starters = {
  python: 'def twoSum(nums, target):\n    return []',
  cpp: '#include <vector>\nusing namespace std;\nclass Solution {public:\nvector<int> twoSum(vector<int>& nums, int target) {return {};}};',
  java: 'class Solution {public int[] twoSum(int[] nums, int target){return new int[]{};}}',
  c: 'int* twoSum(int* nums, int numsSize, int target, int* returnSize) {return NULL;}',
};
const solutions = {
  python: 'def twoSum(nums, target):\n seen={}\n for i,v in enumerate(nums):\n  if target-v in seen: return [seen[target-v],i]\n  seen[v]=i\n return []',
  cpp: '#include <vector>\n#include <unordered_map>\nusing namespace std;\nclass Solution {public: vector<int> twoSum(vector<int>& a,int k){unordered_map<int,int> seen;for(int i=0;i<(int)a.size();i++){if(seen.count(k-a[i]))return {seen[k-a[i]],i};seen[a[i]]=i;}return {};}};',
  java: 'class Solution {public int[] twoSum(int[] a,int t){java.util.HashMap<Integer,Integer> m=new java.util.HashMap<>();for(int i=0;i<a.length;i++){if(m.containsKey(t-a[i]))return new int[]{m.get(t-a[i]),i};m.put(a[i],i);}return new int[]{};}}',
  c: '#include <stdlib.h>\nint* twoSum(int* a,int n,int t,int* returnSize){int* out=malloc(2*sizeof(int));for(int i=0;i<n;i++)for(int j=i+1;j<n;j++)if(a[i]+a[j]==t){out[0]=i;out[1]=j;*returnSize=2;return out;}*returnSize=0;return out;}',
};
function cmd(command,args,options={}) {
  const result=cp.spawnSync(command,args,{encoding:'utf8',timeout:25000,maxBuffer:300000,...options});
  if (result.error) throw result.error;
  assert.equal(result.status,0,command+' failed:\n'+result.stderr+'\n'+result.stdout);
  return result.stdout.trim();
}
for(const language of ['python','cpp','java','c']){
  test(language+' compiles and runs Two Sum with real test input without AI',() => {
    const challenge={title:'Two Sum',starterCodes:starters,starterCode:starters.javascript};
    const generated=buildSubmission(language,solutions[language],challenge,cases[0]);
    const dir=fs.mkdtempSync(path.join(os.tmpdir(),'prepverse-judge-harness-'));
    try {
      let output='';
      if(language==='python'){
        const file=path.join(dir,'solution.py');
        fs.writeFileSync(file,generated.source_code);
        output=cmd('python3',[file],{input:generated.stdin,cwd:dir});
      } else if(language==='cpp'){
        fs.writeFileSync(path.join(dir,'solution.cpp'),generated.source_code);
        cmd('g++',['-std=c++17','-O0','solution.cpp','-o','program'],{cwd:dir});
        output=cmd('./program',[],{cwd:dir});
      } else if(language==='java'){
        fs.writeFileSync(path.join(dir,'Main.java'),generated.source_code);
        cmd('javac',['Main.java'],{cwd:dir});
        output=cmd('java',['-cp',dir,'Main'],{cwd:dir});
      } else {
        fs.writeFileSync(path.join(dir,'solution.c'),generated.source_code);
        cmd('gcc',['-std=c11','solution.c','-o','program'],{cwd:dir});
        output=cmd('./program',[],{cwd:dir});
      }
      assert.equal(output,'[0,1]');
    } finally {fs.rmSync(dir,{recursive:true,force:true});}
  });
}
test('unsupported language signatures fail with a clear message',() => {
 assert.throws(()=>buildSubmission('cpp','int f(){return 0;}',{title:'Unsupported',starterCodes:{cpp:'garbled'}},cases[0]),/signature/);
});
