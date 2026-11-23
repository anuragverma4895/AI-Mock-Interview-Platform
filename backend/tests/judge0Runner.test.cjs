const test = require('node:test');
const assert = require('node:assert/strict');
const { executeCodingChallenge, CompilerUnavailableError } = require('../dist/services/judge0Runner.js');

const challenge={
  title:'Two Sum',
  starterCodes:{
    python:'def twoSum(nums,target):\n return []',
    java:'class Solution {public int[] twoSum(int[] nums,int target){return new int[]{};}}',
    cpp:'class Solution{public: vector<int> twoSum(vector<int>& nums,int target){return {};}};',
    c:'int* twoSum(int* nums,int numsSize,int target,int* returnSize){return NULL;}',
  },
  testCases:[{input:'[2,7,11,15], 9',expectedOutput:'[0,1]'}],
};
const solutions={
  python:'def twoSum(nums,target):\n return [0,1]',
  java:'class Solution{public int[] twoSum(int[] a,int b){return new int[]{0,1};}}',
  cpp:'class Solution{public: vector<int> twoSum(vector<int>& a,int b){return {0,1};}};',
  c:'int* twoSum(int* a,int n,int t,int* returnSize){static int out[]={0,1};*returnSize=2;return out;}',
};
test('all 4 languages call a Judge0-compatible remote compiler, not AI', async()=>{
  const originalFetch=global.fetch;
  const oldUrl=process.env.JUDGE0_API_URL;
  process.env.JUDGE0_API_URL='http://127.0.0.1:12345';
  const sourceCodes=[];
  global.fetch=async(url,init)=>{
    if(init.method==='POST'){
      const payload=JSON.parse(init.body);
      sourceCodes.push(payload.source_code);
      assert.equal(typeof payload.language_id,'number');
      assert.equal(payload.cpu_time_limit,5);
      return {ok:true,json:async()=>({token:'mock-123'})};
    }
    return {ok:true,json:async()=>({status:{id:3},stdout:'[0,1]\n'})};
  };
  try {
    for(const language of ['python','cpp','c','java']){
      const result=await executeCodingChallenge(language,solutions[language],challenge);
      assert.equal(result.length,1);
      assert.equal(result[0].passed,true);
      assert.equal(result[0].actual,'[0,1]');
    }
    assert.equal(sourceCodes.length,4);
  } finally {
    global.fetch=originalFetch;
    if(oldUrl===undefined)delete process.env.JUDGE0_API_URL;
    else process.env.JUDGE0_API_URL=oldUrl;
  }
});
test('compiler API authorization failure gives actionable error',async()=>{
  const orig=global.fetch;
  const old=process.env.JUDGE0_API_URL;
  process.env.JUDGE0_API_URL='http://127.0.0.1:12345';
  global.fetch=async()=>({ok:false,status:403});
  try{
    await assert.rejects(
      executeCodingChallenge('python',solutions.python,challenge),
      error=>error instanceof CompilerUnavailableError && /authorization failed/.test(error.message)
    );
  }finally{
    global.fetch=orig;
    if(old===undefined)delete process.env.JUDGE0_API_URL;
    else process.env.JUDGE0_API_URL=old;
  }
});
