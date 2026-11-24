import type {Cell, Frame, Scene, Table, Trace} from './types';

export const labOptions: Record<string, {label: string; choices: (string | number)[]}> = {
  loops: {label: 'Range stop', choices: [5, 3, 7]},
  recursion: {label: 'Starting number', choices: [3, 2, 4]},
  'stack-queue': {label: 'Removal rule', choices: ['Stack', 'Queue']},
  'bubble-sort': {label: 'Starting order', choices: ['Mixed', 'Reverse', 'Already sorted']},
  'binary-search': {label: 'Find', choices: [12, 4, 10]},
  'linked-list': {label: 'Action', choices: ['Walk the list', 'Insert X']},
  'tree-traversal': {label: 'Visit order', choices: ['Depth-first', 'Breadth-first']},
  'hash-map': {label: 'Look up key', choices: [6, 2, 10]},
  select: {label: 'Minimum pages', choices: [100, 60, 180]},
  join: {label: 'Join type', choices: ['INNER JOIN', 'LEFT JOIN']},
  'group-by': {label: 'Calculate', choices: ['Count books', 'Average pages']},
};

const cells = (values: (string | number)[], active: number[] = [], done: number[] = []): Cell[] =>
  values.map((value, index) => ({value, tone: active.includes(index) ? 'active' : done.includes(index) ? 'done' : undefined}));

function loops(stop: number): Trace {
  const numbers = Array.from({length: stop - 1}, (_, index) => index + 1);
  let total = 0;
  const scene = (picked = -1, printed = false): Scene => ({
    kind: 'cells', title: `range(1, ${stop}) hands out these numbers`,
    cells: cells(numbers, picked < 0 ? [] : [picked], numbers.map((_, i) => i).filter(i => i < picked)),
    metrics: [{label: 'Current number · i', value: numbers[picked] ?? '—'}, {label: 'Running total', value: total}],
    note: printed ? `Printed output: ${total}` : 'No output yet',
  });
  const frames: Frame[] = [{line: 0, caption: 'Create total and put 0 inside it.', scene: scene()}];
  numbers.forEach((value, index) => {
    frames.push({line: 1, caption: `The range hands Python ${value}. Store it in i.`, scene: scene(index)});
    const previous = total;
    total += value;
    frames.push({line: 2, caption: `Add ${value} to ${previous}. The running total is now ${total}.`, scene: scene(index)});
  });
  frames.push({line: 3, caption: `There are no numbers left. Print the final total, ${total}.`, scene: scene(numbers.length - 1, true)});
  return {code: ['total = 0', `for i in range(1, ${stop}):`, '    total += i', 'print(total)'], frames};
}

export function slicing(start: number, stop: number): Trace {
  const values = ['A', 'B', 'C', 'D', 'E', 'F'];
  const chosen = values.slice(start, stop);
  const positions = values.map((_, i) => i).slice(start, stop);
  const expression = `letters[${start === 0 ? '' : start}:${stop === 6 ? '' : stop}]`;
  return {
    code: [`letters = ${JSON.stringify(values)}`, expression, `# gives ${JSON.stringify(chosen)}`],
    frames: [{
      line: 1,
      caption: positions.length ? `Pick positions ${positions.join(', ')}. The stop boundary stays outside the slice.` : 'The bounds leave no positions to pick. The result is an empty list.',
      scene: {kind: 'cells', title: 'Count from either end', cells: values.map((value, index) => ({
        value, top: index, bottom: index - values.length, tone: positions.includes(index) ? 'active' : undefined,
      })), note: `${expression} gives ${JSON.stringify(chosen)}`},
    }],
  };
}

function recursion(n: number): Trace {
  const waiting = Array.from({length: n + 1}, (_, index) => n - index);
  const scene = (active: number): Scene => ({
    kind: 'chain', title: 'Call stack · latest call is at the right',
    cells: cells(waiting.slice(0, n - active + 1).map(value => `sum_to(${value})`), [n - active]),
  });
  const frames = waiting.map((value): Frame => ({
    line: value ? 3 : 2,
    caption: value ? `sum_to(${value}) waits for sum_to(${value - 1}).` : 'At zero, return 0 without making another call.',
    scene: scene(value),
  }));
  let total = 0;
  for (let value = 1; value <= n; value++) {
    const previous = total;
    total += value;
    frames.push({line: 3, caption: `The waiting call returns ${value} + ${previous} = ${total}.`, scene: scene(value)});
  }
  frames.push({line: 5, caption: `All calls have returned. The result is ${total}.`, scene: {kind: 'cells', title: 'Final result', cells: [{value: total, tone: 'done'}]}});
  return {code: ['def sum_to(n):', '    if n == 0:', '        return 0', '    return n + sum_to(n - 1)', '', `sum_to(${n})`], frames};
}

