export const minValue = -99;
export const maxValue = 99;
export const maxArrayLength = 8;

export type VisualInput =
  | {kind: 'copy-value'; start: number; replacement: number}
  | {kind: 'insertion-sort'; values: number[]}
  | {kind: 'function-call'; first: number; second: number};

const slideFields = {
  'copy-value': {start: 'Starting value', replacement: 'New value'},
  'insertion-sort': {values: 'Array values'},
  'function-call': {first: 'First number', second: 'Second number'},
} satisfies Record<VisualInput['kind'], Record<string, string>>;

export function controlsFor(visual: VisualInput) {
  return Object.entries(slideFields[visual.kind]).map(([name, label]) => ({
    name,
    label,
    array: name === 'values',
  }));
}

export function draftFor(visual: VisualInput) {
  return Object.fromEntries(Object.entries(visual).filter(([key]) => key !== 'kind').map(([key, value]) => [
    key, Array.isArray(value) ? value.join(', ') : String(value),
  ]));
}

function integer(raw: string | undefined) {
  const value = raw?.trim() ?? '';
  if (!/^[+-]?\d{1,4}$/.test(value)) return null;
  const result = Number(value);
  return result >= minValue && result <= maxValue ? result : null;
}

export function parseInput(kind: VisualInput['kind'], draft: Record<string, string>): VisualInput | string {
  if (kind === 'insertion-sort') {
    const values = (draft.values ?? '').split(',').map(integer);
    return values.length <= maxArrayLength && values.every(value => value !== null)
      ? {kind, values}
      : `Enter 1 to ${maxArrayLength} whole numbers from ${minValue} to ${maxValue}, separated by commas.`;
  }
  const [left, right] = kind === 'copy-value'
    ? [integer(draft.start), integer(draft.replacement)]
    : [integer(draft.first), integer(draft.second)];
  if (left === null || right === null) return `Enter whole numbers from ${minValue} to ${maxValue} in both boxes.`;
  return kind === 'copy-value'
    ? {kind, start: left, replacement: right}
    : {kind, first: left, second: right};
}

export function exampleCode(source: string, input: VisualInput) {
  const fields = draftFor(input);
  return source.replaceAll(/\{\{(\w+)\}\}/g, (placeholder, name: string) => fields[name] ?? placeholder);
}
