import {readFileSync} from 'node:fs';
const path=process.argv[2]||'artifacts/lighthouse-mobile.json';
const report=JSON.parse(readFileSync(path,'utf8'));
const budgets=['performance','accessibility','best-practices','seo'];
const failures=budgets.map(name=>({name,score:report.categories?.[name]?.score})).filter(item=>typeof item.score!=='number'||item.score<0.9);
if(failures.length){console.error('Lighthouse mobile budgets need attention:',failures.map(item=>`${item.name}=${item.score??'missing'}`).join(', '));process.exitCode=1}
else console.log('Lighthouse mobile scores meet the 90/100 budget:',budgets.map(name=>`${name}=${Math.round(report.categories[name].score*100)}`).join(', '));