function stackQueue(queue: boolean): Trace {
  const items: string[] = [];
  const code = queue ? ['from collections import deque', 'items = deque()'] : ['items = []'];
  const scene = (marker = -1): Extract<Scene, {kind: 'cells'}> => ({
    kind: 'cells', title: queue ? 'Front → back' : 'Bottom → top', cells: cells(items, [marker]),
  });
  const frames: Frame[] = [{line: code.length - 1, caption: `Start with an empty ${queue ? 'queue' : 'stack'}.`, scene: scene()}];
  ['A', 'B', 'C'].forEach((item, i) => {
    items.push(item);
    code.push(`items.append("${item}")`);
    frames.push({line: code.length - 1, caption: `Add ${item} at the right end.`, scene: scene(i)});
  });
  code.push(queue ? 'removed = items.popleft()' : 'removed = items.pop()');
  const removed = queue ? items.shift() : items.pop();
  frames.push({
    line: code.length - 1, caption: `${removed} leaves first: ${queue ? 'it arrived first' : 'it was added last'}.`,
    scene: {...scene(), note: `Removed: ${removed}`},
  });
  return {code, frames};
}

function bubbleSort(selection: number): Trace {
  const list = [...([[5, 2, 4, 1], [6, 5, 4, 2, 1], [1, 2, 4, 5]][selection] ?? [5, 2, 4, 1])];
  const original = JSON.stringify(list);
  const scene = (end: number, active: number[] = []): Scene => ({
    kind: 'bars', title: 'Compare the highlighted neighbors', cells: cells(list, active, list.map((_, i) => i).filter(i => i > end)),
  });
  const frames: Frame[] = [{line: 0, caption: 'Start with these bars. Taller bars represent larger numbers.', scene: scene(list.length - 1)}];
  for (let end = list.length - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      const a = list[i], b = list[i + 1];
      frames.push({line: 3, caption: `Compare ${a} with ${b}. ${a > b ? 'They are out of order.' : 'They are already in order.'}`, scene: scene(end, [i, i + 1])});
      if (a > b) {
        [list[i], list[i + 1]] = [b, a];
        frames.push({line: 4, caption: `Swap them so ${b} is left of ${a}.`, scene: scene(end, [i, i + 1])});
      }
    }
    frames.push({line: 1, caption: `${list[end]} is in its final position. Shorten the next pass.`, scene: scene(end - 1)});
  }
  frames.push({line: 5, caption: 'All bars are now in ascending order.', scene: scene(-1)});
  return {code: [`a = ${original}`, 'for end in range(len(a) - 1, 0, -1):', '    for i in range(end):', '        if a[i] > a[i + 1]:', '            a[i], a[i + 1] = a[i + 1], a[i]', 'print(a)'], frames};
}

function binarySearch(target: number): Trace {
  const values = [2, 4, 6, 8, 12, 14, 18];
  let lo = 0, hi = values.length - 1;
  const scene = (mid = -1, found = false): Scene => ({
    kind: 'cells', title: `Target: ${target}`, cells: values.map((value, i) => ({
      value, top: i, tone: i === mid ? (found ? 'done' : 'active') : i < lo || i > hi ? 'muted' : undefined,
    })), note: lo > hi ? 'Search window is empty' : `Search window: positions ${lo} through ${hi}`,
  });
  const frames: Frame[] = [{line: 1, caption: 'Start with the entire sorted list.', scene: scene()}];
  while (lo <= hi) {
    const mid = Math.floor((hi + lo) / 2);
    const value = values[mid];
    frames.push({line: 3, caption: `The midpoint is position ${mid}. Compare ${value} with ${target}.`, scene: scene(mid)});
    if (value === target) {
      frames.push({line: 4, caption: `Match found at index ${mid}.`, scene: scene(mid, true)});
      break;
    }
    if (value < target) {
      lo = mid + 1;
      frames.push({line: 5, caption: `${value} is too small. Keep only the right-hand part.`, scene: scene()});
    } else {
      hi = mid - 1;
      frames.push({line: 6, caption: `${value} is too large. Keep only the left-hand part.`, scene: scene()});
    }
  }
  if (lo > hi) frames.push({line: 7, caption: `${target} is absent because no candidates remain.`, scene: scene()});
  return {code: [`a, target = ${JSON.stringify(values)}, ${target}`, 'lo, hi = 0, len(a) - 1', 'while lo <= hi:', '    mid = (lo + hi) // 2', '    if a[mid] == target: break', '    if a[mid] < target: lo = mid + 1', '    else: hi = mid - 1', '# lo > hi means absent'], frames};
}

