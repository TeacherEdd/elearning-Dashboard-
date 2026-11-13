import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const tick = () => new Promise(resolve=>setTimeout(resolve,30));
const bundle = () => readFileSync(new URL('../dist/assets/'+readdirSync(new URL('../dist/assets/',import.meta.url)).find(n=>n.endsWith('.js')),import.meta.url),'utf8');
async function setup(storage,support,equipment) {
 const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'https://example.test/elearning-maturity/',runScripts:'dangerously',pretendToBeVisual:true});
 dom.window.confirm=()=>true;
 if(equipment!==undefined) dom.window.localStorage.setItem('ecked-school-equipment-v1',JSON.stringify(equipment));
 if(support!==undefined) dom.window.localStorage.setItem('ecked-advisor-support-v1',JSON.stringify(support));
 if(storage!==undefined) dom.window.localStorage.setItem('wced-district-monitor-ai-v6',storage);
 dom.window.eval(bundle());
 await tick();return dom;
}
const click=(win,name)=>{const el=[...win.document.querySelectorAll('button')].find(b=>b.textContent.trim()===name);assert.ok(el,'button '+name);el.click();};
function change(win,el,value) {const proto=el.tagName==='SELECT'?win.HTMLSelectElement.prototype:win.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new win.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));}
test('empty dashboard, complete assessment, save, reload and delete last report',async()=>{
 const dom=await setup();const w=dom.window;const d=w.document;
 assert.match(d.body.textContent,/School Monitoring Dashboard/);
 assert.match(d.body.textContent,/Not yet assessed/);
 click(w,'New Audit');await tick();
 change(w,d.querySelectorAll('select')[0],'Circuit 8');await tick();
 change(w,d.querySelectorAll('select')[1],'HEIDEDAL PRIM');
 change(w,d.querySelector('input[placeholder="e.g. Mr. S. Jacobs"]'),'Test Principal');
 const inputs=[...d.querySelectorAll('input')];
 const role=inputs.find(x=>x.placeholder?.includes('Principal /')) || inputs.find(x=>x.placeholder?.includes('ICT'));
 assert.ok(role,'designation field');change(w,role,'Principal');
 for (const button of [...d.querySelectorAll('button')].filter(b=>b.textContent.trim()==='3')) button.click();
 await tick();
 const save=[...d.querySelectorAll('button')].find(b=>b.textContent.includes('Save'));
 assert.ok(save && !save.disabled,'complete form can save');save.click();await tick();
 const raw=w.localStorage.getItem('wced-district-monitor-ai-v6');
 assert.equal(JSON.parse(raw).length,1);
 const restored=await setup(raw);assert.match(restored.window.document.body.textContent,/School Monitoring Dashboard/);
 click(restored.window,'School profiles');await tick();click(restored.window,'HEIDEDAL PRIM');await tick();restored.window.document.querySelector('button[title="Delete"]').click();await tick();
 assert.deepEqual(JSON.parse(restored.window.localStorage.getItem('wced-district-monitor-ai-v6')),[]);
 const empty=await setup('[]');assert.match(empty.window.document.body.textContent,/No assessments yet/);
 dom.window.close();restored.window.close();empty.window.close();
});
test('corrupt stored data remains intact and shows recovery message',async()=>{
 const dom=await setup('invalid JSON');
 assert.match(dom.window.document.body.textContent,/Stored reports could not be read/);
 assert.equal(dom.window.localStorage.getItem('wced-district-monitor-ai-v6'),'invalid JSON');
 dom.window.close();
});

