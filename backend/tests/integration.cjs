const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.join(__dirname, '..');
const server = spawn(process.execPath, ['dist/index.js'], {
  cwd: root,
  env: {
    ...process.env,
    NODE_ENV: 'test',
    PORT: '5005',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/prepverse-ci',
    JWT_SECRET: process.env.JWT_SECRET || 'ci-only-testing-secret-do-not-deploy-123',
    GEMINI_API_KEY: '',
    OPENAI_API_KEY: '',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stdout.on('data', data => process.stdout.write('[server] ' + data));
server.stderr.on('data', data => process.stderr.write('[server] ' + data));

const base = 'http://localhost:5005';
async function request(method, route, payload, token) {
  const res = await fetch(base + route, {
    method,
    headers: {
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
  const raw = await res.text();
  let body;
  try { body = JSON.parse(raw); } catch { body = raw; }
  return { status: res.status, body };
}
async function waitForHealthy() {
  for (let i = 0; i < 75; i++) {
    if (server.exitCode !== null) throw new Error('API server exited');
    try {
      const health = await request('GET', '/api/health');
      if (health.status === 200 && health.body.dbConnected) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  throw new Error('Timed out waiting for API and MongoDB');
}
(async () => {
  try {
    await waitForHealthy();
    const unique = Date.now().toString(36);
    const email1 = 'ci-one-' + unique + '@example.test';
    const email2 = 'ci-two-' + unique + '@example.test';
    const rejectedRole = await request('POST', '/api/auth/register',
      { name: 'Role Escalation', email: 'ci-admin-' + unique + '@example.test', password: 'securePass123', role: 'admin' });
    assert.equal(rejectedRole.status, 400, 'Registration must reject self-assigned admin');

    const u1 = await request('POST', '/api/auth/register',
      { name: 'Candidate One', email: email1, password: 'securePass123' });
    const u2 = await request('POST', '/api/auth/register',
      { name: 'Candidate Two', email: email2, password: 'securePass123' });
    assert.equal(u1.status, 201, JSON.stringify(u1.body));
    assert.equal(u2.status, 201, JSON.stringify(u2.body));
    assert.equal(u1.body.user.role, 'candidate');
    const token1 = u1.body.token, token2 = u2.body.token;

    const start = await request('POST', '/api/interview/start',
      { interviewType: 'technical', difficulty: 'easy', duration: 5 }, token1);
    assert.equal(start.status, 201, JSON.stringify(start.body));
    const id = start.body.interview.id;
    assert.ok(id, 'Interview should have an ID');

    assert.equal((await request('GET', '/api/interview/' + id)).status, 401, 'Anonymous request should fail');
    assert.equal((await request('GET', '/api/interview/' + id, undefined, token2)).status, 403, 'Other account should not read interview');
    assert.equal((await request('GET', '/api/interview/next-question/' + id, undefined, token1)).status, 409, 'Unanswered question cannot be skipped');

    const saved = await request('POST', '/api/interview/submit-answer/' + id,
      { answer: 'I use a hash set for duplicates; each lookup is O(1) average.' }, token1);
    assert.equal(saved.status, 200, JSON.stringify(saved.body));
    assert.equal(saved.body.saved, true);
    assert.equal(saved.body.evaluation, undefined, 'No immediate score is exposed');

    const next = await request('GET', '/api/interview/next-question/' + id, undefined, token1);
    assert.equal(next.status, 200, JSON.stringify(next.body));
    assert.notEqual(next.body.question.question, start.body.interview.currentQuestion.question);

    const finish = await request('POST', '/api/interview/end/' + id,
      { recordingPending: false }, token1);
    assert.equal(finish.status, 200, JSON.stringify(finish.body));
    const pending = await request('GET', '/api/interview/' + id, undefined, token1);
    assert.equal(pending.body.evaluationStatus, 'pending');
    assert.equal(pending.body.recordingStatus, 'none');

    const evaluated = await request('POST', '/api/interview/evaluate/' + id, {}, token1);
    assert.equal(evaluated.status, 200, JSON.stringify(evaluated.body));
    assert.equal(evaluated.body.status, 'completed');

    const result = await request('GET', '/api/interview/' + id, undefined, token1);
    assert.equal(result.status, 200);
    assert.equal(result.body.evaluationStatus, 'completed');
    assert.equal(typeof result.body.finalScore, 'number');
    assert.equal(result.body.questions[0].evaluationSource, 'heuristic');
    assert.ok(Array.isArray(result.body.questions[0].strengths));
    assert.ok(result.body.questions[0].feedback);
    console.log('Integration checks passed: auth, ownership, interview flow, deferred feedback.');
  } finally {
    server.kill('SIGTERM');
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
  server.kill('SIGTERM');
});
