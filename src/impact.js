import {validDate,schoolKey,escapeHtml} from './advisor.js';
export const IMPACT_KEY='ecked-action-impact-v1';
export const IMPACT_STATUSES=['Not checked','Implementation seen','Early positive change','Sustained positive change','No change yet'];
const timestamp=v=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const text=(v,max=50000)=>typeof v==='string'&&v.length<=max;
const baselineValid=b=>b&&text(b.finding)&&b.finding.trim()&&text(b.action,10000)&&text(b.author,500)&&b.author.trim()&&validDate(b.date)&&text(b.source||'',500)&&text(b.actionAuthor||b.author,500)&&(b.actionAuthor||b.author).trim()&&validDate(b.actionDate||b.date)&&(b.actionDate||b.date)>=b.date;
export function validateImpacts(values){
 if(!Array.isArray(values)||values.length>10000)throw new Error('Expected up to 10,000 action-to-impact records.');
 const ids=new Set();return values.map((r,i)=>{
  const fail=m=>{throw new Error(`Action to Impact record ${i+1}: ${m}`);};
  if(!r||!text(r.id,200)||!r.id||ids.has(r.id)||!text(r.school,500)||!r.school.trim()||!/^Circuit [1-8]$/.test(r.circuit)||!baselineValid(r.baseline)||!timestamp(r.createdAt)||!timestamp(r.updatedAt))fail('invalid school, finding, author or date.');
  ids.add(r.id);if(r.reportId!=null&&!(typeof r.reportId==='string'||Number.isSafeInteger(r.reportId)))fail('invalid linked report.');
  if(!Array.isArray(r.updates)||r.updates.length>1000)fail('invalid evidence history.');
  const eventIds=new Set();const updates=r.updates.map(e=>{
   if(!e||!text(e.id,200)||!e.id||eventIds.has(e.id)||!validDate(e.date)||e.date<(r.baseline.action?(r.baseline.actionDate||r.baseline.date):r.baseline.date)||!text(e.author,500)||!e.author.trim()||!text(e.evidence)||!e.evidence.trim()||!IMPACT_STATUSES.includes(e.status)||!timestamp(e.recordedAt))fail('evidence needs a unique ID, date on/after the baseline, advisor name, observation and valid judgement.');
   eventIds.add(e.id);return {id:e.id,date:e.date,author:e.author.trim(),evidence:e.evidence.trim(),status:e.status,recordedAt:e.recordedAt};
  }).sort((a,b)=>a.date.localeCompare(b.date)||a.recordedAt.localeCompare(b.recordedAt));
  for(const e of updates)if(e.status==='Sustained positive change'&&!updates.some(p=>p.date<e.date&&['Early positive change','Sustained positive change'].includes(p.status)))fail('record a positive observation on an earlier date before judging the change sustained.');
  const revisions=r.revisions||[];if(!Array.isArray(revisions)||revisions.length>1000||revisions.some(v=>!baselineValid(v.baseline)||!timestamp(v.correctedAt)||!text(v.correctedBy,500)||!v.correctedBy.trim()))fail('invalid correction history.');
  return {id:r.id,school:r.school.trim(),circuit:r.circuit,reportId:r.reportId??null,baseline:{finding:r.baseline.finding.trim(),action:r.baseline.action.trim(),date:r.baseline.date,author:r.baseline.author.trim(),source:r.baseline.source||'Not specified',actionAuthor:r.baseline.actionAuthor||r.baseline.author,actionDate:r.baseline.actionDate||r.baseline.date},createdAt:r.createdAt,updatedAt:r.updatedAt,updates,revisions};
 });
}
export function latestImpactEvidence(record,asOf){return record.updates.filter(e=>e.date<=asOf).reverse().sort((a,b)=>b.date.localeCompare(a.date)||b.recordedAt.localeCompare(a.recordedAt))[0]||null;}
export function impactMetrics(records,asOf){
 const eligible=records.filter(r=>r.baseline.date<=asOf),judgements=eligible.map(r=>latestImpactEvidence(r,asOf)?.status||'Not checked');
 return {findings:eligible.length,support:eligible.filter(r=>r.baseline.action.trim()).length,implementation:judgements.filter(s=>['Implementation seen','Early positive change','Sustained positive change'].includes(s)).length,positive:judgements.filter(s=>['Early positive change','Sustained positive change'].includes(s)).length,notChecked:judgements.filter(s=>s==='Not checked').length};
}
export function findingFromReport(report,records,now){
 if(!report.supportProvided?.trim())return records;
 if(!report.notes?.trim())throw new Error('Add a brief finding before linking the support you provided.');
 const existing=records.find(r=>String(r.reportId)===String(report.id)&&schoolKey(r.circuit,r.school)===schoolKey(report.circuit,report.school));
 const baseline={finding:report.notes.trim(),action:report.supportProvided.trim(),date:report.date,author:report.advisor,source:report.informationSource||'Not specified',actionAuthor:report.advisor,actionDate:report.date};
 if(existing){
  if(JSON.stringify(existing.baseline)===JSON.stringify(baseline))return records;
  const updated={...existing,baseline,updatedAt:now,revisions:[...existing.revisions,{baseline:existing.baseline,correctedAt:now,correctedBy:report.advisor}]};
  return validateImpacts(records.map(r=>r.id===existing.id?updated:r));
 }
 return validateImpacts([{id:crypto.randomUUID(),school:report.school,circuit:report.circuit,reportId:report.id,baseline,createdAt:now,updatedAt:now,updates:[],revisions:[]},...records]);
}
export function impactReportSection(records,asOf){
 const h=escapeHtml,rows=records.filter(r=>r.baseline.date<=asOf),m=impactMetrics(rows,asOf);
 return `<h2>From Action to Impact</h2><p>Evidence as at ${h(asOf)}. ${m.support} findings with support recorded; ${m.implementation} with implementation evidenced; ${m.positive} with positive change evidenced. These are counts of recorded needs, not unique schools. Implementation and positive-change counts overlap; they are not additive.</p>${rows.length?rows.map(r=>{const e=latestImpactEvidence(r,asOf);return `<h3>${h(r.school)} · ${h(r.circuit)}</h3><table><tbody><tr><th>What we found</th><td>${h(r.baseline.finding)}<br><small>${h(r.baseline.date)} · ${h(r.baseline.author)} · ${h(r.baseline.source)}</small></td></tr><tr><th>Support provided</th><td>${h(r.baseline.action||'No support recorded yet')}<br><small>${r.baseline.action?h(r.baseline.actionDate||r.baseline.date)+' · '+h(r.baseline.actionAuthor||r.baseline.author):''}</small></td></tr><tr><th>Latest evidence</th><td>${h(e?.evidence||'Not checked')}<br><small>${e?h(e.date)+' · '+h(e.author):''}</small></td></tr><tr><th>Evidence judgement</th><td>${h(e?.status||'Not checked')}</td></tr></tbody></table>`;}).join(''):'<p>No linked findings and impact evidence recorded in this scope.</p>'}<p>Training attendance alone is not evidence of classroom implementation or learner impact. These are advisor judgements based on recorded observations, not proof that the support caused a change. Advisor names are entered by the user; shared authentication is not connected. Historical exports filter observations by their evidence date and use the currently corrected baseline.</p>`;
}
export function mergeImpactRecords(existing,incoming){
 const records=new Map(existing.map(r=>[r.id,r]));
 for(const r of incoming){const previous=records.get(r.id);if(!previous){records.set(r.id,r);continue;}
  const updates=new Map(previous.updates.map(e=>[e.id,e]));for(const e of r.updates){const old=updates.get(e.id);if(old&&JSON.stringify(old)!==JSON.stringify(e))throw new Error('Impact evidence conflict: an observation with the same ID has different contents. No records were restored.');updates.set(e.id,e);}
  const latest=r.updatedAt>previous.updatedAt?r:previous,other=latest===r?previous:r;
  const corrections=[...previous.revisions,...r.revisions];if(JSON.stringify(latest.baseline)!==JSON.stringify(other.baseline))corrections.push({baseline:other.baseline,correctedAt:latest.updatedAt,correctedBy:latest.baseline.author});
  records.set(r.id,{...latest,updates:[...updates.values()],revisions:[...new Map(corrections.map(v=>[JSON.stringify(v),v])).values()]});
 }
 return validateImpacts([...records.values()]);
}
