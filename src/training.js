import sessions from './training-sessions.json' with {type:'json'};
export const TRAINING_SNAPSHOT='2026-11-13';
export const TRAINING_SOURCE='https://wcedtpd.pages.dev/sessions';
export const TRAINING_NEEDS={
 'culture-2':{name:'Formal Training Intake',courses:['Office Online Fundamentals','Google Fundamentals 1: Account and Google Chrome','Google Fundamentals 2: Drive','Google Fundamentals 3: Docs and Collaboration'],reason:'Build an agreed starting point for formal digital-skills development; participation still needs follow-up.'},
 'teaching-0':{name:'ePortal/Teletuks Use',courses:['Integrating digital resources from the ePortal','Ease of Access with QR Codes and Bit.ly links'],reason:'Help teachers find and share digital curriculum resources.'},
 'teaching-1':{name:'LMS Usage at School',courses:['Google Classroom, an introduction','Working on MS Teams for Teachers','Create Google Sites'],reason:'Develop practical platform skills for sharing resources and supporting learning.'},
 'teaching-2':{name:'Pedagogical Shift',courses:['Assessment for Learning: Low-tech Solutions','Wayground for Formative Assessment','Orientation to Google Forms','Digital Assessment with Formative','Teaching with Videos','Flipped classroom with Google Slides','Quizlet for Content Consolidation','ClassPoint: Power up your PowerPoint','ePedagogy: Building a Digital Lesson'],reason:'Support purposeful assessment, learner engagement and lesson design through digital tools.'},
 'teaching-3':{name:'Teacher Content Creation',courses:['Digital Design with Canva','Improved Presentation Skills','Create Digital books: Book Creator','Create Google Sites','Tech Hour: PowerPoint tips and tricks for creative design'],reason:'Build confidence in creating digital teaching resources.'},
 'teaching-4':{name:'Learner Digital Literacy',courses:['Introduction to Cyber Wellness Education','Practical Strategies for Cyber Wellness in the Classroom','Foundation Phase EdTech Tools for Reading','Foundation Phase EdTech Tools for Numeracy','Digital Puzzles for Primary School Learning'],reason:'Give teachers strategies for learner digital confidence and responsible use. Check phase suitability.'}
};
export function recommendedTraining(report,today,{localOnly=true}={}) {
 if(!report)return [];
 return sessions.filter(s=>s.date>=today&&(!localOnly||s.district==='EDEN & CENTRAL KAROO')).map(session=>{
  const needs=Object.entries(TRAINING_NEEDS).filter(([id,need])=>Number.isInteger(report.scores[id])&&report.scores[id]<=3&&need.courses.includes(session.title)).map(([id,n])=>({id,name:n.name,score:report.scores[id],reason:n.reason}));
  return {...session,needs};
 }).filter(s=>s.needs.length).sort((a,b)=>Math.min(...a.needs.map(n=>n.score))-Math.min(...b.needs.map(n=>n.score))||a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
}
export function trainingAction(profile,session,today){
 return {id:crypto.randomUUID(),school:profile.school,circuit:profile.circuit,owner:'E. van der Berg',date:today,dueDate:session.date,type:'Training',status:'Planned',summary:`Recommend ${session.title} (${session.date}, ${session.time}; ${session.district}). Needs: ${session.needs.map(n=>`${n.name} ${n.score}/5`).join('; ')}.`,notes:'Confirm session details and eligibility on the eTPD portal. Attendance and classroom implementation have not yet been verified.',completedDate:'',updatedAt:new Date().toISOString(),training:{sessionId:session.id,title:session.title,date:session.date,district:session.district,attendance:'Not confirmed',implementation:'Not checked',sourceUrl:TRAINING_SOURCE,snapshotDate:TRAINING_SNAPSHOT}};
}
export function validateTrainingLink(value){
 if(value==null)return undefined;
 for(const field of ['sessionId','title','date','district'])if(typeof value[field]!=='string'||!value[field]||value[field].length>500)throw new Error('Invalid linked training session.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value.date)||!Number.isFinite(Date.parse(value.date)))throw new Error('Invalid training date.');
 if(!['Not confirmed','Confirmed','Did not attend'].includes(value.attendance)||!['Not checked','Observed','Not yet evident'].includes(value.implementation))throw new Error('Invalid training follow-up status.');
 return {sessionId:value.sessionId,title:value.title,date:value.date,district:value.district,attendance:value.attendance,implementation:value.implementation,sourceUrl:TRAINING_SOURCE,snapshotDate:TRAINING_SNAPSHOT};
}
