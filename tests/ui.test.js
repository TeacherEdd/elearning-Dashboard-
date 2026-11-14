import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {INDICATORS} from '../src/core.js';
const REPORTS='wced-district-monitor-ai-v6',SUPPORT='ecked-advisor-support-v1',EQUIPMENT='ecked-school-equipment-v1',DRAFTS='ecked-school-report-drafts-v1';
const tick=(ms=30)=>new Promise(r=>setTimeout(r,ms));
async function setup(values={}){
 const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'https://example.test/elearning-Dashboard-/',runScripts:'dangerously',pretendToBeVisual:true});
 const w=dom.window,NativeDate=w.Date;w.Date=class extends NativeDate{constructor(...a){super(...(a.length?a:['2026-11-14T10:00:00Z']));}static now(){return new NativeDate('2026-11-14T10:00:00Z').getTime();}};w.confirm=()=>true;
 for(const [k,v]of Object.entries(values))w.localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v));
 const asset=readdirSync(new URL('../dist/assets/',import.meta.url)).find(f=>f.endsWith('.js'));w.eval(readFileSync(new URL('../dist/assets/'+asset,import.meta.url),'utf8').replaceAll('import.meta.url',JSON.stringify('https://example.test/elearning-Dashboard-/assets/index.js')));await tick();return dom;
}
const click=(w,name)=>{const b=[...w.document.querySelectorAll('button')].find(b=>b.textContent.trim()===name);assert.ok(b,'button '+name);b.click();};
function change(w,el,value){assert.ok(el,'field exists');const p=el.tagName==='SELECT'?w.HTMLSelectElement.prototype:el.tagName==='TEXTAREA'?w.HTMLTextAreaElement.prototype:w.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(p,'value').set.call(el,value);el.dispatchEvent(new w.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));}
const input=(w,label)=>w.document.querySelector('[aria-label="'+label+'"]');
const scores=n=>Object.fromEntries(INDICATORS.map(k=>[k,n]));
const report=(extra={})=>({id:'report-1',school:'HEIDEDAL PRIM',circuit:'Circuit 8',date:'2026-11-13',staff:'Principal',designation:'Principal',advisor:'Advisor',notes:'Observed classroom use',scores:scores(4),...extra});
const openSchool=async(w)=>{click(w,'Schools');await tick();change(w,input(w,'Search schools'),'HEIDEDAL');await tick();click(w,'HEIDEDAL PRIM');await tick();};
const backups=async(w)=>{click(w,'Reports');await tick();click(w,'Backups');await tick();};
const restore=async(w,data)=>{const el=input(w,'Restore backup');Object.defineProperty(el,'files',{configurable:true,value:[{size:100,text:async()=>JSON.stringify(data)}]});el.dispatchEvent(new w.Event('change',{bubbles:true}));await tick();};
async function blobText(w,button){let blob;w.URL.createObjectURL=b=>{blob=b;return 'blob:test';};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};click(w,button);await tick();return await new Promise(resolve=>{const r=new w.FileReader();r.onload=()=>resolve(r.result);r.readAsText(blob);});}
test('approved shell has ECKED logo, four reporting routes and no visit-planning controls',async()=>{
 const dom=await setup(),w=dom.window,d=w.document;assert.match(d.body.textContent,/School findings at a glance/);assert.equal(d.querySelectorAll('nav[aria-label="Main navigation"] button').length,4);assert.ok(d.querySelector('img[alt="Eden and Central Karoo Education District"]'));assert.doesNotMatch(d.body.textContent,/Overdue|Support planner|Upcoming visits/);
 click(w,'Capture findings');await tick();click(w,'2. Findings');await tick();assert.equal(d.querySelectorAll('select[aria-label$=" rating"]').length,11);assert.doesNotMatch(d.body.textContent,/LMS Usage at School/);dom.window.close();
});
test('legacy twelve-score record retains LMS value in storage but reports use eleven correctly mapped indicators',async()=>{
 const legacy=report({scores:{...scores(4),'teaching-1':1,'teaching-2':5}}),dom=await setup({[REPORTS]:[legacy]}),w=dom.window;
 await openSchool(w);assert.match(w.document.body.textContent,/4.1 \/5/);click(w,'Assessment findings');await tick();assert.match(w.document.body.textContent,/4.3 \/5/);click(w,'Open full report');await tick();assert.doesNotMatch(w.document.body.textContent,/LMS Usage at School/);assert.equal(JSON.parse(w.localStorage.getItem(REPORTS))[0].scores['teaching-1'],1);dom.window.close();
});
test('partial findings save as draft, reload, and do not create a final school rating',async()=>{
 const dom=await setup(),w=dom.window;click(w,'Capture findings');await tick();change(w,input(w,'Education circuit'),'Circuit 8');await tick();change(w,input(w,'School'),'HEIDEDAL PRIM');change(w,input(w,'Person consulted'),'ICT Champion');click(w,'2. Findings');await tick();change(w,input(w,'Connectivity Quality rating'),'3');click(w,'Save draft');await tick();
 const drafts=JSON.parse(w.localStorage.getItem(DRAFTS));assert.equal(drafts.length,1);assert.equal(w.localStorage.getItem(REPORTS),null);
 const restored=await setup({[DRAFTS]:drafts}),r=restored.window;click(r,'Reports');await tick();click(r,'Drafts');await tick();click(r,'Continue draft');await tick();assert.equal(input(r,'School').value,'HEIDEDAL PRIM');click(r,'2. Findings');await tick();assert.equal(input(r,'Connectivity Quality rating').value,'3');dom.window.close();restored.window.close();
});
test('capture workflow finalises eleven-indicator findings with the information source',async()=>{
 const dom=await setup(),w=dom.window;click(w,'Capture findings');await tick();change(w,input(w,'Education circuit'),'Circuit 8');await tick();change(w,input(w,'School'),'HEIDEDAL PRIM');change(w,input(w,'Person consulted'),'ICT Champion');change(w,input(w,'Designation'),'ICT Champion');change(w,input(w,'Information source'),'Staff reported');click(w,'Next →');await tick();
 for(const el of w.document.querySelectorAll('select[aria-label$=" rating"]'))change(w,el,'4');change(w,input(w,'Evidence and observations'),'Teachers demonstrated digital resources.');await tick();click(w,'Save draft');await tick();click(w,'5. Review');await tick();click(w,'Finalise report');await tick(550);
 const records=JSON.parse(w.localStorage.getItem(REPORTS));assert.equal(records.length,1);assert.equal(Object.keys(records[0].scores).length,11);assert.equal(records[0].informationSource,'Staff reported');assert.equal(JSON.parse(w.localStorage.getItem(DRAFTS)).length,0);assert.match(w.document.body.textContent,/Final school reports/);dom.window.close();
});
test('equipment capture and management export survive the reporting redesign',async()=>{
 const dom=await setup(),w=dom.window;await openSchool(w);click(w,'Equipment');await tick();click(w,'Capture equipment');await tick();change(w,input(w,'Equipment information source'),'ICT Champion reported');for(const [k,n]of Object.entries({total:20,working:18,faulty:1,awaitingRepair:1}))change(w,input(w,'Tablets '+k),String(n));change(w,input(w,'Smart classrooms installed'),'Yes');await tick();change(w,input(w,'Smart classrooms total'),'2');change(w,input(w,'Smart classrooms functional'),'1');await tick();click(w,'Save equipment snapshot');await tick();assert.equal(JSON.parse(w.localStorage.getItem(EQUIPMENT))[0].devices.tablets.total,20);
 click(w,'Reports');await tick();click(w,'Management summary');await tick();change(w,input(w,'Advisor management commentary'),'Equipment findings for manager');await tick();const html=await blobText(w,'Download manager report');assert.match(html,/18 \/ 20 working/);assert.match(html,/Equipment findings for manager/);assert.doesNotMatch(html,/Outstanding follow-ups/);dom.window.close();
});
test('training recommendations are recorded as advice without creating a visit schedule',async()=>{
 const r=report({scores:{...scores(4),'teaching-3':1}}),dom=await setup({[REPORTS]:[r]}),w=dom.window;await openSchool(w);click(w,'Recommendations');await tick();click(w,'Record training recommendation');await tick();const logs=JSON.parse(w.localStorage.getItem(SUPPORT));assert.equal(logs.length,1);assert.equal(logs[0].dueDate,'');assert.equal(logs[0].training.attendance,'Not confirmed');assert.match(w.document.body.textContent,/Recorded recommendations/);dom.window.close();
});
test('backups include drafts and preserve old records; invalid restore leaves data intact',async()=>{
 const dom=await setup({[REPORTS]:[report()]}),w=dom.window;await backups(w);const raw=await blobText(w,'Export backup'),backup=JSON.parse(raw);assert.equal(backup.version,4);assert.deepEqual(backup.drafts,[]);
 const original=w.localStorage.getItem(REPORTS);await restore(w,{...backup,drafts:[{id:'bad'}]});assert.equal(w.localStorage.getItem(REPORTS),original);assert.match(w.document.body.textContent,/Import failed/);await restore(w,{version:1,reports:[]});assert.equal(JSON.parse(w.localStorage.getItem(REPORTS)).length,1);dom.window.close();
});
test('corrupt stored reports remain untouched and show a recovery message',async()=>{const dom=await setup({[REPORTS]:'invalid JSON'});assert.match(dom.window.document.body.textContent,/Stored reports could not be read/);assert.equal(dom.window.localStorage.getItem(REPORTS),'invalid JSON');dom.window.close();});
