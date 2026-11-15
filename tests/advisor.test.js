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
test('legacy Cyberwellness is unassessed and changed scoring bases are not treated as progress',async()=>{const {LEGACY_INDICATORS}=await import('../src/core.js');const old={...report('old',4,'2026-11-01'),scores:Object.fromEntries(LEGACY_INDICATORS.map(k=>[k,4]))},current=report('new',4,'2026-11-14');const before=schoolProfiles(database,[old],[],'2026-11-15')[0];assert.equal(before.sections.find(s=>s.id==='cyber').score,null);assert.equal(before.score,4);const after=schoolProfiles(database,[old,current],[],'2026-11-15')[0];assert.equal(after.sections.find(s=>s.id==='cyber').score,4);assert.equal(after.delta,null);});
test('district graphs count latest registered schools, exclude missing Cyberwellness and keep pathway steps independent',async()=>{
 const {districtGraphs}=await import('../src/graphs.js'),{LEGACY_INDICATORS}=await import('../src/core.js');const old={...report('a',2,'2026-11-01'),scores:Object.fromEntries(LEGACY_INDICATORS.map(k=>[k,2]))},modern={...report('b',4,'2026-11-02','School B'),scores:{...report('b',4,'2026-11-02','School B').scores,'cyber-0':1,'cyber-1':1,'cyber-2':1}},outside=report('o',1,'2026-11-02','Outside');const reports=[report('a-old',1,'2026-10-01'),old,modern,outside],profiles=schoolProfiles(database,reports,[],'2026-11-15');const focus=[{school:'School A',circuit:'Circuit 8',active:true,pathwayVersion:4,steps:[true,false,false,true],date:'2026-11-01',advisor:'Advisor'},{school:'School B',circuit:'Circuit 8',active:false,pathwayVersion:4,steps:[true,true,true,true]}];const g=districtGraphs(profiles,focus,reports,'2026-11-15');assert.equal(g.total,3);assert.equal(g.assessed,2);assert.equal(g.outside,1);assert.equal(g.readiness.find(r=>r.id==='NOT ASSESSED').value,1);assert.equal(g.areas.find(r=>r.id==='env').value,3);assert.equal(g.areas.find(r=>r.id==='cyber').value,1);assert.equal(g.areas.find(r=>r.id==='cyber').schools.length,1);assert.deepEqual(g.pathway.map(r=>r.value),[1,1,0,0,1]);assert.equal(g.focusTotal,1);const empty=districtGraphs(profiles.filter(p=>p.circuit==='Circuit 1'),focus,reports,'2026-11-15');assert.equal(empty.focusTotal,0);assert.equal(empty.areas[0].value,null);assert.equal(empty.readiness.find(r=>r.id==='NOT ASSESSED').value,1);
});
