import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const tick = () => new Promise(resolve=>setTimeout(resolve,30));
const bundle = () => readFileSync(new URL('../dist/assets/'+readdirSync(new URL('../dist/assets/',import.meta.url)).find(n=>n.endsWith('.js')),import.meta.url),'utf8');
async function setup(storage) {
 const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'https://example.test/elearning-maturity/',runScripts:'dangerously',pretendToBeVisual:true});
 dom.window.confirm=()=>true;
 if(storage!==undefined) dom.window.localStorage.setItem('wced-district-monitor-ai-v6',storage);
 dom.window.eval(bundle());
 await tick();return dom;
}
const click=(win,name)=>{const el=[...win.document.querySelectorAll('button')].find(b=>b.textContent.trim()===name);assert.ok(el,'button '+name);el.click();};
function change(win,el,value) {const proto=el.tagName==='SELECT'?win.HTMLSelectElement.prototype:win.HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new win.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));}
test('empty dashboard, complete assessment, save, reload and delete last report',async()=>{
 const dom=await setup();const w=dom.window;const d=w.document;
 assert.match(d.body.textContent,/District Overview/);
 assert.doesNotMatch(d.body.textContent,/HEIDEDAL PRIM/);
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
 const restored=await setup(raw);assert.match(restored.window.document.body.textContent,/HEIDEDAL PRIM/);
 restored.window.document.querySelector('button[title="Delete"]').click();await tick();
 assert.deepEqual(JSON.parse(restored.window.localStorage.getItem('wced-district-monitor-ai-v6')),[]);
 const empty=await setup('[]');assert.doesNotMatch(empty.window.document.body.textContent,/HEIDEDAL PRIM/);
 dom.window.close();restored.window.close();empty.window.close();
});
test('corrupt stored data remains intact and shows recovery message',async()=>{
 const dom=await setup('invalid JSON');
 assert.match(dom.window.document.body.textContent,/Stored reports could not be read/);
 assert.equal(dom.window.localStorage.getItem('wced-district-monitor-ai-v6'),'invalid JSON');
 dom.window.close();
});