function linkedList(insert: boolean): Trace {
  const scene = (nodes: string[], active: number): Scene => ({
    kind: 'chain', title: 'Follow the next links', cells: cells(nodes, [active]),
  });
  if (insert) return {
    code: ['# head points to A', 'old_next = head.next', 'new_node.next = old_next', 'head.next = new_node'],
    frames: [
      {line: 0, caption: 'The current list is A → B → C. We want X after A.', scene: scene(['A', 'B', 'C', 'None'], 0)},
      {line: 1, caption: 'Remember where A used to point: node B.', scene: scene(['A', 'B', 'C', 'None'], 1)},
      {line: 2, caption: 'Point X at B first. The chain from A is unchanged for now.', scene: scene(['X', 'B', 'C', 'None'], 0)},
      {line: 3, caption: 'Point A at X. Now the whole list is A → X → B → C.', scene: scene(['A', 'X', 'B', 'C', 'None'], 1)},
    ],
  };
  return {
    code: ['node = head', 'while node is not None:', '    print(node.value)', '    node = node.next'],
    frames: ['A', 'B', 'C', 'None'].map((value, index) => ({
      line: value === 'None' ? 1 : 2,
      caption: value === 'None' ? 'There is no next node, so the walk stops.' : `Visit ${value}, then follow its next link.`,
      scene: scene(['A', 'B', 'C', 'None'], index),
    })),
  };
}

function treeTraversal(breadth: boolean): Trace {
  const order = breadth ? ['A', 'B', 'C', 'D', 'E', 'F'] : ['A', 'B', 'D', 'E', 'C', 'F'];
  const code = breadth
    ? ['from collections import deque', 'q = deque([root])', 'while q:', '    node = q.popleft()', '    visit(node)', '    q.extend(node.children)']
    : ['def preorder(node):', '    if node is None: return', '    visit(node)', '    for child in node.children:', '        preorder(child)'];
  const frames: Frame[] = order.map((node, i) => ({
    line: breadth ? 4 : 2,
    caption: i === 0 ? 'Start at the root, A.' : `Visit ${node}. ${breadth ? 'Finish the current level before visiting the next.' : 'Visit children before moving to the next branch.'}`,
    scene: {kind: 'tree', title: breadth ? 'Breadth-first · by level' : 'Preorder depth-first · by branch', active: node, visited: order.slice(0, i + 1)},
  }));
  return {code, frames};
}

function hashMap(target: number): Trace {
  const keys = [2, 6, 3];
  const names = ['berry', 'mango', 'plum'];
  const entries = keys.map((key, index) => `(${key}, "${names[index]}")`).join(', ');
  const buckets: string[][] = Array.from({length: 4}, () => []);
  const scene = (active: number): Scene => ({
    kind: 'cells', title: 'Buckets · teaching hash: key % 4',
    cells: buckets.map((entries, index) => ({top: index, value: entries.join(' · ') || 'Empty', tone: index === active ? 'active' : undefined})),
  });
  const frames: Frame[] = [];
  keys.forEach((key, index) => {
    const bucket = key % 4;
    buckets[bucket].push(`${key}: ${names[index]}`);
    frames.push({line: 3, caption: `Key ${key} goes to bucket ${bucket}. ${buckets[bucket].length > 1 ? 'A collision occurs, so keep both entries.' : 'Store the key and its value together.'}`, scene: scene(bucket)});
  });
  const match = keys.indexOf(target);
  frames.push({line: 6, caption: `Look in bucket ${target % 4}. ${match < 0 ? `No key equals ${target}.` : `Match the key ${target} itself to find ${names[match]}.`}`, scene: scene(target % 4)});
  return {code: [
    `entries = [${entries}]`, 'buckets = [[], [], [], []]', 'for key, value in entries:',
    '    buckets[key % 4].append((key, value))', `target = ${target}`, 'bucket = buckets[target % 4]',
    'match = next((v for k, v in bucket if k == target), None)',
  ], frames};
}

const books = [
  {title: 'Moon Atlas', genre: 'Science', pages: 180, author: 1},
  {title: 'Fox Tales', genre: 'Fiction', pages: 94, author: 2},
  {title: 'Tiny Experiments', genre: 'Science', pages: 120, author: 1},
  {title: 'Map of Rain', genre: 'Fiction', pages: 140, author: null},
  {title: 'Paper Planes', genre: 'Craft', pages: 52, author: 3},
];
const authors: [number, string][] = [[1, 'Mina'], [2, 'Jules'], [3, 'Kai']];
const tableScene = (...tables: Table[]): Scene => ({kind: 'tables', tables});

