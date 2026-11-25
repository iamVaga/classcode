import type {VisualInput} from './input';

export type Binding = {name: string; value: number};
export type StackFrame = {label: string; bindings: readonly Binding[]};
export type State =
  | {kind: 'memory'; bindings: readonly Binding[]; active?: string}
  | {kind: 'array'; values: readonly number[]; active: readonly number[]; sorted?: boolean}
  | {kind: 'stack'; frames: readonly StackFrame[]};

export type Prediction = {prompt: string; choices: readonly [string, string]; answer: 0 | 1};
export type Step = {
  state: State;
  highlightLines: readonly number[];
  note: string;
  meta: {output?: string; comparisons?: number; swaps?: number; prediction?: Prediction};
};

export function copyValue({start, replacement}: Extract<VisualInput, {kind: 'copy-value'}>): Step[] {
  const before = [{name: 'original', value: start}];
  const copy = {name: 'copied', value: start};
  const afterCopy = [...before, copy];
  const afterChange = [{name: 'original', value: replacement}, copy];
  return [
    {state: {kind: 'memory', bindings: []}, highlightLines: [], note: 'Start with no names. Each box will show what a name refers to.', meta: {}},
    {state: {kind: 'memory', bindings: before, active: 'original'}, highlightLines: [1], note: `The name original now refers to ${start}.`, meta: {}},
    {state: {kind: 'memory', bindings: afterCopy, active: 'copied'}, highlightLines: [2], note: `Both names now refer to ${start}.`, meta: {}},
    {
      state: {kind: 'memory', bindings: afterChange, active: 'original'},
      highlightLines: [3],
      note: `Python assigns ${replacement} to original. The name copied still refers to ${start}.`,
      meta: {prediction: {prompt: 'What happens to copied when you assign a value to original?', choices: ['It keeps its value', 'It follows original'], answer: 0}},
    },
    {
      state: {kind: 'memory', bindings: afterChange, active: 'copied'},
      highlightLines: [4],
      note: `print(copied) reads copied and shows ${start}.`,
      meta: {output: String(start)},
    },
  ];
}

export function insertionSort({values: input}: Extract<VisualInput, {kind: 'insertion-sort'}>): Step[] {
  const values = [...input];
  let comparisons = 0;
  let swaps = 0;
  const steps: Step[] = [];
  function record(note: string, highlightLines: number[], active: number[], prediction?: Prediction) {
    steps.push({state: {kind: 'array', values: [...values], active}, highlightLines, note, meta: {comparisons, swaps, prediction}});
  }
  record('Begin with the first value as a sorted group. Add each next value to that group.', [1], [0]);
  for (let index = 1; index < values.length; index++) {
    for (let position = index; position > 0; position--) {
      const left = values[position - 1];
      const right = values[position];
      const active = [position - 1, position];
      comparisons++;
      record(`Compare ${left} on the left with ${right} on the right.`, [4], active);
      const move = right < left;
      const prediction = {prompt: 'Will these two neighbors swap?', choices: ['Swap them', 'Keep their order'], answer: move ? 0 : 1} as const;
      if (!move) {
        record(`${right} can stay after ${left}. This pass is done.`, [4], active, prediction);
        break;
      }
      [values[position - 1], values[position]] = [right, left];
      swaps++;
      record(`Move ${right} one place left by swapping it with ${left}.`, [5, 6], active, prediction);
    }
  }
  steps.push({
    state: {kind: 'array', values, active: [], sorted: true},
    highlightLines: [7],
    note: `The array is sorted. It took ${comparisons} comparisons and ${swaps} swaps.`,
    meta: {comparisons, swaps, output: JSON.stringify(values)},
  });
  return steps;
}

export function functionCall({first, second}: Extract<VisualInput, {kind: 'function-call'}>): Step[] {
  const total = first + second;
  const moduleFrame = {label: 'Main program', bindings: []};
  const parameters = [{name: 'a', value: first}, {name: 'b', value: second}];
  const caller = {label: 'Main program', bindings: [{name: 'result', value: total}]};
  return [
    {state: {kind: 'stack', frames: [moduleFrame]}, highlightLines: [1], note: 'Python defines add. The main program is the only active frame.', meta: {}},
    {
      state: {kind: 'stack', frames: [moduleFrame, {label: 'add', bindings: parameters}]},
      highlightLines: [5, 1],
      note: `Call add with ${first} and ${second}. A new frame holds its parameters a and b.`,
      meta: {},
    },
    {
      state: {kind: 'stack', frames: [moduleFrame, {label: 'add', bindings: [...parameters, {name: 'total', value: total}]}]},
      highlightLines: [2],
      note: `Inside add, store ${first} + ${second} as total. Its value is ${total}.`,
      meta: {},
    },
    {
      state: {kind: 'stack', frames: [caller]},
      highlightLines: [3, 5],
      note: `Return ${total}, remove the add frame, and assign the result in the main program.`,
      meta: {prediction: {prompt: 'Where will result live after add returns?', choices: ['Inside add', 'In the main program'], answer: 1}},
    },
    {
      state: {kind: 'stack', frames: [caller]},
      highlightLines: [6],
      note: `The main program prints result. The output is ${total}.`,
      meta: {output: String(total)},
    },
  ];
}

export function generateSteps(input: VisualInput): Step[] {
  switch (input.kind) {
    case 'copy-value': return copyValue(input);
    case 'insertion-sort': return insertionSort(input);
    case 'function-call': return functionCall(input);
  }
}