test('school profile distinguishes no assessment from low maturity and preselects assessment school',async()=>{
 const dom=await setup();const w=dom.window;
 click(w,'School profiles');await tick();
 change(w,w.document.querySelector('[aria-label="Circuit scope"]'),'Circuit 8');await tick();
 click(w,'HEIDEDAL PRIM');await tick();
 assert.match(w.document.body.textContent,/No assessment recorded/);assert.match(w.document.body.textContent,/No maturity conclusion/);
 click(w,'New assessment for this school');await tick();
 assert.equal(w.document.querySelectorAll('select')[0].value,'Circuit 8');assert.equal(w.document.querySelectorAll('select')[1].value,'HEIDEDAL PRIM');
 dom.window.close();
});
test('support logging persists, completion clears overdue and management report exports',async()=>{
 const dom=await setup();const w=dom.window,d=w.document;
 click(w,'Support & follow-ups');await tick();
 const input=(label)=>d.querySelector('[aria-label="'+label+'"]');
 const setText=(el,value)=>{Object.getOwnPropertyDescriptor(w.HTMLTextAreaElement.prototype,'value').set.call(el,value);el.dispatchEvent(new w.Event('input',{bubbles:true}));};
 change(w,input('Support circuit'),'Circuit 8');await tick();change(w,input('Support school'),'HEIDEDAL PRIM');change(w,input('Support type'),'Training');
 setText(input('Support provided or agreed action'),'Support teacher digital resource creation');change(w,input('Support status'),'In progress');
 change(w,input('Follow-up due'),new Date(Date.now()-86400000).toISOString().slice(0,10));await tick();
 click(w,'Save support record');await tick();
 let records=JSON.parse(w.localStorage.getItem('ecked-advisor-support-v1'));assert.equal(records.length,1);assert.equal(records[0].type,'Training');assert.match(d.body.textContent,/Overdue/);
 click(w,'Edit support');await tick();change(w,input('Support status'),'Completed');await tick();click(w,'Save support record');await tick();
 records=JSON.parse(w.localStorage.getItem('ecked-advisor-support-v1'));assert.equal(records[0].status,'Completed');assert.ok(records[0].completedDate);
 click(w,'Management summary');await tick();assert.match(d.body.textContent,/Coverage at period end/);
 setText(input('Advisor management commentary'),'Manager decision requested');await tick();
 let exported;w.URL.createObjectURL=blob=>{exported=blob;return 'blob:example';};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};
 click(w,'Download manager report');await tick();assert.ok(exported);assert.equal(exported.type,'text/html;charset=utf-8');
 const content=await new Promise(resolve=>{const reader=new w.FileReader();reader.onload=()=>resolve(reader.result);reader.readAsText(exported);});
 assert.match(content,/Manager decision requested/);assert.match(content,/Support teacher digital resource creation/);
 click(w,'My overview');await tick();assert.match(d.body.textContent,/School Monitoring Dashboard/);
 dom.window.close();
});

test('version 2 backup restores support, legacy restore preserves it, and invalid import changes neither collection',async()=>{
 const dom=await setup();const w=dom.window,d=w.document;
 const support={id:'restored-support',school:'HEIDEDAL PRIM',circuit:'Circuit 8',owner:'Advisor',summary:'Check classroom integration',date:'2026-11-01',dueDate:'2026-11-15',type:'Follow-up',status:'Planned',notes:''};
 const restore=async(data)=>{const input=d.querySelector('input[aria-label="Restore backup"]');Object.defineProperty(input,'files',{configurable:true,value:[{size:100,text:async()=>JSON.stringify(data)}]});input.dispatchEvent(new w.Event('change',{bubbles:true}));await tick();};
 await restore({version:2,reports:[],supportLogs:[support]});
 assert.equal(JSON.parse(w.localStorage.getItem('ecked-advisor-support-v1')).length,1);
 await restore({version:1,reports:[]});assert.equal(JSON.parse(w.localStorage.getItem('ecked-advisor-support-v1')).length,1);
 const reportsBefore=w.localStorage.getItem('wced-district-monitor-ai-v6'),supportBefore=w.localStorage.getItem('ecked-advisor-support-v1');
 await restore({version:2,reports:[],supportLogs:[{...support,status:'invalid'}]});
 assert.equal(w.localStorage.getItem('wced-district-monitor-ai-v6'),reportsBefore);assert.equal(w.localStorage.getItem('ecked-advisor-support-v1'),supportBefore);assert.match(d.body.textContent,/Import failed/);
 dom.window.close();
});

