import test from 'node:test';
import assert from 'node:assert/strict';
import {schoolProfiles,managementMetrics,validateSupportLogs,managementDocument} from '../src/advisor.js';
import {INDICATORS} from '../src/core.js';
const database={'Circuit 8':['School A','School B'],'Circuit 1':['School C']};
const report=(id,n,date,school='School A')=>({id,school,circuit:'Circuit 8',date,scores:Object.fromEntries(INDICATORS.map(k=>[k,n]))});
const log=(extra={})=>({id:'action-1',school:'School A',circuit:'Circuit 8',owner:'Advisor',summary:'Training and follow-up',date:'2026-10-01',dueDate:'2026-11-01',type:'Training',status:'In progress',notes:'',...extra});
test('coverage distinguishes unassessed schools, latest progress, stale data and future assessments',()=>{
 const p=schoolProfiles(database,[report(1,2,'2026-04-01'),report(2,4,'2026-11-01'),report(3,5,'2027-01-01'),report(4,3,'2026-01-01','School B')],[log()],'2026-11-13');
 const a=p.find(p=>p.school==='School A'),b=p.find(p=>p.school==='School B'),c=p.find(p=>p.school==='School C');
 assert.equal(a.score,4);assert.equal(a.delta,2);assert.equal(a.overdueCount,1);assert.equal(b.stale,true);assert.equal(c.score,null);assert.equal(c.level,'NOT ASSESSED');
 const m=managementMetrics(p,[log()],'2026-11-01','2026-11-13');
 assert.equal(m.total,3);assert.equal(m.assessed,2);assert.equal(m.unassessed,1);assert.equal(m.assessments,1);assert.equal(m.supportRecorded,0);assert.equal(m.overdue,1);assert.equal(m.improved,1);
});
test('outside-register schools are preserved without inflating registered coverage',()=>{
 const p=schoolProfiles(database,[report(1,2,'2026-11-01','Other school')],[],'2026-11-13');
 const m=managementMetrics(p,[],'2026-11-01','2026-11-13');assert.equal(m.assessed,0);assert.equal(m.total,3);assert.equal(m.average,'2.0');assert.equal(p.find(p=>p.school==='Other school').inRegister,false);
});
test('completed actions are not overdue and completion counts use completed date',()=>{
 const logs=[log({status:'Completed',completedDate:'2026-11-05'})];
 const valid=validateSupportLogs(logs);const p=schoolProfiles(database,[],valid,'2026-11-13');
 assert.equal(p.find(p=>p.school==='School A').overdueCount,0);
 const m=managementMetrics(p,valid,'2026-11-01','2026-11-13');assert.equal(m.completed,1);assert.equal(m.supportRecorded,0);
});
test('support validation rejects impossible dates, missing owners, invalid statuses and duplicates',()=>{
 for(const invalid of [log({date:'2026-02-30'}),log({owner:''}),log({status:'Done'}),log({status:'Completed'}),log({dueDate:'invalid'})])assert.throws(()=>validateSupportLogs([invalid]));
 assert.throws(()=>validateSupportLogs([log(),log()]));assert.equal(validateSupportLogs([log()])[0].summary,log().summary);
});
test('manager report escapes entered content and clearly identifies snapshot limitations',()=>{
 const profiles=schoolProfiles(database,[],[log()],'2026-11-13');
 const html=managementDocument({profiles,logs:[log({summary:'<script>alert(1)</script>'})],from:'2026-10-01',to:'2026-11-13',managerNotes:'<img src=x onerror=alert(1)>',generatedOn:'2026-11-13'});
 assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<img'));assert.ok(html.includes('not a shared live database'));assert.ok(html.includes('NOT ASSESSED'));
});
