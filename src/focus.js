import {validDate,schoolKey} from './advisor.js';
export const FOCUS_KEY='ecked-focus-schools-v1';
export const LEGACY_FOCUS_STAGES=['Understand the starting point','Put foundations in place','Build teacher confidence','Apply in classrooms','Check and sustain the change'];
export const FOCUS_STAGES=['Audit','ICT Policy and eLearning Plan','ICT Adoption Strategy','Digital Skills Course'];
export const focusCompleted=r=>r.pathwayVersion===2?r.completed:0;
export function focusChecks(record,reports=[],asOf='9999-12-31'){
 const audit=reports.some(r=>r.date<=asOf&&schoolKey(r.circuit,r.school)===schoolKey(record.circuit,record.school));
 const manual=record.pathwayVersion===3?record.steps:record.pathwayVersion===2?[2,3,4].map(n=>record.completed>=n):[false,false,false];
 return [audit,...manual];
}
export function validateFocus(values){
 if(!Array.isArray(values)||values.length>1000)throw new Error('Expected up to 1,000 focus schools.');
 const keys=new Set(),ids=new Set(),text=(v,n=10000)=>typeof v==='string'&&v.length<=n;
 const details=r=>r&&text(r.priority)&&r.priority.trim()&&text(r.nextStep)&&text(r.evidence)&&text(r.advisor,500)&&r.advisor.trim()&&validDate(r.date)&&Number.isInteger(r.stage)&&r.stage>=1&&r.stage<=([2,3].includes(r.pathwayVersion)?4:5)&&(r.pathwayVersion===3?Array.isArray(r.steps)&&r.steps.length===3&&r.steps.every(v=>typeof v==='boolean'):r.pathwayVersion===2?Number.isInteger(r.completed)&&r.completed>=0&&r.completed<=4&&r.stage===Math.min(r.completed+1,4)&&(r.completed===0||r.evidence.trim()):r.stage<4||r.evidence.trim());
 return values.map(r=>{if(!r||!text(r.id,200)||!r.id||ids.has(r.id)||!text(r.school,500)||!r.school.trim()||!/^Circuit [1-8]$/.test(r.circuit)||!details(r)||typeof r.active!=='boolean'||!text(r.updatedAt,100)||!Number.isFinite(Date.parse(r.updatedAt)))throw new Error('Each focus school needs a school, priority, valid stage, advisor and date. Confirm completed steps with a brief evidence note.');const key=schoolKey(r.circuit,r.school);if(keys.has(key))throw new Error('This school is already in the focus school list. Edit or reactivate its existing record.');keys.add(key);ids.add(r.id);if(!Array.isArray(r.history)||r.history.length>1000||r.history.some(h=>!details(h)||typeof h.active!=='boolean'||!Number.isFinite(Date.parse(h.updatedAt))))throw new Error('Invalid focus school history.');return {...r,school:r.school.trim(),priority:r.priority.trim(),nextStep:r.nextStep.trim(),evidence:r.evidence.trim(),advisor:r.advisor.trim()};});
}
export function mergeFocus(current,incoming){const map=new Map(current.map(r=>[schoolKey(r.circuit,r.school),r]));for(const r of incoming){const key=schoolKey(r.circuit,r.school),old=map.get(key);if(!old){map.set(key,r);continue;}const latest=r.updatedAt>old.updatedAt?r:old,other=latest===r?old:r;const {history,...snapshot}=other;const histories=[...old.history,...r.history];if(JSON.stringify({...latest,history:[]})!==JSON.stringify({...other,history:[]}))histories.push(snapshot);map.set(key,{...latest,history:[...new Map(histories.map(h=>[JSON.stringify(h),h])).values()]});}return validateFocus([...map.values()]);}
