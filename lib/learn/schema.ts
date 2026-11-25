import {z} from 'zod';
import {controlsFor, maxArrayLength, maxValue, minValue} from './engine/input';
import {generateSteps} from './engine/steps';

const id = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(64);
const short = z.string().trim().min(1).max(220);
const paragraph = z.string().trim().min(1).max(640).refine(text => text.split(/\s+/).length <= 80, 'Use 80 words or fewer');
const value = z.number().int().min(minValue).max(maxValue);
const mode = z.enum(['explorer', 'builder', 'pro']);

const visual = z.discriminatedUnion('kind', [
  z.strictObject({kind: z.literal('copy-value'), start: value, replacement: value}),
  z.strictObject({kind: z.literal('insertion-sort'), values: z.array(value).min(1).max(maxArrayLength)}),
  z.strictObject({kind: z.literal('function-call'), first: value, second: value}),
]);

const base = {id, mode, prompt: short, hint: short, explanation: paragraph};
const challenge = z.discriminatedUnion('kind', [
  z.strictObject({...base, kind: z.literal('predict'), options: z.array(short).min(2).max(4), answer: z.number().int().nonnegative()}),
  z.strictObject({...base, kind: z.literal('bug'), options: z.array(short).min(2).max(4), answer: z.number().int().nonnegative()}),
  z.strictObject({...base, kind: z.literal('complexity'), options: z.array(short).min(2).max(4), answer: z.number().int().nonnegative()}),
  z.strictObject({...base, kind: z.literal('blank'), answers: z.array(short).min(1).max(5)}),
  z.strictObject({...base, kind: z.literal('parsons'), lines: z.array(short).min(2).max(5)}),
]).superRefine((question, ctx) => {
  if ('options' in question && question.answer >= question.options.length) {
    ctx.addIssue({code: 'custom', path: ['answer'], message: 'Answer must point to an option'});
  }
  const choices = 'options' in question ? question.options : 'lines' in question ? question.lines : question.answers;
  if (new Set(choices).size !== choices.length) ctx.addIssue({code: 'custom', message: 'Choices must be distinct'});
});

export const lessonSchema = z.strictObject({
  id,
  track: z.enum(['python', 'dsa', 'sql']),
  title: short,
  summary: short,
  prerequisites: z.array(id).max(8),
  analogy: paragraph,
  explanations: z.strictObject({explorer: paragraph, builder: paragraph, pro: paragraph}),
  visual,
  codeSamples: z.array(z.strictObject({title: short, language: z.enum(['python', 'sql']), source: z.string().min(1).max(4000)})).min(1),
  remember: z.array(short).min(1).max(4),
  commonMistake: paragraph,
  challenges: z.array(challenge).min(5),
  flashcards: z.array(z.strictObject({id, front: short, back: paragraph})).min(4),
}).superRefine((lesson, ctx) => {
  for (const key of ['prerequisites', 'challenges', 'flashcards'] as const) {
    const ids = lesson[key].map(entry => typeof entry === 'string' ? entry : entry.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({code: 'custom', path: [key], message: 'IDs must be unique'});
  }
  if (new Set(lesson.challenges.map(question => question.kind)).size < 3 ||
      new Set(lesson.challenges.map(question => question.mode)).size < 3) {
    ctx.addIssue({code: 'custom', path: ['challenges'], message: 'Include at least three challenge kinds and all three explanation levels'});
  }
  const inputs = new Set(controlsFor(lesson.visual).map(field => field.name));
  lesson.codeSamples.forEach(({source}, index) => {
    for (const match of source.matchAll(/\{\{(\w+)\}\}/g)) {
      if (!inputs.has(match[1])) ctx.addIssue({code: 'custom', path: ['codeSamples', index, 'source'], message: `Unknown visual input ${match[1]}`});
    }
  });
  const lines = lesson.codeSamples[0]?.source.split('\n').length ?? 0;
  if (generateSteps(lesson.visual).some(step => step.highlightLines.some(line => line < 1 || line > lines))) {
    ctx.addIssue({code: 'custom', path: ['codeSamples', 0, 'source'], message: 'Example must contain every line highlighted by its visual'});
  }
});

export type ArenaLesson = z.infer<typeof lessonSchema>;
export type ArenaChallenge = ArenaLesson['challenges'][number];

export function validateLessons(content: readonly unknown[]) {
  const lessons = content.map(lesson => lessonSchema.parse(lesson));
  const byId = new Map(lessons.map(lesson => [lesson.id, lesson]));
  if (byId.size !== lessons.length) throw Error('Duplicate lesson ID');
  const checked = new Set<string>();
  const path = new Set<string>();
  function visit(lessonId: string) {
    if (checked.has(lessonId)) return;
    if (path.has(lessonId)) throw Error(`Circular prerequisites at ${lessonId}`);
    const lesson = byId.get(lessonId);
    if (!lesson) throw Error(`Unknown prerequisite ${lessonId}`);
    path.add(lessonId);
    lesson.prerequisites.forEach(visit);
    path.delete(lessonId);
    checked.add(lessonId);
  }
  for (const lesson of lessons) visit(lesson.id);
  return lessons;
}
