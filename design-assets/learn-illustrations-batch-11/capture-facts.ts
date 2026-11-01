import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { scoreModelFacts } from '../../src/app/domain/science/engine-facts';
const paths = ['src/app/domain/recipe-score.ts', 'src/app/domain/pizza-engine.ts', 'src/app/domain/science/engine-facts.ts'];
const snapshot = {
  commit: execFileSync('git', ['rev-parse', 'HEAD'], {encoding:'utf8'}).trim(),
  generatedFrom: 'scoreModelFacts(); no sample recipe or score fabricated',
  model: scoreModelFacts(),
  sourceFiles: paths.map(path => ({path, sha256:createHash('sha256').update(readFileSync(path)).digest('hex')})),
  dInputs: ['fermentationHours', 'fermentationTempC', 'yeastType', 'yeastPct', 'hasPreFerment'],
  dScope: 'Overview of leavened dough only. The engine also has an unleavened branch. No health or FODMAP output is represented.',
};
writeFileSync('design-assets/learn-illustrations-batch-11/engine-facts.json', JSON.stringify(snapshot,null,2)+'\n');
