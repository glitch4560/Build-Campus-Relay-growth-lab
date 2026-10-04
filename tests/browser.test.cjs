const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root=path.resolve(__dirname,'..');
const {projectModel,defaultModel,previewSeed}=require('../app.js');
const artifacts=path.join(root,'tmp','redesign-review');
fs.mkdirSync(artifacts,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
  fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(err?'Not found':data);});
});
async function main(){
  assert.equal(previewSeed().leads.length,270);
  const base=projectModel(defaultModel());assert.equal(base.total,500);assert.equal(base.allocated.reduce((a,b)=>a+b,0),500);
  assert.equal(projectModel({budget:2400,mix:defaultModel().mix}).total,600);
  assert.equal(projectModel({budget:0,mix:defaultModel().mix}).total,0);
  assert.equal(projectModel({budget:2000,mix:{campus:0,whatsapp:0,creator:0,paid:0}}).total,0);
  assert.ok(projectModel({budget:2000,mix:{campus:100,whatsapp:0,creator:0,paid:0}}).total>500);
  for(let i=0;i<100;i++){const model={budget:i*50,mix:{campus:i,whatsapp:100-i,creator:i%17,paid:i%11}};const p=projectModel(model);assert.equal(p.allocated.reduce((a,b)=>a+b,0),p.total);}
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const origin='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),args:['--disable-gpu']});
  const context=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin);await page.waitForFunction(()=>document.querySelector('#channels').children.length===4);
  await page.screenshot({path:path.join(artifacts,'desktop-brief.png'),fullPage:true});
  await page.screenshot({path:path.join(artifacts,'desktop-overview.png')});
  assert.equal(await page.locator('[data-registration-count]').first().textContent(),'270');
  assert.ok(await page.locator('.opportunity-photo img').evaluate(img=>img.complete&&img.naturalWidth>0));
  await page.locator('#budget').fill('2400');await page.locator('#budget').dispatchEvent('input');
  assert.equal(await page.locator('#projected').textContent(),'600');
  await page.locator('#save-model').click();await page.reload();
  assert.equal(await page.locator('#budget').inputValue(),'2400');assert.equal(await page.locator('#active-budget').textContent(),'₹2,400');
  await page.locator('.mode-switch [data-mode="preview"]').click();
  assert.ok(await page.locator('#preview-view').isVisible());assert.ok(!await page.locator('#brief-view').isVisible());
  await page.waitForFunction(()=>window.scrollY===0);
  await page.screenshot({path:path.join(artifacts,'desktop-preview.png'),fullPage:true});
  await page.screenshot({path:path.join(artifacts,'desktop-student-top.png')});
  await page.locator('#next-project').click();assert.equal(await page.locator('#project-title').textContent(),'AI study helper');
  await page.locator('[data-register]').click();
  await page.locator('[name="name"]').fill('Test Builder');await page.locator('[name="email"]').fill('builder@example.com');await page.locator('[name="college"]').fill('Demo College');await page.locator('[name="code"]').fill('C01');await page.locator('[name="eligible"]').check();await page.locator('[name="consent"]').check();await page.locator('.form-submit').click();
  assert.equal(await page.locator('[data-registration-count]').first().textContent(),'271');assert.ok((await page.locator('#form-result').textContent()).includes('R0271'));
  await page.screenshot({path:path.join(artifacts,'registration.png')});
  await page.locator('[name="code"]').fill('CLUB01');await page.locator('.form-submit').click();
  assert.equal(await page.locator('[data-registration-count]').first().textContent(),'271');
  assert.ok((await page.locator('#form-result').textContent()).includes('original referral source'));
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('campus-relay-v1')));assert.equal(state.leads.at(-1).source,'C01');
  await page.locator('#registration-dialog [data-close]').click();await page.reload();
  assert.equal(await page.locator('[data-registration-count]').first().textContent(),'271');
  await page.locator('.mode-switch [data-mode="brief"]').click();await page.locator('#open-toolkit').click();
  assert.ok((await page.locator('#source-link').inputValue()).includes('ref=C01'));await page.locator('#source-pick').selectOption('CLUB01');assert.ok((await page.locator('#source-link').inputValue()).includes('ref=CLUB01'));
  await page.locator('#toolkit-dialog [data-close]').click();
  const downloaded=page.waitForEvent('download');await page.locator('#export').click();assert.equal((await downloaded).suggestedFilename(),'campus-relay-simulation.csv');
  await page.locator('#reset').click();await page.locator('#confirm-reset').click();assert.equal(await page.locator('[data-registration-count]').first().textContent(),'270');assert.equal(await page.locator('#budget').inputValue(),'2000');
  for(const width of [320,390,768,1024,1440,1996]){
    await page.setViewportSize({width,height:1000});await page.goto(origin);await page.waitForFunction(()=>document.querySelector('#channels').children.length===4);
    const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));assert.ok(dimensions.scroll<=dimensions.width+1,`Brief overflows at ${width}: ${JSON.stringify(dimensions)}`);
    if(width===390||width===1996)await page.screenshot({path:path.join(artifacts,`brief-${width}.png`),fullPage:true});
    if(width===1996)await page.screenshot({path:path.join(artifacts,'reference-size-overview.png')});
    await page.locator('.mode-switch [data-mode="preview"]').click();
    const preview=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));assert.ok(preview.scroll<=preview.width+1,`Preview overflows at ${width}: ${JSON.stringify(preview)}`);
    if(width===390)await page.screenshot({path:path.join(artifacts,'preview-390.png'),fullPage:true});
  }
  await page.goto(origin+'/?ref=C02#register');await page.waitForFunction(()=>document.querySelector('#registration-dialog').open);assert.equal(await page.locator('#registration-code').inputValue(),'C02');
  await page.keyboard.press('Escape');assert.ok(!await page.locator('#registration-dialog').isVisible());
  const offline=await browser.newContext();const offlinePage=await offline.newPage();await offlinePage.goto(require('node:url').pathToFileURL(path.join(root,'index.html')).href);await offlinePage.waitForFunction(()=>document.querySelector('#channels').children.length===4);assert.ok(await offlinePage.locator('.opportunity-photo img').evaluate(img=>img.complete&&img.naturalWidth>0));
  const blocked=await browser.newContext({viewport:{width:390,height:844}});await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked');}});});const blockedPage=await blocked.newPage();blockedPage.on('pageerror',error=>errors.push(error.message));await blockedPage.goto(origin);await blockedPage.waitForFunction(()=>document.querySelector('#channels').children.length===4);assert.ok((await blockedPage.locator('#storage-status').textContent()).includes('unavailable'));
  assert.deepEqual(errors,[]);
  await browser.close();server.close();console.log('PASS: desktop/mobile layout, assets, scenario persistence, registration, duplicate attribution, referrals, toolkit, CSV, reset, offline site, blocked-storage fallback, and no browser errors.');
}
main().catch(error=>{console.error(error);server.close();process.exit(1);});
