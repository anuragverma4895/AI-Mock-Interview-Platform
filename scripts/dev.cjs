const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const processes = ['backend', 'frontend'].map(name => {
  const child = spawn('npm', ['run', 'dev'], {
    cwd: path.join(root, name),
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  child.on('error', error => console.error(name + ' failed to start:', error));
  return child;
});
let stopping = false;
const stop = () => {
  if (stopping) return;
  stopping = true;
  for (const child of processes) if (!child.killed) child.kill('SIGINT');
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
processes.forEach(child => child.on('exit', (code) => {
  if (!stopping && code !== 0) {
    console.error('A development server exited unexpectedly with code:', code);
    stop();
    process.exitCode = code || 1;
  }
}));
