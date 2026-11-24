'use client';

import {useSyncExternalStore} from 'react';
import type {Mode} from './types';

const key = 'classcode-learning-v1';
const changeEvent = 'classcode-learning-change';
type Day = {xp: number; finishedLab: boolean; mistakes: number; rewards: string[]};
type Progress = {mode: Mode; xp: number; explored: string[]; labs: string[]; passed: string[]; mastered: string[]; days: Record<string, Day>};
const empty: Progress = {mode: 'explorer', xp: 0, explored: [], labs: [], passed: [], mastered: [], days: {}};
const emptyDay: Day = {xp: 0, finishedLab: false, mistakes: 0, rewards: []};
let localFallback: string | undefined;

function snapshot() {
  if (localFallback !== undefined) return localFallback;
  try { return localStorage.getItem(key) ?? ''; } catch { return ''; }
}

function subscribe(listener: () => void) {
  function sync(event: StorageEvent) {
    if (event.key === key || event.key === null) listener();
  }
  window.addEventListener('storage', sync);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener('storage', sync);
    window.removeEventListener(changeEvent, listener);
  };
}

function read(raw: string): Progress {
  if (!raw) return empty;
  try {
    const saved = JSON.parse(raw) as Partial<Progress> | null;
    if (!saved || !Array.isArray(saved.explored) || !Array.isArray(saved.labs) || !Array.isArray(saved.passed) ||
      !Array.isArray(saved.mastered) || !saved.days || typeof saved.xp !== 'number') return empty;
    return {...empty, ...saved};
  } catch { return empty; }
}

function dayKey(date: Date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
}

function update(change: (progress: Progress, today: Day) => Progress) {
  const current = read(snapshot());
  const date = dayKey(new Date());
  const next = change(current, current.days[date] ?? emptyDay);
  if (next === current) return;
  const raw = JSON.stringify(next);
  try { localStorage.setItem(key, raw); } catch { localFallback = raw; }
  window.dispatchEvent(new Event(changeEvent));
}

function withDay(progress: Progress, day: Day): Progress {
  return {...progress, days: {...progress.days, [dayKey(new Date())]: day}};
}

function award(progress: Progress, day: Day, reward: string, amount: number) {
  if (day.rewards.includes(reward)) return progress;
  return withDay({...progress, xp: progress.xp + amount}, {...day, xp: day.xp + amount, rewards: [...day.rewards, reward]});
}

export const learning = {
  mode: (mode: Mode) => update(progress => ({...progress, mode})),
  explore: (id: string) => update(progress => progress.explored.includes(id) ? progress : {...progress, explored: [...progress.explored, id]}),
  finish: (id: string) => update((progress, day) => withDay({
    ...progress,
    explored: Array.from(new Set([...progress.explored, id])),
    labs: Array.from(new Set([...progress.labs, id])),
  }, {...day, finishedLab: true})),
  answer: (id: string, correct: boolean) => update((progress, day) => correct
    ? award({...progress, passed: Array.from(new Set([...progress.passed, id]))}, day, `question:${id}`, 30)
    : withDay(progress, {...day, mistakes: Math.min(3, day.mistakes + 1)})),
  recall: (id: string, correct: boolean) => update((progress, day) => correct
    ? award({...progress, mastered: Array.from(new Set([...progress.mastered, id]))}, day, `recall:${id}`, 5)
    : {...progress, mastered: progress.mastered.filter(card => card !== id)}),
};

export function useLearningProgress() {
  const progress = read(useSyncExternalStore(subscribe, snapshot, () => ''));
  const date = new Date();
  const today = progress.days[dayKey(date)] ?? emptyDay;
  if (!today.finishedLab && today.xp === 0) date.setDate(date.getDate() - 1);
  let streak = 0;
  while (progress.days[dayKey(date)]) {
    const day = progress.days[dayKey(date)];
    if (!day.finishedLab && day.xp === 0) break;
    streak++;
    date.setDate(date.getDate() - 1);
  }
  return {progress, today, streak};
}
