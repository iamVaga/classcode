import type {Step} from './steps';

export type Timeline = {
  index: number;
  playing: boolean;
  speed: number;
  predictFirst: boolean;
  pending: number | null;
  feedback: string;
};

export const initialTimeline: Timeline = {index: 0, playing: false, speed: 1, predictFirst: false, pending: null, feedback: ''};

type Action =
  | {type: 'seek'; index: number; steps: readonly Step[]; autoplay?: boolean}
  | {type: 'play'; last: number}
  | {type: 'speed'; rate: number}
  | {type: 'predict'; enabled: boolean}
  | {type: 'reveal'; feedback: string}
  | {type: 'reset'};

export function updateTimeline(state: Timeline, action: Action): Timeline {
  switch (action.type) {
    case 'seek': {
      const last = action.steps.length - 1;
      const index = Math.max(0, Math.min(last, action.index));
      const gate = state.predictFirst
        ? action.steps.findIndex((step, i) => i > state.index && i <= index && step.meta.prediction)
        : -1;
      if (gate !== -1) {
        return {...state, index: gate - 1, playing: false, pending: gate, feedback: ''};
      }
      return {...state, index, playing: Boolean(action.autoplay && index < last), pending: null, feedback: ''};
    }
    case 'play':
      return {...state, index: state.index === action.last && !state.playing ? 0 : state.index, playing: !state.playing, feedback: ''};
    case 'speed':
      return {...state, speed: action.rate};
    case 'predict':
      return {...state, predictFirst: action.enabled, playing: false, pending: null, feedback: ''};
    case 'reveal':
      return state.pending === null ? state : {...state, index: state.pending, pending: null, feedback: action.feedback};
    case 'reset':
      return {...initialTimeline, speed: state.speed, predictFirst: state.predictFirst};
  }
}
