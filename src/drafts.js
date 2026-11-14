import {INDICATORS} from './core.js';
export const DRAFTS_KEY='ecked-school-report-drafts-v1';
export function validateDrafts(value){
 if(!Array.isArray(value)||value.length>10000)throw new Error('Expected up to 10,000 report drafts.');
 const ids=new Set();return value.map(d=>{
  if(!d||typeof d.id!=='string'||!d.id||ids.has(d.id)||typeof d.updatedAt!=='string'||!Number.isFinite(Date.parse(d.updatedAt))||!d.data||typeof d.data!=='object')throw new Error('Invalid report draft.');
  ids.add(d.id);const data={};for(const k of ['circuit','school','date','staff','designation','advisor','notes','informationSource','supportProvided']){
   const v=d.data[k]??'';if(typeof v!=='string'||v.length>(k==='notes'?50000:k==='supportProvided'?10000:500))throw new Error('Invalid draft field.');data[k]=v;
  }
  data.scores={};for(const k of INDICATORS){const n=d.data.scores?.[k];if(n!==undefined){if(!Number.isInteger(n)||n<1||n>5)throw new Error('Invalid draft score.');data.scores[k]=n;}}
  return {id:d.id,updatedAt:d.updatedAt,reportId:typeof d.reportId==='string'||Number.isSafeInteger(d.reportId)?d.reportId:null,data};
 });
}
export function writeCollections(storage,changes){
 const previous=changes.map(([key])=>[key,storage.getItem(key)]);
 try {for(const [key,value]of changes)storage.setItem(key,JSON.stringify(value));}
 catch(error){let restored=true;for(const [key,value]of previous){try{if(value===null)storage.removeItem(key);else storage.setItem(key,value);}catch{restored=false;}}throw new Error(restored?'Could not save changes. Existing records were restored.':'Storage failed and could not be fully restored. Export your current records before closing.');}
}
