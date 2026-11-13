import {schoolKey,validDate,escapeHtml} from './advisor.js';
export const EQUIPMENT_KEY='ecked-school-equipment-v1';
export const DEVICE_TYPES=[{id:'projectors',name:'Projectors'},{id:'laptops',name:'Laptops'},{id:'tablets',name:'Tablets'},{id:'visualisers',name:'Visualisers'},{id:'miniPcs',name:'Mini PCs'}];
const count=n=>Number.isSafeInteger(n)&&n>=0&&n<=1000000;
export function validateEquipment(value){
 if(!Array.isArray(value)||value.length>10000)throw new Error('Expected up to 10,000 equipment snapshots.');
 const ids=new Set();return value.map((r,i)=>{
  const fail=message=>{throw new Error(`Equipment record ${i+1}: ${message}`);};
  if(!r||typeof r!=='object')fail('invalid record.');
  for(const k of ['id','school','circuit','source'])if(typeof r[k]!=='string'||!r[k].trim()||r[k].length>500)fail(`${k} is required.`);
  if(ids.has(r.id))fail('duplicate ID.');ids.add(r.id);
  if(!/^Circuit [1-8]$/.test(r.circuit)||!validDate(r.verifiedDate))fail('choose a valid circuit and verification date.');
  if(r.updatedAt&&(typeof r.updatedAt!=='string'||!Number.isFinite(Date.parse(r.updatedAt))))fail('invalid update timestamp.');
  const devices={};for(const t of DEVICE_TYPES){
   const row=r.devices?.[t.id];if(row===null||row===undefined){devices[t.id]=null;continue;}
   if(!['total','working','faulty','awaitingRepair'].every(k=>count(row[k])))fail(`${t.name}: enter whole, non-negative counts in all four fields, or leave the whole row blank.`);
   if(row.working+row.faulty+row.awaitingRepair!==row.total)fail(`${t.name}: working + faulty + awaiting repair must equal total. Count each device once.`);
   devices[t.id]=Object.fromEntries(['total','working','faulty','awaitingRepair'].map(k=>[k,row[k]]));
  }
  const smart=r.smart||{};if(!['Unknown','Yes','No'].includes(smart.present))fail('choose Yes, No or Unknown for smart classrooms.');
  if(!['Unknown','Regular use','Limited use','Not in use'].includes(smart.usage))fail('invalid smart-classroom use.');
  if(smart.present==='Yes'&&(!count(smart.total)||smart.total<1||!count(smart.functional)||smart.functional>smart.total))fail('functional smart classrooms must be between zero and number installed.');
  if(smart.present==='No'&&(smart.total!==0||smart.functional!==0||smart.usage!=='Not in use'))fail('a school without smart classrooms must have zero installed/functional and Not in use.');
  if(smart.present==='Unknown'&&(smart.total!==null||smart.functional!==null||smart.usage!=='Unknown'))fail('unknown smart classrooms must have blank counts and unknown usage.');
  if(!DEVICE_TYPES.some(t=>devices[t.id])&&smart.present==='Unknown')fail('capture at least one category or confirm smart classroom availability.');
  if(r.notes!=null&&(typeof r.notes!=='string'||r.notes.length>50000))fail('notes are too long.');
  if(r.verifiedBy!=null&&(typeof r.verifiedBy!=='string'||r.verifiedBy.length>500))fail('invalid verification contact.');
  return {id:r.id,school:r.school.trim(),circuit:r.circuit.trim(),verifiedDate:r.verifiedDate,source:r.source.trim(),verifiedBy:r.verifiedBy||'',notes:r.notes||'',updatedAt:r.updatedAt||'',devices,smart:{present:smart.present,total:smart.total,functional:smart.functional,usage:smart.usage}};
 });
}
export function latestEquipment(records,asOf){
 const map=new Map();for(const r of records){if(r.verifiedDate>asOf)continue;const key=schoolKey(r.circuit,r.school),p=map.get(key);
 if(!p||r.verifiedDate>p.verifiedDate||(r.verifiedDate===p.verifiedDate&&(r.updatedAt||'')>(p.updatedAt||'')))map.set(key,r);}
 return [...map.values()];
}
export function equipmentSummary(records,asOf){
 const latest=latestEquipment(records,asOf);const rows=DEVICE_TYPES.map(t=>({...t,recordedSchools:0,total:0,working:0,faulty:0,awaitingRepair:0}));
 for(const r of latest)for(const row of rows){const d=r.devices[row.id];if(d){row.recordedSchools++;for(const k of ['total','working','faulty','awaitingRepair'])row[k]+=d[k];}}
 return {latest,rows,schoolsRecorded:latest.length,repairSchools:latest.filter(r=>DEVICE_TYPES.some(t=>(r.devices[t.id]?.faulty||0)+(r.devices[t.id]?.awaitingRepair||0)>0)).length,smartYes:latest.filter(r=>r.smart.present==='Yes').length,smartUnknown:latest.filter(r=>r.smart.present==='Unknown').length,smartInstalled:latest.reduce((sum,r)=>sum+(r.smart.total||0),0),smartFunctional:latest.reduce((sum,r)=>sum+(r.smart.functional||0),0)};
}
export function equipmentReportSection(records,asOf){
 const s=equipmentSummary(records,asOf),h=escapeHtml;
 return `<h2>Equipment and infrastructure as at ${h(asOf)}</h2><p>${s.schoolsRecorded} schools with equipment snapshots. ${s.repairSchools} schools have recorded faulty devices or devices awaiting repair. ${s.smartYes} schools report smart classrooms: ${s.smartFunctional}/${s.smartInstalled} installed rooms functional. Missing counts are not zero.</p><table><thead><tr><th>Equipment</th><th>Schools reporting</th><th>Total</th><th>Working</th><th>Faulty</th><th>Awaiting repair</th></tr></thead><tbody>${s.rows.map(r=>`<tr>${[r.name,r.recordedSchools,r.recordedSchools?r.total:'Not captured',r.recordedSchools?r.working:'—',r.recordedSchools?r.faulty:'—',r.recordedSchools?r.awaitingRepair:'—'].map(v=>`<td>${h(v)}</td>`).join('')}</tr>`).join('')}</tbody></table><h3>School equipment verification</h3><table><thead><tr><th>School</th><th>Verified</th><th>Source / contact</th><th>Equipment totals: working / total</th><th>Smart classrooms</th></tr></thead><tbody>${s.latest.map(r=>`<tr>${[r.school+' · '+r.circuit,r.verifiedDate,r.source+(r.verifiedBy?' · '+r.verifiedBy:''),DEVICE_TYPES.map(t=>`${t.name}: ${r.devices[t.id]?r.devices[t.id].working+' / '+r.devices[t.id].total+' working; '+r.devices[t.id].faulty+' faulty; '+r.devices[t.id].awaitingRepair+' awaiting repair':'Not captured'}`).join('; '),r.smart.present==='Yes'?`${r.smart.functional}/${r.smart.total} functional · ${r.smart.usage}`:r.smart.present].map(v=>`<td>${h(v)}</td>`).join('')}</tr>`).join('')}</tbody></table><p>Functional smart classroom means the core installed equipment operates and required connectivity is available. Actual classroom use is recorded separately. These are dated school-level summaries, not serial-number asset records.</p>`;
}
