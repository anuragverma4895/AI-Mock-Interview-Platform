import type { CodingChallenge, CodingTestResult } from '../services/api';

const TIMEOUT_MS = 5000;
const MAX_CODE_LENGTH = 50000;

function entryName(challenge: CodingChallenge): string {
  const raw = challenge.starterCodes?.javascript || challenge.starterCode || '';
  // Remove JSDoc and comments before looking for the actual challenge function.
  // Otherwise a commented "function ListNode(...)" wins over mergeTwoLists().
  const starter = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const assigned = starter.match(/\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function\b|\()/);
  const named = starter.match(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/);
  const name = assigned?.[1] || named?.[1];
  if (!name) throw new Error('This challenge does not have a supported JavaScript function signature.');
  return name;
}

/** This is for self-practice, not an authoritative server-side code judge. */
export function runJavaScriptLocally(code: string, challenge: CodingChallenge): Promise<CodingTestResult[]> {
  if (!code.trim()) return Promise.reject(new Error('Write your solution before running tests.'));
  if (code.length > MAX_CODE_LENGTH) return Promise.reject(new Error('Code is too long (50,000 character limit).'));
  if (!challenge.testCases?.length) return Promise.reject(new Error('This challenge has no test cases.'));

  let functionName: string;
  try { functionName = entryName(challenge); }
  catch (error) { return Promise.reject(error); }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/javascriptRunner.worker.ts', import.meta.url), { type: 'module' });
    let finished = false;
    const finish = (error?: Error, results?: CodingTestResult[]) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeoutId);
      worker.terminate();
      if (error) reject(error);
      else resolve(results || []);
    };
    const timeoutId = window.setTimeout(() =>
      finish(new Error('Code execution exceeded 5 seconds. Check for infinite loops or slow algorithms.')), TIMEOUT_MS);
    worker.onerror = event => {
      event.preventDefault();
      finish(new Error('Could not execute JavaScript in the browser. Check for syntax errors.'));
    };
    worker.onmessage = (event: MessageEvent<{ results?: CodingTestResult[]; error?: string }>) => {
      const result = event.data;
      if (result.error) finish(new Error(result.error));
      else if (Array.isArray(result.results) && result.results.length === challenge.testCases.length) {
        finish(undefined, result.results);
      } else finish(new Error('Browser test runner returned incomplete results.'));
    };
    worker.postMessage({
      code,
      functionName,
      title: challenge.title,
      cases: challenge.testCases,
    });
  });
}
