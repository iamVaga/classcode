import {expect, it, vi} from 'vitest';
import sample from '../../content/learn/python/copying-a-value.json';
import functions from '../../content/learn/python/function-frames.json';
import {loadArenaLessons} from '../../lib/learn/loader';
import {lessonSchema, validateLessons} from '../../lib/learn/schema';

vi.mock('server-only', () => ({}));

it('loads and validates every curriculum file, with file names matching track and ID', () => {
  const rows = loadArenaLessons();
  expect(rows.map(lesson => lesson.visual.kind).sort()).toEqual(['copy-value', 'function-call', 'insertion-sort']);
  for (const lesson of rows) {
    expect(lesson.challenges.length).toBeGreaterThanOrEqual(5);
    expect(lesson.flashcards.length).toBeGreaterThanOrEqual(4);
  }
});

it('rejects missing explanation levels, malformed answers, and unknown sample inputs', () => {
  const badAnswer = {...sample.challenges[0], answer: 9};
  const result = lessonSchema.safeParse({
    ...sample,
    challenges: [badAnswer, ...sample.challenges.slice(1)],
    codeSamples: [{...sample.codeSamples[0], source: '{{missing}}'}],
  });
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues.map(issue => issue.path)).toContainEqual(['challenges', 0, 'answer']);
    expect(result.error.issues.map(issue => issue.path)).toContainEqual(['codeSamples', 0, 'source']);
  }
  expect(lessonSchema.safeParse({...sample, explanations: {explorer: 'One explanation'}}).success).toBe(false);
  expect(lessonSchema.safeParse({...sample, codeSamples: []}).success).toBe(false);
});

it('rejects duplicate IDs, missing prerequisite links, and prerequisite cycles', () => {
  expect(() => validateLessons([sample, sample])).toThrow('Duplicate lesson ID');
  expect(() => validateLessons([functions])).toThrow('Unknown prerequisite copying-a-value');
  expect(() => validateLessons([{...sample, prerequisites: [functions.id]}, functions])).toThrow('Circular prerequisites');
});
