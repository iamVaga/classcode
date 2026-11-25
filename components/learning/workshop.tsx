'use client';

import type {ArenaLesson} from '@/lib/learn/schema';
import {useLearningProgress} from '@/lib/learn/progress';
import LearningModes from './modes';
import Walkthrough from './walkthrough';
import WorkshopPractice from './workshop-practice';

export default function Workshop({lesson}: {lesson: ArenaLesson}) {
  const {progress: {mode}} = useLearningProgress();
  return <>
    <LearningModes mode={mode}/>
    <Walkthrough lesson={lesson} explanation={lesson.explanations[mode]}/>
    <WorkshopPractice key={mode} lesson={lesson} mode={mode}/>
  </>;
}
