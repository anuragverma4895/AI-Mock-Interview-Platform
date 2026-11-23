/* Runs only the user's own JavaScript locally in a disposable browser worker.
 * Never execute these submissions inside the Node/Express server process.
 */
type TestCase = { input: string; expectedOutput: string };
type RunRequest = { code: string; functionName: string; title: string; cases: TestCase[] };
type Result = { passed: boolean; input: string; expected: string; actual: string };

function parseArgs(input: string): unknown[] {
  const cleaned = input.trim().replace(/(^|,)\s*[a-zA-Z_$][\w$]*\s*=\s*/g, '$1');
  return JSON.parse('[' + cleaned + ']') as unknown[];
}

function formatted(value: unknown): string {
  if (value === undefined) return 'undefined';
  try { return JSON.stringify(value) ?? String(value); }
  catch { return String(value); }
}

function canonical(value: unknown, title: string): unknown {
  if (!Array.isArray(value)) return value;
  if (/group anagrams/i.test(title)) {
    return value.map(group => Array.isArray(group) ? [...group].sort() : group)
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  }
  if (/intersection of two arrays/i.test(title)) return [...value].sort();
  return value;
}

function equivalent(actual: unknown, expectedText: string, title: string): boolean {
  let expected: unknown;
  try { expected = JSON.parse(expectedText); } catch { expected = expectedText.trim(); }
  return JSON.stringify(canonical(actual, title)) === JSON.stringify(canonical(expected, title));
}

function serializeList(head: any): unknown {
  const result: unknown[] = [];
  const seen = new Set<unknown>();
  let current = head;
  while (current && typeof current === 'object' && 'val' in current && result.length < 1000 && !seen.has(current)) {
    seen.add(current);
    result.push(current.val);
    current = current.next;
  }
  return result;
}

function toList(values: unknown): unknown {
  if (!Array.isArray(values)) return values;
  let head: any = null;
  for (let i = values.length - 1; i >= 0; i--) head = { val: values[i], next: head };
  return head;
}

self.onmessage = (event: MessageEvent<RunRequest>) => {
  const { code, functionName, title, cases } = event.data;
  const results: Result[] = [];
  try {
    if (!/^[A-Za-z_$][\w$]*$/.test(functionName)) throw new Error('Invalid function name.');
    // Dynamic evaluation is strictly limited to this browser worker, never the server.
    // It has no access to the page DOM or its localStorage, and is terminated on timeout.
    const factory = new Function(code + '\nreturn typeof ' + functionName + ' === "function" ? ' + functionName + ' : null;');
    const fn = factory() as (...args: unknown[]) => unknown;
    if (typeof fn !== 'function') throw new Error('Function ' + functionName + ' was not found. Check the function name.');

    for (const tc of cases) {
      try {
        const args = parseArgs(tc.input);
        const isList = /linked list|merge two sorted lists|remove nth node/i.test(title);
        const callArgs = isList ? args.map(arg => toList(arg)) : args;
        let actual = fn(...callArgs);
        if (actual === undefined) actual = callArgs[0]; // In-place exercises
        if (isList && actual && typeof actual === 'object' && 'val' in actual) actual = serializeList(actual);
        results.push({
          passed: equivalent(actual, tc.expectedOutput, title),
          input: tc.input,
          expected: tc.expectedOutput,
          actual: formatted(actual).slice(0, 2048),
        });
      } catch (err) {
        results.push({
          passed: false,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: 'Error: ' + (err instanceof Error ? err.message : String(err)),
        });
      }
    }
    self.postMessage({ results });
  } catch (err) {
    self.postMessage({ error: err instanceof Error ? err.message : String(err) });
  }
};
