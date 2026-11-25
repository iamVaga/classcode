import 'server-only';

import {readdirSync, readFileSync} from 'node:fs';
import {join, relative} from 'node:path';
import {validateLessons, type ArenaLesson} from './schema';

const root = join(process.cwd(), 'content', 'learn');

export function loadArenaLessons() {
  const files = readdirSync(root, {recursive: true, withFileTypes: true})
    .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
    .map(entry => relative(root, join(entry.parentPath, entry.name)))
    .sort();
  if (files.length === 0) throw Error('No learning lessons found');
  // Keep the content root visible to the deployment file tracer.
  const lessons = validateLessons(files.map(file => JSON.parse(readFileSync(join(root, file), 'utf8')) as unknown));
  lessons.forEach((lesson, index) => {
    if (files[index] !== join(lesson.track, `${lesson.id}.json`)) {
      throw Error(`Lesson ${lesson.id} must be in content/learn/${lesson.track}/${lesson.id}.json`);
    }
  });
  return lessons;
}

let catalog: ArenaLesson[] | undefined;
export function arenaLessons() {
  return catalog ??= loadArenaLessons();
}
