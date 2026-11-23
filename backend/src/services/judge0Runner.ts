import { buildSubmission, ChallengeShape, Language, TestCase } from './codingHarness';
import { sameCodingOutput } from '../utils/browserCodingResults';

export type ExecutionResult = {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
};
export class CompilerUnavailableError extends Error {}

const LANGUAGE_IDS: Record<Exclude<Language, 'javascript'>, number> = {
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
};

function remoteSettings(language: Exclude<Language, 'javascript'>) {
  // This public Judge0 demo is an initial default, not a guaranteed production service.
  // In production, set JUDGE0_API_URL to a dedicated/authorized Judge0 endpoint.
  const base = (process.env.JUDGE0_API_URL || 'https://ce.judge0.com').trim().replace(/\/+$/, '');
  let url: URL;
  try { url = new URL(base); }
  catch { throw new CompilerUnavailableError('Compiler URL is invalid. Set JUDGE0_API_URL on the backend.'); }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost','127.0.0.1'].includes(url.hostname))) {
    throw new CompilerUnavailableError('Compiler URL must use HTTPS (or HTTP on localhost).');
  }
  const customLanguage = Number(process.env['JUDGE0_ID_' + language.toUpperCase()]);
  const languageId = Number.isSafeInteger(customLanguage) && customLanguage > 0
    ? customLanguage : LANGUAGE_IDS[language];
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (process.env.JUDGE0_AUTH_TOKEN) headers['X-Auth-Token'] = process.env.JUDGE0_AUTH_TOKEN;
  if (process.env.JUDGE0_RAPIDAPI_KEY) {
    headers['X-RapidAPI-Key'] = process.env.JUDGE0_RAPIDAPI_KEY;
    headers['X-RapidAPI-Host'] = url.hostname;
  }
  return { base, languageId, headers };
}

async function remoteRequest(url:string, init: RequestInit, timeoutMs = 12000): Promise<any> {
  let result: Response;
  try { result = await fetch(url, { ...init, signal:AbortSignal.timeout(timeoutMs) }); }
  catch { throw new CompilerUnavailableError('The compiler service is unreachable. Check JUDGE0_API_URL and network access.'); }
  if (!result.ok) {
    const reason = result.status === 401 || result.status === 403
      ? 'Compiler service authorization failed. Set a valid Judge0 API token on Render.'
      : result.status === 429
        ? 'Compiler service rate limit reached. Try again later or use your own Judge0 service.'
        : 'Compiler request failed (HTTP ' + result.status + '). Check its status or configuration.';
    throw new CompilerUnavailableError(reason);
  }
  try { return await result.json(); }
  catch { throw new CompilerUnavailableError('Compiler service sent an invalid response.'); }
}
async function runCase(language: Exclude<Language, 'javascript'>, code: string, challenge: ChallengeShape, testcase: TestCase): Promise<ExecutionResult> {
  const {base,languageId,headers}=remoteSettings(language);
  const prepared = buildSubmission(language, code, challenge, testcase);
  const posted = await remoteRequest(base + '/submissions?base64_encoded=false&wait=false', {
    method:'POST',
    headers,
    body:JSON.stringify({
      language_id:languageId,
      source_code:prepared.source_code,
      stdin:prepared.stdin,
      cpu_time_limit:5,
      wall_time_limit:10,
      memory_limit:384000,
      max_file_size:1024,
    }),
  });
  if (!posted?.token || typeof posted.token !== 'string') throw new CompilerUnavailableError('Compiler did not return a submission token.');

  for (let attempt=0;attempt<18;attempt++) {
    await new Promise(resolve => setTimeout(resolve, attempt < 5 ? 500 : 850));
    const output = await remoteRequest(base + '/submissions/' + encodeURIComponent(posted.token) + '?base64_encoded=false&fields=stdout,stderr,compile_output,message,status', {
      method:'GET', headers,
    });
    const status = output?.status?.id;
    if (status===1||status===2) continue;
    if (typeof status !== 'number') throw new CompilerUnavailableError('Compiler returned no execution status.');
    if (status===3) {
      const actual = String(output.stdout || '').trim().slice(0,2048);
      return {
        passed:sameCodingOutput(actual,testcase.expectedOutput,challenge.title),
        input:testcase.input,
        expected:testcase.expectedOutput,
        actual:actual || '(no output)',
      };
    }
    const diagnostic = String(output.compile_output || output.stderr || output.message || output.status?.description || 'Execution failed').slice(0,1000);
    return { passed:false, input:testcase.input, expected:testcase.expectedOutput,actual:diagnostic };
  }
  throw new CompilerUnavailableError('Compiler timed out. Retry or configure a faster isolated runner.');
}

export async function executeCodingChallenge(
  language: string,
  code: string,
  challenge: ChallengeShape & {testCases: TestCase[]}
): Promise<ExecutionResult[]> {
  if (!['python','java','cpp','c'].includes(language)) {
    throw new Error('Unsupported compiler language');
  }
  if (!Array.isArray(challenge.testCases) || challenge.testCases.length===0 || challenge.testCases.length>12) {
    throw new Error('Unsupported test case count (1-12 required)');
  }
  if (typeof code!=='string' || code.length>50000 || !code.trim()) throw new Error('Provide valid source code');
  // Reject unsupported formats before spending compiler quota.
  // Do not execute user code in the Node/Express API process.
  const lang=language as Exclude<Language,'javascript'>;
  return Promise.all(challenge.testCases.map(tc => runCase(lang,code,challenge,tc)));
}
