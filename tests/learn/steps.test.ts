import {describe, expect, it} from 'vitest';
import {exampleCode, parseInput} from '../../lib/learn/engine/input';
import {copyValue, functionCall, generateSteps, insertionSort} from '../../lib/learn/engine/steps';

describe('copying a value', () => {
  it('creates, copies, rebinds, and prints the original value in order', () => {
    const steps = copyValue({kind: 'copy-value', start: -4, replacement: 8});
    expect(steps.map(step => step.highlightLines)).toEqual([[], [1], [2], [3], [4]]);
    expect(steps.map(step => step.state.kind === 'memory' && step.state.bindings.map(binding => [binding.name, binding.value]))).toEqual([
      [], [['original', -4]], [['original', -4], ['copied', -4]],
      [['original', 8], ['copied', -4]], [['original', 8], ['copied', -4]],
    ]);
    expect(steps[3].meta.prediction?.answer).toBe(0);
    expect(steps.at(-1)?.meta.output).toBe('-4');
  });
});

describe('insertion sort', () => {
  it('records comparisons separately from swaps and preserves past steps', () => {
    const input = [3, -2, -2];
    const steps = insertionSort({kind: 'insertion-sort', values: input});
    expect(steps.map(step => [step.state.kind === 'array' && step.state.values, step.meta.comparisons, step.meta.swaps])).toEqual([
      [[3, -2, -2], 0, 0],
      [[3, -2, -2], 1, 0],
      [[-2, 3, -2], 1, 1],
      [[-2, 3, -2], 2, 1],
      [[-2, -2, 3], 2, 2],
      [[-2, -2, 3], 3, 2],
      [[-2, -2, 3], 3, 2],
      [[-2, -2, 3], 3, 2],
    ]);
    expect(steps.flatMap(step => step.meta.prediction ? [step.meta.prediction.answer] : [])).toEqual([0, 0, 1]);
    expect(input).toEqual([3, -2, -2]);
  });

  it('runs a one-element array without comparisons and keeps equal values in place', () => {
    expect(insertionSort({kind: 'insertion-sort', values: [0]}).map(step => step.highlightLines)).toEqual([[1], [7]]);
    const sorted = insertionSort({kind: 'insertion-sort', values: [-2, -2, 0, 4]});
    expect(sorted.at(-1)?.meta).toEqual({output: '[-2,-2,0,4]', comparisons: 3, swaps: 0});
  });
});

describe('function calls', () => {
  it('binds parameters, creates a local, pops the frame, and prints the returned value', () => {
    const steps = functionCall({kind: 'function-call', first: -1, second: 3});
    expect(steps.map(step => step.highlightLines)).toEqual([[1], [5, 1], [2], [3, 5], [6]]);
    expect(steps.map(step => step.state.kind === 'stack' && step.state.frames.map(frame => [
      frame.label, frame.bindings.map(binding => [binding.name, binding.value]),
    ]))).toEqual([
      [['Main program', []]],
      [['Main program', []], ['add', [['a', -1], ['b', 3]]]],
      [['Main program', []], ['add', [['a', -1], ['b', 3], ['total', 2]]]],
      [['Main program', [['result', 2]]]],
      [['Main program', [['result', 2]]]],
    ]);
    expect(steps.at(-1)?.meta.output).toBe('2');
    expect(generateSteps({kind: 'function-call', first: -1, second: 3})).toEqual(steps);
  });
});

describe('editable inputs', () => {
  it('accepts signed integers and renders the same values in the example code', () => {
    const values = parseInput('insertion-sort', {values: '-99, +2, 0'});
    expect(values).toEqual({kind: 'insertion-sort', values: [-99, 2, 0]});
    if (typeof values !== 'string') expect(exampleCode('values = [{{values}}]', values)).toBe('values = [-99, 2, 0]');
    expect(parseInput('copy-value', {start: '0', replacement: '99'})).toEqual({kind: 'copy-value', start: 0, replacement: 99});
  });

  it.each(['', ' ', '1,', '1.5', '100', '2e4', '1,2,3,4,5,6,7,8,9'])('rejects invalid array input %j', values => {
    expect(parseInput('insertion-sort', {values})).toEqual(expect.any(String));
  });
});
