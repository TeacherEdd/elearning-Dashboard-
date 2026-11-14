import {validateTrainingLink} from './training.js';
import {INDICATORS, calculateReadiness} from './core.js';

export const SUPPORT_KEY = 'ecked-advisor-support-v1';
export const schoolKey = (circuit,school) => `${circuit.trim().toUpperCase()}|${school.trim().toUpperCase()}`;
export const scoreMean = report => report ? INDICATORS.reduce((sum,key)=>sum+report.scores[key],0)/INDICATORS.length : null;
export const validDate = value => typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10)===value;
export const daysSince = (date,asOf) => Math.floor((Date.parse(asOf)-Date.parse(date))/86400000);
export const overdue = (entry,asOf) => entry.status!=='Completed' && Boolean(entry.dueDate) && entry.dueDate<asOf;
export const SECTIONS = [{id:'env',name:'Enabling Environment',count:3},{id:'culture',name:'e-Culture',count:4},{id:'teaching',name:'e-Teaching',count:4}];
export function sectionScores(report) {
  return SECTIONS.map(s=>({...s,score:report ? INDICATORS.filter(k=>k.startsWith(s.id+'-')).map(k=>report.scores[k]).reduce((a,b)=>a+b,0)/s.count : null}));
}
export function validateSupportLogs(value) {
  if (!Array.isArray(value) || value.length>10000) throw new Error('Expected up to 10,000 support records.');
  const ids=new Set();
  return value.map((entry,index)=>{
    const fail=()=>{throw new Error(`Support record ${index+1} is invalid.`);};
    if (!entry || typeof entry!=='object') fail();
    for(const field of ['id','school','circuit','owner','summary']) if(typeof entry[field]!=='string' || !entry[field].trim() || entry[field].length>10000) fail();
    if(ids.has(entry.id)) fail();ids.add(entry.id);
    if(!/^Circuit [1-8]$/.test(entry.circuit) || !validDate(entry.date) || (entry.dueDate && !validDate(entry.dueDate))) fail();
    if(!['School visit','Training','Advice','Follow-up','Resource support'].includes(entry.type) || !['Planned','In progress','Completed'].includes(entry.status)) fail();
    if(entry.notes != null && (typeof entry.notes!=='string' || entry.notes.length>50000)) fail();
    if(entry.updatedAt && (typeof entry.updatedAt!=='string' || !Number.isFinite(Date.parse(entry.updatedAt)))) fail();
    if(entry.completedDate && !validDate(entry.completedDate)) fail();
    if(entry.status==='Completed' && !validDate(entry.completedDate)) fail();
    return {training:validateTrainingLink(entry.training),id:entry.id,school:entry.school.trim(),circuit:entry.circuit.trim(),owner:entry.owner.trim(),summary:entry.summary.trim(),date:entry.date,dueDate:entry.dueDate||'',type:entry.type,status:entry.status,notes:entry.notes||'',updatedAt:entry.updatedAt||'',completedDate:entry.status==='Completed'?entry.completedDate:''};
  });
}
export function schoolProfiles(database,reports,logs,asOf,equipment=[]) {
  const groups=new Map();
  for(const [circuit,schools] of Object.entries(database)) for(const school of schools) {
    const key=schoolKey(circuit,school);groups.set(key,{key,school,circuit,history:[],support:[],inRegister:true});
  }
  // Preserve imported schools outside the register; never silently hide their records.
  for(const item of [...reports,...logs,...equipment]) {
    const key=schoolKey(item.circuit,item.school);
    if(!groups.has(key)) groups.set(key,{key,school:item.school,circuit:item.circuit,history:[],support:[],inRegister:false});
  }
  for(const r of reports) if(r.date<=asOf) groups.get(schoolKey(r.circuit,r.school)).history.push(r);
  for(const l of logs) if(l.date<=asOf) groups.get(schoolKey(l.circuit,l.school)).support.push(l);
  return [...groups.values()].map(profile=>{
    profile.history.sort((a,b)=>b.date.localeCompare(a.date)||(b.updatedAt||'').localeCompare(a.updatedAt||''));
    profile.support.sort((a,b)=>b.date.localeCompare(a.date));
    const latest=profile.history[0]||null,previous=profile.history[1]||null;
    const score=scoreMean(latest), delta=previous?score-scoreMean(previous):null;
    const overdueCount=profile.support.filter(e=>overdue(e,asOf)).length;
    const stale=Boolean(latest && daysSince(latest.date,asOf)>180);
    const urgentIndicators=latest?INDICATORS.filter(k=>latest.scores[k]<=2).length:0;
    return {...profile,latest,previous,score,delta,overdueCount,stale,urgentIndicators,sections:sectionScores(latest),level:latest?calculateReadiness(latest.scores).label:'NOT ASSESSED',priority:!latest?'Not assessed':overdueCount?'Follow-up overdue':urgentIndicators?'Priority gaps':stale?'Assessment over 180 days old':'Routine monitoring'};
  }).sort((a,b)=>a.school.localeCompare(b.school));
}
export function managementMetrics(profiles,logs,from,to) {
  const assessed=profiles.filter(p=>p.latest),registered=profiles.filter(p=>p.inRegister),registeredAssessed=registered.filter(p=>p.latest);
  const periodReports=profiles.flatMap(p=>p.history).filter(r=>r.date>=from && r.date<=to);
  const periodLogs=logs.filter(l=>l.date>=from&&l.date<=to);
  const completed=logs.filter(l=>l.status==='Completed'&&l.completedDate>=from&&l.completedDate<=to);
  const changes=assessed.filter(p=>p.delta!==null);
  return {total:registered.length,assessed:registeredAssessed.length,unassessed:registered.length-registeredAssessed.length,
    coverage:registered.length?Math.round(100*registeredAssessed.length/registered.length):0,
    average:assessed.length?(assessed.reduce((sum,p)=>sum+p.score,0)/assessed.length).toFixed(1):null,
    assessments:periodReports.length,schoolsAssessedInPeriod:new Set(periodReports.map(r=>schoolKey(r.circuit,r.school))).size,
    supportRecorded:periodLogs.length,schoolVisits:periodLogs.filter(l=>l.type==='School visit'&&l.status!=='Planned').length,
    completed:completed.length,overdue:logs.filter(l=>l.date<=to&&overdue(l,to)).length,
    priority:assessed.filter(p=>p.urgentIndicators>0).length,stale:assessed.filter(p=>p.stale).length,
    improved:changes.filter(p=>p.delta>0.05).length,declined:changes.filter(p=>p.delta< -0.05).length,unchanged:changes.filter(p=>Math.abs(p.delta)<=0.05).length,
    circuits:[...new Set(profiles.map(p=>p.circuit))].sort().map(circuit=>{
      const schools=registered.filter(p=>p.circuit===circuit),done=schools.filter(p=>p.latest);
      return {circuit,total:schools.length,assessed:done.length,average:done.length?(done.reduce((sum,p)=>sum+p.score,0)/done.length).toFixed(1):null};
    })};
}
export const escapeHtml = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function managementDocument({profiles,logs,from,to,circuit,managerNotes,generatedOn,equipmentHtml='',logoUrl='',impactHtml=''}) {
  const m=managementMetrics(profiles,logs,from,to),h=escapeHtml;
  const table=(headers,rows)=>`<table><thead><tr>${headers.map(x=>`<th>${h(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${h(x)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>ECKED Management Summary</title><style>body{font:15px/1.5 Arial,sans-serif;color:#13243a;max-width:1100px;margin:40px auto;padding:20px}h1{font-size:28px}h2{margin-top:28px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;border:1px solid #cbd5e1;padding:8px;vertical-align:top}th{background:#edf2f7}p{white-space:pre-wrap}small{color:#475569}@media print{body{margin:0;padding:0}thead{display:table-header-group}tr{break-inside:avoid}h2{break-after:avoid}}</style></head><body>${logoUrl?`<img src="${h(logoUrl)}" alt="Eden and Central Karoo Education District" style="width:100px;height:100px;float:right;object-fit:contain">`:""}<h1>ECKED · School Findings Report</h1><p>Subject advisor: E. van der Berg<br>Scope: ${h(circuit||'All circuits')} · Period: ${h(from)} to ${h(to)}<br>Generated: ${h(generatedOn)} · Findings snapshot as at ${h(to)}</p>
  <p><strong>${m.assessed} of ${m.total} registered schools assessed (${m.coverage}%).</strong> ${m.unassessed} not yet assessed. Latest-score average: ${m.average??'Not available'}/5. ${m.priority} assessed schools have at least one indicator at 1–2; ${m.stale} assessments are older than 180 days.</p>
  <p>Final reports in period: ${m.assessments} across ${m.schoolsAssessedInPeriod} schools. Scores are calculated using 11 included indicators; LMS is excluded. Drafts are not rated.</p>
  <p>Latest two recorded assessments: ${m.improved} improved, ${m.declined} declined, ${m.unchanged} unchanged. These comparisons are not restricted to the reporting period and do not establish that support caused the change.</p>
  <h2>Advisor commentary and decisions needed</h2><p>${h(managerNotes||'No commentary entered.')}</p>
  <h2>Coverage by circuit</h2>${table(['Circuit','Registered','Assessed','Average /5'],m.circuits.map(c=>[c.circuit,c.total,c.assessed,c.average??'Not assessed']))}
  <h2>School position as at ${h(to)}</h2>${table(['School','Circuit','Last assessed','Level','Score /5','Change (latest two)','Attention'],profiles.map(p=>[p.school+(p.inRegister?'':' [outside register]'),p.circuit,p.latest?.date||'Not assessed',p.level,p.score?.toFixed(1)??'—',p.delta===null?'No comparison':(p.delta>=0?'+':'')+p.delta.toFixed(2),p.priority]))}
  <h2>Recorded school findings</h2>${table(['School','Assessment date','Information source','Findings and evidence'],profiles.filter(p=>p.latest).map(p=>[p.school,p.latest.date,p.latest.informationSource||'Not specified',p.latest.notes||'No additional observations recorded.']))}
  <h2>Recorded recommendations and support in period</h2>${table(['Date','School','Type','Recorded advice / support','Advisor / responsible person','Training verification'],logs.filter(l=>l.date>=from&&l.date<=to).map(l=>[l.date,l.school,l.type,l.summary,l.owner,l.training?`Attendance: ${l.training.attendance}; implementation: ${l.training.implementation}`:'—']))}
  ${impactHtml}
  ${equipmentHtml}
  <small>This is an exported snapshot from records on the advisor's device, not a shared live database. Unassessed schools have no maturity rating. Support statuses reflect their current recorded state; historical status changes are not reconstructed. This report records school findings and advice; it is not a visit schedule. Coverage uses the supplied school register; outside-register assessments are listed separately and included in the overall assessed-school average. No official performance target is assumed.</small></body></html>`;
}
