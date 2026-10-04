'use strict';
const KEY='campus-relay-v1';
const TARGETS=[20,80,170,280,380,450,500];
const CHANNEL_TARGET={campus:360,club:80,peer:60,direct:0};
const CHANNEL_NAME={campus:'Champion groups',club:'Clubs / placement cells',peer:'Peer referrals',direct:'Unattributed / direct'};
const CHAMPIONS=Array.from({length:20},(_,i)=>({code:`C${String(i+1).padStart(2,'0')}`,college:`Demo College ${String(Math.floor(i/2)+1).padStart(2,'0')}`,name:`Champion ${i+1}`}));
const PARTNERS=Array.from({length:4},(_,i)=>({code:`CLUB0${i+1}`,college:`Distinct partner list ${i+1}`,name:`Club / placement cell ${i+1}`}));
function seed(){return {day:3,leads:Array.from({length:160},(_,i)=>{const channel=i<120?'campus':i<145?'club':'peer';return {id:`seed-${i}`,name:`Sample Student ${i+1}`,email:`student${i+1}@example.com`,college:CHAMPIONS[i%20].college,channel,source:channel==='campus'?CHAMPIONS[i%20].code:channel==='club'?PARTNERS[i%4].code:`R${String(i-144).padStart(4,'0')}`,code:`R${String(i+1).padStart(4,'0')}`,day:i<20?1:i<75?2:3,reminders:false,createdAt:'synthetic'};})};}
function normalizeEmail(email){return String(email).trim().toLowerCase();}
function resolveSource(code,state){code=String(code||'').trim().toUpperCase();if(!code)return {channel:'direct',source:'DIRECT'};if(CHAMPIONS.some(c=>c.code===code))return {channel:'campus',source:code};if(PARTNERS.some(c=>c.code===code))return {channel:'club',source:code};if(state.leads.some(l=>l.code===code))return {channel:'peer',source:code};throw new Error('That referral code is not in this demo. Use C01, CLUB01, or a code from a registered sample student.');}
function addRegistration(state,input){const name=String(input.name||'').trim(),email=normalizeEmail(input.email),college=String(input.college||'').trim();if(!name||name.length>70||!college||college.length>100||email.length>150||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a name, college and valid sample email.');if(!input.eligible||!input.consent)throw new Error('Confirm final-year eligibility and sample-data consent.');const existing=state.leads.find(l=>l.email===email);if(existing)return {duplicate:true,lead:existing};const source=resolveSource(input.code,state);let n=state.leads.length+1;while(state.leads.some(l=>l.code===`R${String(n).padStart(4,'0')}`))n++;const lead={id:`sample-${n}`,name,email,college,...source,code:`R${String(n).padStart(4,'0')}`,day:Number(state.day),reminders:!!input.reminders,createdAt:new Date().toISOString()};state.leads.push(lead);return {duplicate:false,lead};}
function forecast(inputs){const rows=['campus','club','peer'].map(k=>({channel:k,value:inputs[k].reach*inputs[k].click/100*inputs[k].register/100}));const gross=rows.reduce((n,r)=>n+r.value,0),net=Math.floor(gross*(1-inputs.overlap/100));const perGroup=150*inputs.campus.click/100*inputs.campus.register/100*(1-inputs.overlap/100);return {rows,gross,net,gap:Math.max(0,500-net),extraGroups:perGroup>0?Math.ceil(Math.max(0,500-net)/perGroup):null};}
function csvCell(v){v=String(v??'');if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';}
if(typeof module!=='undefined'&&module.exports)module.exports={seed,normalizeEmail,resolveSource,addRegistration,forecast,csvCell,TARGETS};

// Visual redesign; the original registration and attribution helpers above are retained.
const MODEL_KEY = 'campus-relay-model-v2';
const CHANNELS = [
  {key:'campus',name:'Campus clubs',color:'#ff6448',description:'Give club leads a ready-to-post invite + a leaderboard.',yield:1.2},
  {key:'whatsapp',name:'WhatsApp circles',color:'#bddcfe',description:'Peer-to-peer sharing converts better when the first project feels doable.',yield:1.1},
  {key:'creator',name:'Creator collabs',color:'#f6d451',description:'Micro-creators make the workshop feel current, not like another webinar.',yield:.8},
  {key:'paid',name:'₹2k paid test',color:'#bde8c3',description:'Only scale the ad set after the first 48-hour message test wins.',yield:.5}
];
function defaultModel(){return {budget:2000,mix:{campus:38,whatsapp:29,creator:19,paid:14}};}
function normalizeModel(input){
  const defaults=defaultModel();
  const clamp=(value,fallback,max)=>Number.isFinite(Number(value))&&value!==null?Math.max(0,Math.min(max,Number(value))):fallback;
  return {budget:Math.round(clamp(input?.budget,defaults.budget,5000)/100)*100,mix:Object.fromEntries(CHANNELS.map(c=>[c.key,clamp(input?.mix?.[c.key],defaults.mix[c.key],100)]))};
}
function projectModel(input){
  const model=normalizeModel(input),sum=Object.values(model.mix).reduce((a,b)=>a+b,0);
  const weights=CHANNELS.map(c=>sum?model.mix[c.key]/sum:0);
  const baseline=.38*1.2+.29*1.1+.19*.8+.14*.5;
  const efficiency=weights.reduce((n,w,i)=>n+w*CHANNELS[i].yield,0);
  const total=Math.round(model.budget/4*efficiency/baseline);
  // Largest-remainder allocation keeps the displayed channel counts equal to the total.
  const raw=weights.map(w=>total*w),allocated=raw.map(Math.floor);
  const order=raw.map((n,i)=>({i,remainder:n-allocated[i]})).sort((a,b)=>b.remainder-a.remainder);
  const remainder=total-allocated.reduce((a,b)=>a+b,0);
  for(let n=0;n<remainder;n++)allocated[order[n].i]++;
  return {total,weights,allocated,empty:sum===0};
}
function previewSeed(){
  const state=seed();state.day=4;
  for(let i=160;i<270;i++){
    const channel=i%5<3?'campus':i%5===3?'club':'peer';
    state.leads.push({id:`seed-${i}`,name:`Sample Student ${i+1}`,email:`student${i+1}@example.com`,college:CHAMPIONS[i%20].college,channel,source:channel==='campus'?CHAMPIONS[i%20].code:channel==='club'?PARTNERS[i%4].code:'R0001',code:`R${String(i+1).padStart(4,'0')}`,day:4,reminders:false,createdAt:'synthetic'});
  }
  return state;
}
if(typeof module!=='undefined'&&module.exports)Object.assign(module.exports,{defaultModel,normalizeModel,projectModel,previewSeed});

if(typeof document!=='undefined'){
  const $=id=>document.getElementById(id);
  const all=selector=>document.querySelectorAll(selector);
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const currency=value=>'₹'+Number(value).toLocaleString('en-IN');
  let storageWorks=true,toastTimer,activeMode='brief',projectIndex=0;
  function read(key,fallback,validate){
    try{const data=JSON.parse(localStorage.getItem(key));return data&&(!validate||validate(data))?data:fallback();}
    catch{storageWorks=false;return fallback();}
  }
  const validCampaign=s=>Array.isArray(s.leads)&&Number.isInteger(s.day)&&s.day>=1&&s.day<=7&&s.leads.every(l=>l&&typeof l.email==='string'&&typeof l.code==='string'&&typeof l.name==='string'&&typeof l.college==='string'&&['campus','club','peer','direct'].includes(l.channel));
  let state=read(KEY,previewSeed,validCampaign);
  let savedModel=normalizeModel(read(MODEL_KEY,defaultModel));
  let model=normalizeModel(savedModel);
  function storageStatus(){
    all('[data-storage-label]').forEach(el=>el.textContent=storageWorks?'Saved on this device':'Session only');
    $('storage-status').textContent=storageWorks?'Data is saved in this browser only. Workshop schedule to be confirmed.':'Browser storage is unavailable. Changes last for this open session.';
    all('.connection .pulse').forEach(el=>el.style.background=storageWorks?'#58a974':'#dcb64a');
  }
  function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value));storageWorks=true;storageStatus();return true;}catch{storageWorks=false;storageStatus();return false;}}
  function toast(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.add('visible');toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200);}
  function renderRegistrations(){
    const count=state.leads.length,percent=Math.round(count/500*100);
    all('[data-registration-count]').forEach(el=>el.textContent=count.toLocaleString('en-IN'));
    all('[data-progress-percent]').forEach(el=>el.textContent=percent+'%');
    all('[data-progress-bar]').forEach(el=>el.style.width=Math.min(percent,100)+'%');
    all('[data-remaining]').forEach(el=>el.textContent=count>=500?'Goal reached':`${500-count} still to go`);
    all('[data-target-caption]').forEach(el=>el.textContent=percent+'% of target');
    $('campaign-day').value=state.day;
    $('tracked-channels').textContent=new Set(state.leads.map(l=>l.channel)).size;
    storageStatus();
  }
  function loadModelControls(){
    $('budget').value=model.budget;
    CHANNELS.forEach(c=>$('mix-'+c.key).value=model.mix[c.key]);
  }
  function renderModel(){
    const projection=projectModel(model);
    $('budget-value').textContent=currency(model.budget);
    $('budget').style.setProperty('--range',model.budget/50+'%');
    CHANNELS.forEach((c,i)=>{
      $('mix-'+c.key+'-value').textContent=Math.round(projection.weights[i]*100)+'%';
      $('mix-'+c.key).style.setProperty('--range',model.mix[c.key]+'%');
    });
    $('projected').textContent=projection.total.toLocaleString('en-IN');
    $('channels').innerHTML=CHANNELS.map((c,i)=>`<div class="channel-row"><span class="channel-dot" style="background:${c.color}" aria-hidden="true"></span><div class="channel-info"><h3>${c.name}</h3><p>${c.description}</p></div><div class="channel-bar" aria-hidden="true"><i style="width:${projection.total?projection.allocated[i]/projection.total*100:0}%"></i></div><strong class="channel-number">${projection.allocated[i]}</strong></div>`).join('');
    $('active-budget').textContent=currency(savedModel.budget);
    const dirty=JSON.stringify(model)!==JSON.stringify(savedModel);
    $('save-model').classList.toggle('unsaved',dirty);
    $('save-model').title=dirty?'Save this scenario to the campaign model':'Save the current scenario';
    $('model-note').textContent=projection.empty?'Choose at least one channel to build a forecast.':model.budget>2000?'This scenario exceeds the ₹2,000 brief. Forecasts use assumed channel yields, not measured results.':'Illustrative forecast: ₹4 per registration at the starting mix. Channel weights are normalized to 100%.';
    $('model-note').classList.toggle('over-budget',model.budget>2000);
  }
  function setMode(mode,updateHistory=true){
    activeMode=mode==='preview'?'preview':'brief';
    $('brief-view').hidden=activeMode!=='brief';$('preview-view').hidden=activeMode!=='preview';
    all('.mode-switch button').forEach(button=>{const selected=button.dataset.mode===activeMode;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
    all('.main-nav a').forEach(a=>{if(activeMode==='preview')a.classList.remove('active');});
    if(updateHistory){location.hash=activeMode==='preview'?'preview':'overview';}
  }
  function navigateHash(){
    const id=location.hash.slice(1),isPreview=['preview','register'].includes(id);
    setMode(isPreview?'preview':'brief',false);
    const target=isPreview?$('preview'):$(id)||$('overview');
    requestAnimationFrame(()=>{
      if(isPreview||!id||id==='overview')window.scrollTo({top:0,behavior:'instant'});
      else target.scrollIntoView({behavior:'instant',block:'start'});
    });
    if(id==='register'&&!$('registration-dialog').open)$('registration-dialog').showModal();
  }
  all('[data-mode]').forEach(button=>button.addEventListener('click',()=>{
    const wanted=button.dataset.mode;
    if(activeMode===wanted){window.scrollTo({top:0,behavior:'smooth'});return;}
    setMode(wanted);window.scrollTo({top:0,behavior:'instant'});
  }));
  all('.main-nav a,.brand[href="#overview"]').forEach(link=>link.addEventListener('click',()=>setMode('brief',false)));
  window.addEventListener('hashchange',navigateHash);
  const sections=['overview','thinking','growth-loop','analytics','success'];
  const observer=new IntersectionObserver(entries=>{
    if(activeMode!=='brief')return;
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    if(!visible.length)return;
    const id=visible[0].target.id==='success'?'analytics':visible[0].target.id;
    all('.main-nav a').forEach(a=>{a.classList.toggle('active',a.dataset.section===id);if(a.dataset.section===id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  },{rootMargin:'-120px 0px -45% 0px',threshold:0});
  sections.forEach(id=>observer.observe($(id)));
  all('[data-register]').forEach(button=>button.addEventListener('click',()=>$('registration-dialog').showModal()));
  all('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  all('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{
    const r=dialog.getBoundingClientRect();
    if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();
  }));
  async function copy(text,field){
    try{await navigator.clipboard.writeText(text);toast('Copied. Ready when you are.');}
    catch{if(field){field.focus();field.select();}toast('Select the text and copy it with Ctrl+C.');}
  }
  function studentLink(code){const url=new URL(location.href);url.search='';url.searchParams.set('ref',code);url.hash='register';return url.href;}
  $('registration-form').addEventListener('submit',event=>{
    event.preventDefault();const data=new FormData(event.target);
    try{
      const result=addRegistration(state,{name:data.get('name'),email:data.get('email'),college:data.get('college'),code:data.get('code'),eligible:data.has('eligible'),consent:data.has('consent')});
      persist(KEY,state);renderRegistrations();
      $('form-result').innerHTML=`<div class="form-success"><strong>${result.duplicate?'You already have a sample seat.':'Your sample seat is saved.'}</strong><p>${result.duplicate?'Your original referral source is preserved.':'One project. One clear next step.'} Your referral code: <b>${esc(result.lead.code)}</b></p><label>Invite a classmate<input id="personal-link" readonly value="${esc(studentLink(result.lead.code))}"></label><button class="button outline-button" id="copy-referral" type="button">Copy referral link ↗</button><p>${storageWorks?'Saved in this browser only.':'Storage unavailable: saved for this session only.'} No real registration or message is sent.</p></div>`;
      $('copy-referral').addEventListener('click',()=>copy(studentLink(result.lead.code),$('personal-link')));
      $('form-result').scrollIntoView({block:'nearest',behavior:'smooth'});
    }catch(error){$('form-result').innerHTML=`<div class="form-error">${esc(error.message)}</div>`;}
  });
  $('registration-form').addEventListener('input',()=>{if($('form-result').querySelector('.form-success'))$('form-result').innerHTML='';});
  all('.scenario-card input[type="range"]').forEach(input=>input.addEventListener('input',()=>{
    model.budget=Number($('budget').value);CHANNELS.forEach(c=>model.mix[c.key]=Number($('mix-'+c.key).value));renderModel();
  }));
  $('save-model').addEventListener('click',()=>{
    savedModel=normalizeModel(model);const saved=persist(MODEL_KEY,savedModel);renderModel();toast(saved?'Scenario saved. Your campaign model is updated.':'Scenario applied for this session. Browser storage is unavailable.');
  });
  $('campaign-day').addEventListener('change',()=>{state.day=Number($('campaign-day').value);persist(KEY,state);toast(`Campaign day changed to ${state.day}.`);});
  $('reset').addEventListener('click',()=>$('reset-dialog').showModal());
  $('confirm-reset').addEventListener('click',()=>{
    state=previewSeed();savedModel=defaultModel();model=defaultModel();persist(KEY,state);persist(MODEL_KEY,savedModel);loadModelControls();renderRegistrations();renderModel();$('registration-form').reset();$('form-result').innerHTML='';$('reset-dialog').close();toast('Demo reset to 270 fictional registrations.');
  });
  $('export').addEventListener('click',()=>{
    const columns=['name','email','college','channel','source','code','day','reminders','createdAt'];
    const csv=[columns.map(csvCell).join(','),...state.leads.map(lead=>columns.map(col=>csvCell(lead[col])).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));
    const link=document.createElement('a');link.href=url;link.download='campus-relay-simulation.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Exported sample campaign registrations.');
  });
  $('source-pick').innerHTML=[...CHAMPIONS,...PARTNERS].map(c=>`<option value="${c.code}">${c.code} · ${c.name} · ${c.college}</option>`).join('');
  function updateToolkit(){
    const link=studentLink($('source-pick').value);$('source-link').value=link;
    $('share-message').value=`Final-year engineers: build something real with AI.\n\nA free, 60-minute workshop to turn a blank screen into a small project you can show. Bring a laptop and internet.\n\nSample registration: ${link}\n\nCampaign prototype only. Workshop schedule and tool requirements must be confirmed before sharing a real invitation.`;
  }
  $('source-pick').addEventListener('change',updateToolkit);
  $('open-toolkit').addEventListener('click',()=>{updateToolkit();$('toolkit-dialog').showModal();});
  $('copy-link').addEventListener('click',()=>copy($('source-link').value,$('source-link')));
  $('copy-message').addEventListener('click',()=>copy($('share-message').value,$('share-message')));
  const projects=[{title:'AI career copilot',description:'Made by you · in 60 min'},{title:'AI study helper',description:'Turn a topic into practice questions'},{title:'AI idea explorer',description:'Turn a question into a first prototype'}];
  function changeProject(step){projectIndex=(projectIndex+step+projects.length)%projects.length;$('project-title').textContent=projects[projectIndex].title;$('project-description').textContent=projects[projectIndex].description;$('project-index').textContent=String(projectIndex+1).padStart(2,'0')+' / 03';}
  $('previous-project').addEventListener('click',()=>changeProject(-1));$('next-project').addEventListener('click',()=>changeProject(1));
  const ref=new URLSearchParams(location.search).get('ref');if(ref)$('registration-code').value=ref;
  persist(KEY,state);loadModelControls();renderRegistrations();renderModel();updateToolkit();
  if(location.hash)navigateHash();
  else if(ref){setMode('preview');$('registration-dialog').showModal();}
}
