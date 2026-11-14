import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDrafts,writeCollections} from '../src/drafts.js';
const draft={id:'draft-1',updatedAt:'2026-11-14T10:00:00Z',data:{school:'HEIDEDAL PRIM',circuit:'Circuit 8',date:'2026-11-14',scores:{'env-0':3}}};
test('partial drafts keep captured scores and remain separate from final reports',()=>{
 const d=validateDrafts([draft])[0];assert.equal(d.data.scores['env-0'],3);assert.equal(d.data.notes,'');assert.equal(d.reportId,null);
 assert.throws(()=>validateDrafts([{...draft,data:{scores:{'env-0':6}}}]));assert.throws(()=>validateDrafts([draft,draft]));
});
test('multi-collection writes restore previous data if a later write fails',()=>{
 const state=new Map([['reports','old reports'],['drafts','old drafts']]);let fail=true;
 const storage={getItem:k=>state.get(k)??null,setItem:(k,v)=>{if(k==='drafts'&&fail){fail=false;throw new Error('quota');}state.set(k,v);},removeItem:k=>state.delete(k)};
 assert.throws(()=>writeCollections(storage,[['reports',[]],['drafts',[]]]),/restored/);assert.equal(state.get('reports'),'old reports');assert.equal(state.get('drafts'),'old drafts');
});