function select(minimum: number): Trace {
  const matches = books.filter(book => book.pages >= minimum);
  const table = (title: string, records: typeof books): Table => ({
    title, headers: ['title', 'pages'], rows: records.map(book => [book.title, book.pages]),
  });
  const source = (title: string, active?: number[]): Table => ({
    title, headers: ['title', 'genre', 'pages'], rows: books.map(book => [book.title, book.genre, book.pages]), active,
  });
  return {
    code: ['SELECT title, pages', 'FROM books', `WHERE pages >= ${minimum}`, 'ORDER BY pages DESC;'],
    frames: [
      {line: 1, caption: 'FROM reads all rows in the books table.', scene: tableScene(source('books'))},
      {line: 2, caption: `Keep books that have ${minimum} pages or more. ${matches.length} rows qualify.`, scene: tableScene(source('WHERE matches', matches.map(book => books.indexOf(book))))},
      {line: 0, caption: 'SELECT returns the title and pages columns.', scene: tableScene(table('Selected rows', matches))},
      {line: 3, caption: 'DESC puts the largest page count first.', scene: tableScene(table('Query result', matches.toSorted((a, b) => b.pages - a.pages)))},
    ],
  };
}

function join(left: boolean): Trace {
  const result = books.flatMap(book => {
    const match = authors.find(([id]) => id === book.author);
    return match || left ? [[book.title, match?.[1] ?? 'NULL']] : [];
  });
  return {
    code: ['SELECT b.title, a.name', 'FROM books AS b', `${left ? 'LEFT' : 'INNER'} JOIN authors AS a`, '  ON b.author_id = a.id', 'ORDER BY b.title;'],
    frames: [
      {line: 1, caption: 'The books table stores an author ID. The authors table stores the name for that ID.',
        scene: tableScene({title: 'books', headers: ['title', 'author_id'], rows: books.map(book => [book.title, book.author ?? 'NULL'])}, {title: 'authors', headers: ['id', 'name'], rows: authors})},
      {line: 3, caption: 'Moon Atlas and Tiny Experiments both match Mina because their author_id is 1.',
        scene: tableScene({title: 'Matching books', headers: ['title', 'author_id'], rows: books.filter(book => book.author === 1).map(book => [book.title, 1]), active: [0, 1]}, {title: 'Matching author', headers: ['id', 'name'], rows: [authors[0]], active: [0]})},
      {line: 4, caption: left ? 'LEFT JOIN keeps Map of Rain and uses NULL for the missing author.' : 'INNER JOIN skips Map of Rain because it has no matching author.',
        scene: tableScene({title: 'Query result', headers: ['title', 'name'], rows: result.toSorted((a, b) => a[0].localeCompare(b[0]))})},
    ],
  };
}

function groupBy(average: boolean): Trace {
  const groups = ['Craft', 'Fiction', 'Science'].map(genre => ({genre, entries: books.filter(book => book.genre === genre)}));
  return {
    code: [`SELECT genre, ${average ? 'AVG(pages) AS avg_pages' : 'COUNT(*) AS book_count'}`, 'FROM books', 'GROUP BY genre', 'ORDER BY genre;'],
    frames: [
      {line: 1, caption: 'Begin with one row per book.', scene: tableScene({title: 'books', headers: ['title', 'genre', 'pages'], rows: books.map(book => [book.title, book.genre, book.pages])})},
      {line: 2, caption: 'Rows that share a genre go into the same group.', scene: tableScene(...groups.map(({genre, entries}) => ({title: genre, headers: ['title', 'pages'], rows: entries.map(book => [book.title, book.pages])})))},
      {line: 0, caption: average ? 'Average pages within each group. Fiction gives (94 + 140) ÷ 2 = 117.' : 'Count the rows in each group. Fiction gives 2.',
        scene: tableScene({title: 'Query result', headers: ['genre', average ? 'avg_pages' : 'book_count'], rows: groups.map(({genre, entries}) => [genre, average ? entries.reduce((sum, book) => sum + book.pages, 0) / entries.length : entries.length])})},
    ],
  };
}

export function buildTrace(id: string, selection: number): Trace {
  const choice = labOptions[id]?.choices[selection];
  switch (id) {
    case 'slicing': return slicing(1, 4);
    case 'recursion': return recursion(Number(choice ?? 3));
    case 'stack-queue': return stackQueue(selection === 1);
    case 'bubble-sort': return bubbleSort(selection);
    case 'binary-search': return binarySearch(Number(choice ?? 12));
    case 'linked-list': return linkedList(selection === 1);
    case 'tree-traversal': return treeTraversal(selection === 1);
    case 'hash-map': return hashMap(Number(choice ?? 6));
    case 'select': return select(Number(choice ?? 100));
    case 'join': return join(selection === 1);
    case 'group-by': return groupBy(selection === 1);
    default: return loops(Number(choice ?? 5));
  }
}
