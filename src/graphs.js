import {SECTIONS,sectionScores,schoolKey} from './advisor.js';
import {FOCUS_STAGES,focusChecks} from './focus.js';
import {scoreBasis} from './core.js';
export function districtGraphs(profiles,focusRecords,reports,today){
 const registered=profiles.filter(p=>p.inRegister),total=registered.length,assessed=registered.filter(p=>p.latest),outside=profiles.filter(p=>!p.inRegister).length;
 const levels=[['EMERGING','Emerging','#dc2626'],['ESTABLISHING','Establishing','#ea580c'],['INTEGRATED','Integrated','#2563eb'],['TRANSFORMATIVE','Transformative','#16a34a'],['NOT ASSESSED','Not assessed','#94a3b8']];
 const readiness=levels.map(([id,label,color])=>{const schools=registered.filter(p=>(p.latest?p.level:'NOT ASSESSED')===id).map(p=>({...p,graphDetail:p.latest?`${p.score.toFixed(1)}/5 · ${scoreBasis(p.latest)} indicators · ${p.latest.date}`:'No final assessment'}));return {id,label,color,value:schools.length,max:total,schools,display:`${schools.length} / ${total}`};});
 const areas=SECTIONS.map((s,i)=>{const schools=assessed.flatMap(p=>{const score=sectionScores(p.latest).find(c=>c.id===s.id).score;return score===null?[]:[{...p,graphDetail:`${score.toFixed(1)}/5 · ${p.latest.date}`,areaScore:score}];});const average=schools.length?schools.reduce((sum,p)=>sum+p.areaScore,0)/schools.length:null;return {id:s.id,label:s.name,color:['#0f766e','#2563eb','#7c3aed','#c50076'][i],value:average,max:5,schools,display:average===null?'Not assessed':`${average.toFixed(1)} / 5`};});
 const keys=new Set(profiles.map(p=>p.key)),active=focusRecords.filter(r=>r.active&&keys.has(schoolKey(r.circuit,r.school))),focusTotal=active.length;
 const pathway=FOCUS_STAGES.map((label,i)=>{const schools=active.filter(r=>focusChecks(r,reports,today)[i]).map(r=>({...profiles.find(p=>p.key===schoolKey(r.circuit,r.school)),graphDetail:i===0?'Finalised Capture findings report available':`Manually confirmed · ${r.date} · ${r.advisor}`}));return {id:String(i),label,color:['#2fa6aa','#8eaf00','#287fc0','#c50076','#7c3aed'][i],value:schools.length,max:focusTotal,schools,display:`${schools.length} / ${focusTotal}`};});
 return {total,assessed:assessed.length,outside,legacy:assessed.filter(p=>scoreBasis(p.latest)===11).length,current:assessed.filter(p=>scoreBasis(p.latest)===14).length,readiness,areas,pathway,focusTotal};
}
