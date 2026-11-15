export const LEGACY_INDICATORS = [
  ...Array.from({length:3}, (_,i) => `env-${i}`),
  ...Array.from({length:4}, (_,i) => `culture-${i}`),
  'teaching-0', 'teaching-2', 'teaching-3', 'teaching-4',
];
export const CYBER_INDICATORS=['cyber-0','cyber-1','cyber-2'];
export const INDICATORS=[...LEGACY_INDICATORS,...CYBER_INDICATORS];
export const scoredKeys=scores=>INDICATORS.filter(k=>Number.isInteger(scores?.[k])&&scores[k]>=1&&scores[k]<=5);
export const scoreBasis=report=>scoredKeys(report?.scores).length;
export const meanScore=scores=>{const keys=scoredKeys(scores);return keys.length?keys.reduce((s,k)=>s+scores[k],0)/keys.length:null;};


export function calculateReadiness(scoreData) {
  const values = INDICATORS.filter(k => Number.isInteger(scoreData?.[k]) && scoreData[k] >= 1 && scoreData[k] <= 5).map(k => scoreData[k]);
  if (!values.length) return {score:'0.0', label:'PENDING', color:'#94a3b8'};
  const avg = values.reduce((a,b)=>a+b,0) / values.length;
  const label = avg <= 2.5 ? 'EMERGING' : avg < 3.5 ? 'ESTABLISHING' : avg < 4.5 ? 'INTEGRATED' : 'TRANSFORMATIVE';
  return {score:avg.toFixed(1), label, color:{EMERGING:'#dc2626', ESTABLISHING:'#ea580c', INTEGRATED:'#2563eb', TRANSFORMATIVE:'#16a34a'}[label]};
}

export function latestPerSchool(reports) {
  const latest = new Map();
  for (const report of reports) {
    const key = `${report.circuit.trim().toUpperCase()}|${report.school.trim().toUpperCase()}`;
    const previous = latest.get(key);
    if (!previous || report.date > previous.date || (report.date === previous.date && (report.updatedAt || '') > (previous.updatedAt || ''))) latest.set(key, report);
  }
  return [...latest.values()];
}

export function calculateDistrictInsights(reports) {
  const latest = latestPerSchool(reports);
  if (!latest.length) return {avg:'0.0',level:'PENDING',atRisk:0,strong:0,total:0,topProblems:[]};
  const means = latest.map(r => meanScore(r.scores));
  const avg = means.reduce((a,b)=>a+b,0)/means.length;
  const problems = {};
  latest.forEach(r => (r.aiAnalysis?.weak_areas || []).forEach(w => {problems[w.name]=(problems[w.name]||0)+1;}));
  return {avg:avg.toFixed(1),level:avg<=2.5?'EMERGING':avg<3.5?'ESTABLISHING':avg<4.5?'INTEGRATED':'TRANSFORMATIVE',
    atRisk:means.filter(v=>v<=2.5).length,strong:means.filter(v=>v>=3.5).length,total:latest.length,
    topProblems:Object.entries(problems).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([name,count])=>({name,count}))};
}

export function validateReports(value) {
  if (!Array.isArray(value) || value.length > 10000) throw new Error('Expected a list of up to 10,000 reports.');
  const ids = new Set();
  return value.map((report,index) => {
    const fail = () => {throw new Error(`Report ${index+1} is invalid. Expected an ID, school, circuit, valid date, contact details and all 14 current scores or a complete legacy 11-score assessment (1–5).`);};
    if (!report || typeof report !== 'object') fail();
    if (!(typeof report.id==='string' && report.id.length>0 && report.id.length<=200) && !(Number.isSafeInteger(report.id) && report.id>0)) fail();
    if (ids.has(String(report.id))) throw new Error('Backup contains duplicate report IDs.');
    ids.add(String(report.id));
    for (const field of ['school','circuit','date','staff','designation','advisor']) {
      if(typeof report[field]!=='string' || !report[field].trim() || report[field].length>500) fail();
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(report.date) || !Number.isFinite(Date.parse(report.date)) || new Date(report.date).toISOString().slice(0,10)!==report.date) fail();
    if (!/^Circuit [1-8]$/.test(report.circuit)) fail();
    if (report.updatedAt && (typeof report.updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(report.updatedAt) || !Number.isFinite(Date.parse(report.updatedAt)))) fail();
    if (!report.scores || Object.keys(report.scores).some(k=>!INDICATORS.includes(k)&&k!=='teaching-1') || ('teaching-1' in report.scores && (!Number.isInteger(report.scores['teaching-1'])||report.scores['teaching-1']<1||report.scores['teaching-1']>5)) || LEGACY_INDICATORS.some(k=>!Number.isInteger(report.scores[k]) || report.scores[k]<1 || report.scores[k]>5) || (CYBER_INDICATORS.some(k=>Object.hasOwn(report.scores,k))&&!CYBER_INDICATORS.every(k=>Number.isInteger(report.scores[k])&&report.scores[k]>=1&&report.scores[k]<=5)) || (report.scoreBasis===14&&!CYBER_INDICATORS.every(k=>Object.hasOwn(report.scores,k)))) fail();
    if (report.notes != null && (typeof report.notes!=='string' || report.notes.length>50000)) fail();
    if(report.informationSource!=null&&(typeof report.informationSource!=='string'||report.informationSource.length>500))fail();
    if(report.supportProvided!=null&&(typeof report.supportProvided!=='string'||report.supportProvided.length>10000))fail();
    return {scoreBasis:scoreBasis(report),supportProvided:report.supportProvided||'',informationSource:report.informationSource||'Not specified',id:report.id,updatedAt:report.updatedAt || '',school:report.school.trim(),circuit:report.circuit.trim(),date:report.date,staff:report.staff.trim(),designation:report.designation.trim(),advisor:report.advisor.trim(),notes:report.notes||'',scores:Object.fromEntries([...scoredKeys(report.scores),...('teaching-1' in report.scores?['teaching-1']:[])].map(k=>[k,report.scores[k]]))};
  });
}

export function mergeReports(existing,incoming) {
  const map = new Map(existing.map(r=>[String(r.id),r]));
  incoming.forEach(r=>map.set(String(r.id),r));
  return [...map.values()].sort((a,b)=>b.date.localeCompare(a.date));
}

export function csvExport(reports) {
  const cell = value => {
    let text = String(value ?? '');
    if (/^[\s]*[=+\-@\t\r]/.test(text)) text = "'"+text;
    return '"'+text.replaceAll('"','""')+'"';
  };
  const rows = [['School','Circuit','Date','Advisor','Contact','Designation','Score','Level','Indicators scored',...INDICATORS,'Information source','Notes','Support provided'],
    ...reports.map(r=>{const ready=calculateReadiness(r.scores);return [r.school,r.circuit,r.date,r.advisor,r.staff,r.designation,ready.score,ready.label,scoreBasis(r),...INDICATORS.map(k=>r.scores[k]),r.informationSource||'Not specified',r.notes,r.supportProvided||''];})];
  return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
