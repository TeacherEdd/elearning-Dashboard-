export const CHALLENGE_LABELS={
 'cyber-0':'Online safety and privacy','cyber-1':'Responsible digital behaviour','cyber-2':'Cyberbullying and reporting',
 'env-0':'Connectivity quality','env-1':'ICT equipment security','env-2':'Technical maintenance',
 'culture-0':'ICT policy and integration','culture-1':'Leadership support','culture-2':'Formal teacher training','culture-3':'Peer support and mentoring',
 'teaching-0':'Digital curriculum resource use','teaching-2':'Teaching with technology','teaching-3':'Teacher content creation','teaching-4':'Learner digital literacy'
};
// Each profile contains its latest final assessment only. Unknown scores are not challenges.
export function rankedChallenges(profiles){
 return Object.entries(CHALLENGE_LABELS).map(([key,name])=>{const schools=profiles.filter(p=>Number.isInteger(p.latest?.scores?.[key])&&p.latest.scores[key]<=3&&p.latest.scores[key]>=1).map(p=>({...p,challengeScore:p.latest.scores[key]}));const bands=[1,2,3].map(n=>schools.filter(p=>p.challengeScore===n).length);return {key,name,schools,count:schools.length,bands,average:schools.length?schools.reduce((s,p)=>s+p.challengeScore,0)/schools.length:null,severity:bands[0]?'critical':bands[1]?'priority':'developing'};}).filter(r=>r.count).sort((a,b)=>b.count-a.count||a.average-b.average||a.key.localeCompare(b.key));
}
