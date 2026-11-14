import test from 'node:test';
import assert from 'node:assert/strict';
import {validateImpacts,impactMetrics,latestImpactEvidence,impactReportSection,findingFromReport,mergeImpactRecords} from '../src/impact.js';
const base=()=>({id:'need-1',school:'HEIDEDAL PRIM',circuit:'Circuit 8',reportId:'report-1',baseline:{finding:'Learners mainly watched slides.',action:'Modelled formative assessment.',date:'2026-10-01',author:'Advisor One',actionDate:'2026-10-05',actionAuthor:'Advisor Two',source:'Observed during assessment'},createdAt:'2026-10-05T10:00:00Z',updatedAt:'2026-10-05T10:00:00Z',updates:[],revisions:[]});
const event=(status='Implementation seen',date='2026-10-20',id='e1')=>({id,date,author:'Advisor Two',evidence:'Observed learners responding to a quiz.',status,recordedAt:date+'T10:00:00Z'});
test('finding, support and later evidence retain independent authors and dates',()=>{
 const r=validateImpacts([{...base(),updates:[event()]}])[0];assert.equal(r.baseline.author,'Advisor One');assert.equal(r.baseline.actionAuthor,'Advisor Two');assert.equal(r.updates[0].author,'Advisor Two');assert.equal(r.baseline.actionDate,'2026-10-05');
 for(const invalid of [{...base(),baseline:{...base().baseline,author:''}},{...base(),updates:[event('Implementation seen','2026-10-03')]},{...base(),updates:[event(),event()]},{...base(),updates:[{...event(),evidence:''}]}])assert.throws(()=>validateImpacts([invalid]));
});
test('implementation is not counted as positive impact and historical cutoffs exclude later evidence',()=>{
 const r=validateImpacts([{...base(),updates:[event(),event('Early positive change','2026-11-01','e2')]}])[0];
 assert.equal(impactMetrics([r],'2026-10-25').implementation,1);assert.equal(impactMetrics([r],'2026-10-25').positive,0);assert.equal(impactMetrics([r],'2026-11-10').positive,1);assert.equal(latestImpactEvidence(r,'2026-10-10'),null);
 const n={...r,updates:[...r.updates,event('No change yet','2026-11-12','e3')]};assert.equal(impactMetrics([n],'2026-11-14').positive,0);
});
test('sustained positive change needs positive evidence on an earlier date',()=>{
 assert.throws(()=>validateImpacts([{...base(),updates:[event('Sustained positive change')]}]),/earlier date/);
 assert.throws(()=>validateImpacts([{...base(),updates:[event('Early positive change'),event('Sustained positive change','2026-10-20','e2')]}]),/earlier date/);
 const r=validateImpacts([{...base(),updates:[event('Early positive change'),event('Sustained positive change','2026-11-01','e2')]}])[0];assert.equal(impactMetrics([r],'2026-11-14').positive,1);
});
test('linked report edits retain observation history, create corrections and avoid duplicate needs',()=>{
 const report={id:'report-1',school:'HEIDEDAL PRIM',circuit:'Circuit 8',date:'2026-10-01',advisor:'Advisor One',notes:'Updated baseline text.',supportProvided:'Support was modelled.',informationSource:'Observed during assessment'};
 const existing=validateImpacts([{...base(),baseline:{...base().baseline,actionDate:'2026-10-01',actionAuthor:'Advisor One'},updates:[event()]}]);
 const next=findingFromReport(report,existing,'2026-11-14T10:00:00Z');assert.equal(next.length,1);assert.equal(next[0].updates.length,1);assert.equal(next[0].revisions.length,1);assert.equal(next[0].revisions[0].baseline.finding,base().baseline.finding);
 assert.equal(findingFromReport(report,next,'2026-11-14T11:00:00Z')[0].revisions.length,1);
});
test('manager impact section escapes observations and never includes future evidence',()=>{
 const r=validateImpacts([{...base(),baseline:{...base().baseline,finding:'<script>alert(1)</script>'},updates:[event(),{...event('Early positive change','2026-12-01','future'),evidence:'Future observation'}]}])[0];
 const html=impactReportSection([r],'2026-11-14');assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('Future observation'));assert.ok(html.includes('not proof'));assert.ok(html.includes('Advisor One'));assert.ok(html.includes('Advisor Two'));
});

test('latest evidence uses the last appended observation when dates and timestamps tie',()=>{
 const first=event(),second={...event('Early positive change'),'id':'e2'};const r=validateImpacts([{...base(),updates:[first,second]}])[0];assert.equal(latestImpactEvidence(r,'2026-11-14').status,'Early positive change');
});

test('backup merges preserve independent advisor observations and reject same-ID conflicts',()=>{
 const a=validateImpacts([{...base(),updates:[event()]}]),b=validateImpacts([{...base(),updatedAt:'2026-11-01T10:00:00Z',updates:[event('Early positive change','2026-11-01','e2')]}]);
 const merged=mergeImpactRecords(a,b);assert.equal(merged[0].updates.length,2);assert.equal(impactMetrics(merged,'2026-11-14').positive,1);
 assert.throws(()=>mergeImpactRecords(a,validateImpacts([{...base(),updates:[{...event(),evidence:'Different content'}]}])),/conflict/);
});
