const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const path = require('node:path');
const root = path.join(__dirname,'..');
const port = 5007;
const server=spawn(process.execPath,['dist/index.js'],{
  cwd:root,
  env:{...process.env,PORT:String(port),NODE_ENV:'production',SERVE_FRONTEND:'false',FRONTEND_URL:'http://127.0.0.1:'+port},
  stdio:['ignore','pipe','pipe'],
});
server.stdout.on('data',data=>process.stdout.write('[fullstack] '+data));
server.stderr.on('data',data=>process.stderr.write('[fullstack] '+data));
async function waitForRoot(){
  for(let i=0;i<70;i++){
    if(server.exitCode!==null)throw new Error('Full-stack server exited early');
    try{
      const response=await fetch('http://127.0.0.1:'+port+'/',{redirect:'manual'});
      if(response.status===200)return response;
    }catch{}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  throw new Error('Frontend root never became available');
}
(async()=>{
 try{
  const rootResponse=await waitForRoot();
  const html=await rootResponse.text();
  assert.match(rootResponse.headers.get('content-type')||'',/text\/html/);
  assert.match(html,/<div id="root">/);
  const route=await fetch('http://127.0.0.1:'+port+'/dashboard');
  assert.equal(route.status,200);
  assert.match(await route.text(),/<div id="root">/);
  const health=await fetch('http://127.0.0.1:'+port+'/api/health');
  assert.equal(health.status,200);
  const info=await health.json();
  assert.equal(info.status,'ok');
  console.log('Full-stack deployment test passed: / and /dashboard serve React, /api/health serves API.');
 } finally {server.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;server.kill('SIGTERM');});
