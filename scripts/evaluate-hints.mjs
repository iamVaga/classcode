import {analyzePythonError} from '../lib/analyser.ts';
import {beginnerMistakes} from '../tests/analyser-eval-set.mjs';

let correct=0,leaks=0;
for(const mistake of beginnerMistakes){
 const result=analyzePythonError(mistake.traceback,mistake.source);
 if(result.kind===mistake.kind)correct++;
 for(const level of [1,2,3])if(result.hints[level].toLowerCase().includes(mistake.secret.toLowerCase()))leaks++;
}
const accuracy=correct/beginnerMistakes.length*100,answerLeakRate=leaks/(beginnerMistakes.length*3)*100;
console.log(`Beginner mistake set: ${beginnerMistakes.length}`);
console.log(`Hint classification accuracy: ${accuracy.toFixed(1)}% (${correct}/${beginnerMistakes.length})`);
console.log(`Pre-fix answer leak rate: ${answerLeakRate.toFixed(2)}% (${leaks} hint levels)`);
if(beginnerMistakes.length<50||accuracy<90||answerLeakRate>2)process.exitCode=1;
