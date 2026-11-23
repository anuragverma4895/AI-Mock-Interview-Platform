/** Comparison is advisory: browser-submitted values can be forged.
 * Never treat this as secure/verified competitive-programming grading.
 */
export function sameCodingOutput(actual: string, expected: string, title: string): boolean {
  const parse = (value: string): unknown => {
    try { return JSON.parse(value); } catch { return value.trim(); }
  };
  const normalize = (value: unknown): unknown => {
    if (!Array.isArray(value)) return value;
    if (/group anagrams/i.test(title)) return value
      .map(group => Array.isArray(group) ? [...group].sort() : group)
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (/intersection of two arrays/i.test(title)) return [...value].sort();
    return value;
  };
  return JSON.stringify(normalize(parse(actual))) === JSON.stringify(normalize(parse(expected)));
}

export function normalizeBrowserResults(
  expectedCases: readonly { input: string; expectedOutput: string }[],
  submittedResults: unknown,
  title: string
): Array<{ passed: boolean; input: string; expected: string; actual: string }> {
  if (!Array.isArray(submittedResults) || submittedResults.length !== expectedCases.length || expectedCases.length > 50) {
    throw new Error('Invalid number of browser test results');
  }
  return expectedCases.map((testCase, index) => {
    const record = submittedResults[index];
    if (!record || typeof record.actual !== 'string' || record.actual.length > 2048) {
      throw new Error('Invalid browser test result');
    }
    return {
      input: testCase.input,
      expected: testCase.expectedOutput,
      actual: record.actual,
      passed: sameCodingOutput(record.actual, testCase.expectedOutput, title),
    };
  });
}
