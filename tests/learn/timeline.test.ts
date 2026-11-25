import {expect, it} from 'vitest';
import {copyValue} from '../../lib/learn/engine/steps';
import {initialTimeline, updateTimeline} from '../../lib/learn/engine/timeline';

const steps = copyValue({kind: 'copy-value', start: 3, replacement: 7});

it('seeks back and forth and stops playing at the final step', () => {
  const playing = updateTimeline(initialTimeline, {type: 'play', last: 4});
  const final = updateTimeline(playing, {type: 'seek', index: 9, steps, autoplay: true});
  expect(final).toMatchObject({index: 4, playing: false});
  expect(updateTimeline(final, {type: 'seek', index: 1, steps})).toMatchObject({index: 1, playing: false});
  expect(updateTimeline(final, {type: 'play', last: 4})).toMatchObject({index: 0, playing: true});
});

it('pauses a forward seek before the next prediction and reveals just that step', () => {
  const state = updateTimeline(initialTimeline, {type: 'predict', enabled: true});
  const pause = updateTimeline(state, {type: 'seek', index: 4, steps, autoplay: true});
  expect(pause).toMatchObject({index: 2, pending: 3, playing: false});
  const revealed = updateTimeline(pause, {type: 'reveal', feedback: 'Your prediction matches.'});
  expect(revealed).toMatchObject({index: 3, pending: null, feedback: 'Your prediction matches.'});
  expect(updateTimeline(revealed, {type: 'seek', index: 4, steps})).toMatchObject({index: 4, pending: null, feedback: ''});
});

it('returns to the first step with playback stopped and keeps the learner’s controls', () => {
  const state = {...initialTimeline, index: 2, pending: 3, speed: 2, predictFirst: true, playing: true};
  expect(updateTimeline(state, {type: 'reset'})).toEqual({...initialTimeline, speed: 2, predictFirst: true});
});