test('capture equipment, persist counts and smart classrooms, and include equipment in manager export',async()=>{
 const dom=await setup();const w=dom.window,d=w.document;
 click(w,'School profiles');await tick();click(w,'HEIDEDAL PRIM');await tick();click(w,'Equipment & infrastructure');await tick();assert.match(d.body.textContent,/Equipment not yet captured/);
 click(w,'Capture equipment');await tick();
 const input=label=>d.querySelector('[aria-label="'+label+'"]');
 change(w,input('Equipment information source'),'ICT Champion reported');
 for(const [k,n] of Object.entries({total:20,working:18,faulty:1,awaitingRepair:1}))change(w,input('Tablets '+k),String(n));
 change(w,input('Smart classrooms installed'),'Yes');await tick();change(w,input('Smart classrooms total'),'2');change(w,input('Smart classrooms functional'),'1');change(w,input('Smart classrooms usage'),'Limited use');await tick();
 click(w,'Save equipment snapshot');await tick();
 const records=JSON.parse(w.localStorage.getItem('ecked-school-equipment-v1'));assert.equal(records.length,1);assert.equal(records[0].devices.tablets.working,18);assert.equal(records[0].devices.laptops,null);assert.match(d.body.textContent,/1\/2 functional/);
 click(w,'Equipment register');await tick();assert.match(d.body.textContent,/1 schools with faulty/);
 click(w,'Management summary');await tick();let blob;w.URL.createObjectURL=b=>{blob=b;return 'blob:test';};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};click(w,'Download manager report');await tick();
 const text=await new Promise(resolve=>{const reader=new w.FileReader();reader.onload=()=>resolve(reader.result);reader.readAsText(blob);});assert.match(text,/Equipment and infrastructure/);assert.match(text,/18 \/ 20 working/);
 dom.window.close();
});
test('training recommendation creates a linked support action with independent verification fields',async()=>{
 const scores=Object.fromEntries(['env-0','env-1','env-2','culture-0','culture-1','culture-2','culture-3','teaching-0','teaching-1','teaching-2','teaching-3','teaching-4'].map(k=>[k,k==='teaching-3'?1:4]));
 const dom=await setup(JSON.stringify([{id:'training-report',school:'HEIDEDAL PRIM',circuit:'Circuit 8',date:'2026-11-13',staff:'Principal',designation:'Principal',advisor:'Advisor',scores,notes:''}]));const w=dom.window,d=w.document;
 click(w,'School profiles');await tick();click(w,'HEIDEDAL PRIM');await tick();click(w,'Recommended training');await tick();assert.match(d.body.textContent,/Teacher Content Creation/);assert.match(d.body.textContent,/Schedule snapshot: 2026-11-13/);
 click(w,'Plan training support');await tick();
 const saved=JSON.parse(w.localStorage.getItem('ecked-advisor-support-v1'));assert.equal(saved.length,1);assert.equal(saved[0].training.attendance,'Not confirmed');
 change(w,d.querySelector('[aria-label="Training attendance"]'),'Confirmed');change(w,d.querySelector('[aria-label="Training classroom implementation"]'),'Observed');await tick();click(w,'Save support record');await tick();assert.equal(JSON.parse(w.localStorage.getItem('ecked-advisor-support-v1'))[0].training.implementation,'Observed');
 click(w,'My overview');await tick();assert.match(d.body.textContent,/School Monitoring Dashboard/);dom.window.close();
});
test('version 3 backups include equipment and legacy restore keeps existing equipment',async()=>{
 const equipment={id:'asset-old',school:'HEIDEDAL PRIM',circuit:'Circuit 8',verifiedDate:'2026-11-13',source:'ICT Champion reported',devices:{tablets:{total:10,working:10,faulty:0,awaitingRepair:0}},smart:{present:'No',total:0,functional:0,usage:'Not in use'}};
 const dom=await setup(undefined,undefined,[equipment]);const w=dom.window,d=w.document;let blob;w.URL.createObjectURL=b=>{blob=b;return 'blob:test';};w.URL.revokeObjectURL=()=>{};w.HTMLAnchorElement.prototype.click=()=>{};click(w,'Export backup');await tick();
 const text=await new Promise(resolve=>{const reader=new w.FileReader();reader.onload=()=>resolve(reader.result);reader.readAsText(blob);});const backup=JSON.parse(text);assert.equal(backup.version,3);assert.equal(backup.equipmentRecords.length,1);
 const restore=async(data)=>{const input=d.querySelector('input[aria-label="Restore backup"]');Object.defineProperty(input,'files',{configurable:true,value:[{size:100,text:async()=>JSON.stringify(data)}]});input.dispatchEvent(new w.Event('change',{bubbles:true}));await tick();};
 await restore({version:2,reports:[],supportLogs:[]});assert.equal(JSON.parse(w.localStorage.getItem('ecked-school-equipment-v1')).length,1);
 await restore({...backup,equipmentRecords:[{...equipment,id:'asset-new',verifiedDate:'2026-11-12'}]});assert.equal(JSON.parse(w.localStorage.getItem('ecked-school-equipment-v1')).length,2);
 dom.window.close();
});
