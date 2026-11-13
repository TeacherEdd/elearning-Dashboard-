import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEquipment,equipmentSummary,latestEquipment,equipmentReportSection,DEVICE_TYPES} from '../src/equipment.js';
import {recommendedTraining,trainingAction} from '../src/training.js';
import {validateSupportLogs,schoolKey} from '../src/advisor.js';
import {INDICATORS} from '../src/core.js';
const equipment=(extra={})=>({id:'asset-1',school:'HEIDEDAL PRIM',circuit:'Circuit 8',verifiedDate:'2026-11-13',source:'ICT Champion reported',notes:'',devices:{tablets:{total:20,working:18,faulty:1,awaitingRepair:1}},smart:{present:'Yes',total:2,functional:1,usage:'Limited use'},...extra});
const report=()=>({scores:Object.fromEntries(INDICATORS.map(k=>[k,4]))});
test('equipment distinguishes unknown from confirmed zero and rejects inconsistent condition counts',()=>{
 const record=validateEquipment([equipment()])[0];assert.equal(record.devices.laptops,null);assert.equal(record.devices.tablets.total,20);
 const zero=validateEquipment([equipment({devices:{tablets:{total:0,working:0,faulty:0,awaitingRepair:0}}})])[0];assert.equal(zero.devices.tablets.total,0);
 for(const row of [{total:20,working:20,faulty:1,awaitingRepair:0},{total:2,working:-1,faulty:2,awaitingRepair:1},{total:2,working:1.5,faulty:0.5,awaitingRepair:0},{total:2,working:2}])assert.throws(()=>validateEquipment([equipment({devices:{tablets:row}})]));
});
test('smart classroom functionality cannot exceed installed count and unknown never becomes zero',()=>{
 assert.throws(()=>validateEquipment([equipment({smart:{present:'Yes',total:1,functional:2,usage:'Regular use'}})]));
 assert.throws(()=>validateEquipment([equipment({verifiedDate:'2026-02-30'})]));
 const unknown=validateEquipment([equipment({smart:{present:'Unknown',total:null,functional:null,usage:'Unknown'}})])[0];assert.equal(unknown.smart.total,null);
});
test('equipment totals use latest dated snapshot per school and respect historical cutoffs',()=>{
 const old=validateEquipment([equipment({verifiedDate:'2026-10-01'})])[0];const next=validateEquipment([equipment({id:'asset-2',devices:{tablets:{total:30,working:30,faulty:0,awaitingRepair:0}}})])[0];
 assert.equal(equipmentSummary([old,next],'2026-11-13').rows.find(r=>r.id==='tablets').total,30);
 assert.equal(equipmentSummary([old,next],'2026-10-31').rows.find(r=>r.id==='tablets').total,20);
 assert.equal(equipmentSummary([next],'2026-11-13').rows.find(r=>r.id==='laptops').recordedSchools,0);
 assert.equal(latestEquipment([next,old],'2026-11-13').length,1);
 assert.match(equipmentReportSection([old],'2026-11-13'),/1 faulty/);
});
test('training matches actual low/developing indicators, excludes past sessions and supports local district preference',()=>{
 const r=report();r.scores['teaching-3']=1;
 const local=recommendedTraining(r,'2026-11-13');assert.ok(local.some(s=>s.title==='Digital Design with Canva'));assert.ok(local.every(s=>s.district==='EDEN & CENTRAL KAROO'&&s.needs.some(n=>n.id==='teaching-3')));
 const all=recommendedTraining(r,'2026-11-13',{localOnly:false});assert.ok(all.length>local.length);
 assert.deepEqual(recommendedTraining(r,'2028-01-01'),[]);assert.deepEqual(recommendedTraining(null,'2026-11-13'),[]);assert.deepEqual(recommendedTraining(report(),'2026-11-13'),[]);
 const repairs=report();repairs.scores['env-2']=1;assert.deepEqual(recommendedTraining(repairs,'2026-11-13'),[]);
});
test('planned training preserves linkage and does not imply attendance or classroom implementation',()=>{
 const r=report();r.scores['teaching-3']=1;const session=recommendedTraining(r,'2026-11-13')[0];const profile={school:'HEIDEDAL PRIM',circuit:'Circuit 8',key:schoolKey('Circuit 8','HEIDEDAL PRIM')};
 const action=validateSupportLogs([trainingAction(profile,session,'2026-11-13')])[0];assert.equal(action.status,'Planned');assert.equal(action.training.attendance,'Not confirmed');assert.equal(action.training.implementation,'Not checked');assert.equal(action.training.date,session.date);
 const updated=validateSupportLogs([{...action,training:{...action.training,attendance:'Confirmed',implementation:'Observed'}}])[0];assert.equal(updated.training.implementation,'Observed');
 assert.throws(()=>validateSupportLogs([{...action,training:{...action.training,attendance:'auto'}}]));
});
