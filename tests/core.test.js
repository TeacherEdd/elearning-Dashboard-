import test from 'node:test';
import assert from 'node:assert/strict';
import {INDICATORS, calculateReadiness, calculateDistrictInsights, validateReports, mergeReports, csvExport} from '../src/core.js';
const scores = n => Object.fromEntries(INDICATORS.map(k=>[k,n]));
const report = (id=1,n=3,date='2026-11-13') => ({id,school:'School A',circuit:'Circuit 8',date,staff:'Principal',designation:'Principal',advisor:'Advisor',scores:scores(n),notes:''});
test('maturity thresholds use raw averages and exclude invalid or unknown scores',()=>{
  assert.equal(calculateReadiness({}).label,'PENDING');
  assert.equal(calculateReadiness(scores(1)).label,'EMERGING');
  for (const [average,expected] of [[2.5,'EMERGING'],[3.5,'INTEGRATED'],[4.5,'TRANSFORMATIVE']]) {
    const vals={'env-0':Math.floor(average),'env-1':Math.ceil(average)};
    assert.equal(calculateReadiness(vals).label,expected);
  }
  assert.equal(calculateReadiness({...scores(3),extra:5,'env-0':99}).score,'3.0');
});
test('district overview counts only latest visit per school and retains other schools',()=>{
 const second={...report(3,4),school:'School B'};
 const result=calculateDistrictInsights([report(1,1,'2026-10-01'),report(2,5),second]);
 assert.equal(result.total,2); assert.equal(result.avg,'4.5');assert.equal(result.level,'TRANSFORMATIVE');assert.equal(result.atRisk,0);
});
test('backup rejects incomplete, invalid, duplicate and impossible-date reports',()=>{
 assert.equal(validateReports([report()]).length,1);
 for(const invalid of [{...report(),scores:{}},{...report(),date:'2026-02-30'},{...report(),scores:{...scores(3),'env-0':'3'}},{...report(),staff:''}]) assert.throws(()=>validateReports([invalid]));
 assert.throws(()=>validateReports([report(),report()]));
 assert.deepEqual(validateReports([]),[]);
});
test('restore discards untrusted derived analysis and merges numeric/string IDs',()=>{
 assert.equal(validateReports([{...report(),aiAnalysis:{executive_summary:'untrusted'}}])[0].aiAnalysis,undefined);
 const merged=mergeReports([report(1),report(2)],[report('1',5)]);
 assert.equal(merged.length,2);assert.equal(merged.find(r=>String(r.id)==='1').scores['env-0'],5);
});
test('CSV quotes multiline text and neutralizes spreadsheet formulas',()=>{
 const out=csvExport([{...report(),school:'=HYPERLINK("bad")',notes:'line 1\nline "2"'}]);
 assert.ok(out.includes('"\'=HYPERLINK(""bad"")"'));assert.ok(out.includes('line ""2""'));assert.ok(out.startsWith('\uFEFF'));
});

test('eleven-indicator scoring ignores LMS while preserving the original legacy value',()=>{
 const legacy={...report(),scores:{...scores(4),'teaching-1':1,'teaching-2':5},informationSource:'Staff reported'};
 const restored=validateReports([legacy])[0];assert.equal(restored.scores['teaching-1'],1);assert.equal(restored.scores['teaching-2'],5);assert.equal(restored.informationSource,'Staff reported');assert.equal(calculateReadiness(restored.scores).score,'4.1');assert.equal(INDICATORS.length,11);assert.ok(!INDICATORS.includes('teaching-1'));
 const exported=csvExport([restored]);assert.ok(!exported.split('\r\n')[0].includes('teaching-1'));
});
