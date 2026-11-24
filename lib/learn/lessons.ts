import type {Lesson} from './types';

export const lessons: Lesson[] = [
  {
    id: 'loops', track: 'python', title: 'Python loop tracer', subtitle: 'Follow each number and watch a running total grow.', minutes: 5,
    explanations: {
      explorer: 'Imagine dropping a handful of counters into a jar. A loop hands you one number at a time, and the jar remembers how many counters you have added so far.',
      builder: 'A for loop visits each value from an iterable. Here, i is the current number and total is an accumulator: it keeps the sum from earlier turns.',
      pro: 'range(1, stop) lazily produces integers from 1 through stop − 1. With n values, the loop is O(n) time and uses O(1) extra space.',
    },
    remember: ['range excludes the stop value.', 'Set total before the loop so it can carry over.', 'Indent the lines you want to repeat.'],
    mistake: 'Putting total = 0 inside the loop erases the running sum on every turn. Printing outside the loop shows the final sum once.',
    detail: {title: 'Why the order matters', body: 'On each turn, Python assigns the next number to i before running the indented body. total += i reads the previous total, adds i, and stores the result. The line after the loop runs after every value has been visited.'},
    questions: [
      {prompt: 'For range(1, 5), how many times does total += i run?', options: ['3 times', '4 times', '5 times'], answer: 1, hint: 'Write out the numbers, starting at 1 and stopping before 5.', explain: 'The body runs once for each of 1, 2, 3, and 4.'},
      {prompt: 'What does the loop print after adding 1, 2, 3, and 4?', options: ['4', '9', '10'], answer: 2, hint: 'Add all four values, including the first one.', explain: 'The running totals are 1, 3, 6, and 10. print runs after the loop.'},
    ],
    recall: {term: 'Accumulator', answer: 'A variable that carries a running result across steps, such as total in a loop.'},
  },
  {
    id: 'slicing', track: 'python', title: 'Lists and slicing', subtitle: 'Pick a run of items from a row of numbered boxes.', minutes: 5,
    explanations: {
      explorer: 'Picture numbered lockers. Start at one locker and grab what is inside each locker until you reach the stop door. Leave the stop door closed.',
      builder: 'Lists keep items in order, starting at index 0. letters[start:stop] returns a new list containing start through the item just before stop.',
      pro: 'Slice bounds are normalized against the list length and clamped. A positive step uses a half-open interval. A slice of k elements costs O(k) time and space.',
    },
    remember: ['The first item is at index 0.', 'The stop index does not get picked.', 'Index −1 means the last item.'],
    mistake: 'letters[1:4] includes positions 1, 2, and 3. Position 4 belongs to the part after the slice.',
    detail: {title: 'Indexing and slicing behave differently', body: 'letters[2] retrieves a single item. letters[2:3] retrieves a list with one item. An out-of-range single index raises IndexError, while a slice can be empty or end at the edge of the list.'},
    questions: [
      {prompt: 'What is letters[1:4] for [A, B, C, D, E, F]?', options: ['[A, B, C]', '[B, C, D]', '[B, C, D, E]'], answer: 1, hint: 'B is index 1. Stop before index 4.', explain: 'Indexes 1, 2, and 3 hold B, C, and D.'},
      {prompt: 'What does letters[-2:] return from [A, B, C, D, E, F]?', options: ['[A, B]', '[D, E]', '[E, F]'], answer: 2, hint: 'Count back two places from the end, then keep going to the end.', explain: 'Index −2 points to E, and the omitted stop takes the slice through F.'},
    ],
    recall: {term: 'Python slice', answer: 'A selection like items[start:stop]. It starts at start and ends before stop.'},
  },
  {
    id: 'recursion', track: 'python', title: 'Recursion', subtitle: 'Break a problem into smaller calls and follow the answers back.', minutes: 7,
    explanations: {
      explorer: 'Imagine a stack of notes. Each note says “ask the next smaller question, then add my number.” When you reach zero, you know the answer and can read the notes backwards.',
      builder: 'A recursive function calls itself with a smaller input. The base case stops the calls. Each earlier call waits, then uses the value that comes back.',
      pro: 'This recurrence is S(n) = n + S(n − 1), with S(0) = 0. It takes O(n) time and O(n) call stack space.',
    },
    remember: ['Write a base case first.', 'Each call must move toward it.', 'Calls finish in reverse order.'],
    mistake: 'Calling sum_to(n) again without decreasing n never reaches zero. Python eventually raises RecursionError.',
    detail: {title: 'Two phases of recursion', body: 'The descent creates waiting calls. In the return phase, each call gets the answer from the call below it. An iterative loop can solve this same sum with constant extra space.'},
    questions: [
      {prompt: 'In sum_to(n), which input can return immediately?', options: ['n = 0', 'n = 2', 'n = 5'], answer: 0, hint: 'Find the base case.', explain: 'At n = 0 the function returns 0 without making another call.'},
      {prompt: 'After sum_to(2) returns 3, what does the waiting sum_to(3) return?', options: ['3', '5', '6'], answer: 2, hint: 'The caller still has its own 3 to add.', explain: 'sum_to(3) returns 3 + sum_to(2), which is 3 + 3 = 6.'},
    ],
    recall: {term: 'Base case', answer: 'The condition where a recursive function returns without making another recursive call.'},
  },
  {
    id: 'stack-queue', track: 'dsa', title: 'Stack and queue playground', subtitle: 'See what changes when the newest or oldest item leaves first.', minutes: 5,
    explanations: {
      explorer: 'From a pile of plates, you usually lift the top one. In a line for a ride, the person who arrived first goes first. Pick a rule and see who leaves.',
      builder: 'A stack pops the latest item (LIFO). A queue removes the earliest (FIFO). Both can insert at the back; they differ in where they remove.',
      pro: 'A Python list gives amortized O(1) append and O(1) end pop. collections.deque supports append and popleft in O(1) time.',
    },
    remember: ['Stack: last in, first out.', 'Queue: first in, first out.', 'Check if the structure is empty before removing.'],
    mistake: 'A list’s pop(0) works for a queue but shifts later elements. Use deque for a queue that needs fast removal from the front.',
    detail: {title: 'Where each rule is useful', body: 'Undo usually uses a stack because the latest action is undone first. A print queue typically serves the oldest pending job first. The same values can behave differently because the operations follow different rules.'},
    questions: [
      {prompt: 'You push A, B, then C onto a stack. Which comes out first?', options: ['A', 'B', 'C'], answer: 2, hint: 'Think of the top plate.', explain: 'C was pushed last. A stack removes the newest item first.'},
      {prompt: 'You enqueue A, B, then C. Which comes out first?', options: ['A', 'B', 'C'], answer: 0, hint: 'Who was first in line?', explain: 'A was added first. A queue removes the oldest item first.'},
    ],
    recall: {term: 'LIFO and FIFO', answer: 'LIFO removes the newest item first (stack). FIFO removes the oldest item first (queue).'},
  },
  {
    id: 'bubble-sort', track: 'dsa', title: 'Bubble sort in motion', subtitle: 'Compare neighboring bars and swap them into order.', minutes: 7,
    explanations: {
      explorer: 'Imagine lining up pencils by length. Compare two neighbors and swap them if the taller one is on the left. After one sweep, the tallest pencil is at the right.',
      builder: 'Each pass compares adjacent pairs and swaps any pair in the wrong order. The largest unsorted item ends up at the end of that pass.',
      pro: 'Bubble sort is stable with a strict > comparison. This version takes O(n²) comparisons in the worst case and O(1) extra space.',
    },
    remember: ['Compare neighbors only.', 'After a pass, the rightmost unsorted item is in place.', 'Equal values do not need a swap.'],
    mistake: 'One pass can finish placing the largest value while leaving smaller values out of order. Keep going through the remaining unsorted part.',
    detail: {title: 'Why you can shrink the next pass', body: 'At each comparison, the larger value moves right. At the end of the pass, the largest remaining value cannot move farther in a sorted list. Later passes can skip that finished suffix.'},
    questions: [
      {prompt: 'What does one left-to-right pass do to [5, 2, 4]?', options: ['[2, 4, 5]', '[4, 2, 5]', '[5, 4, 2]'], answer: 0, hint: 'First compare 5 with 2, then compare 5 with 4.', explain: 'The two swaps move 5 right twice: [2, 5, 4], then [2, 4, 5].'},
      {prompt: 'How many comparisons does the first pass make on four items?', options: ['2', '3', '4'], answer: 1, hint: 'Count adjacent pairs: (0,1), (1,2), …', explain: 'There are three adjacent pairs in a row of four items.'},
    ],
    recall: {term: 'Bubble sort', answer: 'Repeatedly compare neighbors and swap out-of-order pairs. Each pass places the largest remaining item at the right.'},
  },
  {
    id: 'binary-search', track: 'dsa', title: 'Binary search: halving the list', subtitle: 'Find a number by ruling out half the remaining choices.', minutes: 7,
    explanations: {
      explorer: 'Open a dictionary near the middle. If your word comes later, forget every page before that one. Repeat on the part you still need.',
      builder: 'Compare the target with the middle of a sorted list. If the middle is too small, move the left boundary up. If it is too large, move the right boundary down.',
      pro: 'For an ascending array, maintain that any matching position is in [lo, hi]. Every comparison removes at least half the remaining interval, giving O(log n) time.',
    },
    remember: ['Sort the list first.', 'The inspected midpoint can be ruled out after a miss.', 'Stop when the search window is empty.'],
    mistake: 'Leaving mid inside the next window can prevent progress. Use lo = mid + 1 or hi = mid − 1.',
    detail: {title: 'Why sorted order is essential', body: 'If values are sorted and the midpoint is smaller than the target, everything to its left is too small as well. Without sorted order, there is no reason those values can be discarded.'},
    questions: [
      {prompt: 'The middle value is 8 and your target is 12. Which part remains?', options: ['Everything to the left', 'Everything to the right', 'Both sides'], answer: 1, hint: 'The numbers are sorted in ascending order.', explain: 'Values at or left of 8 cannot be 12, so keep only the right side.'},
      {prompt: 'lo is now greater than hi. What does that tell you?', options: ['The target was found', 'There are two candidates', 'No candidates remain'], answer: 2, hint: 'Think of the search window as a row between two markers.', explain: 'When lo passes hi, the window is empty and the target was not found.'},
    ],
    recall: {term: 'Binary search', answer: 'Search a sorted sequence by comparing its middle and ruling out half the remaining candidates.'},
  },
  {
    id: 'linked-list', track: 'dsa', title: 'Linked list', subtitle: 'Walk from one node to the next, then change a link.', minutes: 6,
    explanations: {
      explorer: 'Imagine a treasure hunt. Each note points to the next note. You can slip in a new note by changing where just two notes point.',
      builder: 'A singly linked list stores a value and a next link per node. Start at head, then follow next until it points to None.',
      pro: 'Index access needs O(n) traversal. Inserting after a known node is O(1): set the new node’s next before changing the predecessor’s next.',
    },
    remember: ['Head refers to the first node.', 'The last node links to None.', 'Save the old next link before rewiring.'],
    mistake: 'If you overwrite A.next before saving it, the original rest of the chain may become unreachable.',
    detail: {title: 'Links, not positions', body: 'A node’s position comes from the path that reaches it. Inserting after a known node changes links without moving all following elements, but reaching the node may still require walking from head.'},
    questions: [
      {prompt: 'What points to the first node in this linked list?', options: ['head', 'next of the last node', 'The array index'], answer: 0, hint: 'Which value starts your walk?', explain: 'head holds the reference used to start traversing the list.'},
      {prompt: 'To insert X between A and B, which links should you end with?', options: ['A → B and X → A', 'A → X and X → B', 'A → X and B → X'], answer: 1, hint: 'Read the desired chain from left to right.', explain: 'A must point to X, and X must point to the old successor, B.'},
    ],
    recall: {term: 'Linked list', answer: 'A chain of nodes. Each node stores a value and a link to its successor (if any).'},
  },
  {
    id: 'tree-traversal', track: 'dsa', title: 'Tree traversal', subtitle: 'Explore the same tree branch by branch or level by level.', minutes: 8,
    explanations: {
      explorer: 'When you explore a tree, you can follow one branch all the way to the end, or visit the branches nearest the trunk before going higher.',
      builder: 'Depth-first traversal follows a branch before changing branches. Breadth-first traversal visits one level before going deeper.',
      pro: 'Preorder DFS visits node, left, right and uses O(h) stack space for tree height h. BFS uses a queue and O(w) space for maximum width w. Both visit n nodes in O(n) time.',
    },
    remember: ['Both examples begin at the root.', 'DFS preorder visits the current node before its children.', 'BFS uses a queue to keep levels in order.'],
    mistake: 'DFS alone does not specify a unique order. Preorder, inorder, and postorder differ in when they visit the current node.',
    detail: {title: 'Choosing a traversal', body: 'Use BFS when nearer levels should come first. Use DFS to explore a complete branch before moving on. In a highly unbalanced tree, the depth of recursive calls may be close to the number of nodes.'},
    questions: [
      {prompt: 'The root is A with children B and C. B has child D. In BFS, which comes first, C or D?', options: ['C', 'D', 'They are visited together'], answer: 0, hint: 'BFS finishes the current level first.', explain: 'C is one edge from A, while D is two edges away. BFS visits C before D.'},
      {prompt: 'Which structure remembers the next nodes for breadth-first traversal?', options: ['A sorted array', 'A queue', 'A stack'], answer: 1, hint: 'The first node added should be the first node visited.', explain: 'A FIFO queue preserves the order nodes are discovered.'},
    ],
    recall: {term: 'Depth-first vs. breadth-first', answer: 'DFS follows a branch deeply. BFS explores level by level using a queue.'},
  },
  {
    id: 'hash-map', track: 'dsa', title: 'Hash map', subtitle: 'Send keys to buckets and see how collisions are handled.', minutes: 7,
    explanations: {
      explorer: 'Picture numbered cubbies. A rule picks a cubby from a key. Two keys can land in the same cubby, so read the labels before taking an item.',
      builder: 'A hash map uses a hash to find where to store a key and its value. If two keys map to the same bucket, look at the actual keys to tell them apart.',
      pro: 'This lab uses a modulo hash and separate chaining. Lookup is expected O(1) with a well-distributed hash and controlled load, and can be O(n) if all keys collide.',
    },
    remember: ['Keys locate values.', 'Equal bucket numbers do not imply equal keys.', 'This lab uses a teaching hash, not Python’s dict algorithm.'],
    mistake: 'Overwriting a different key just because it shares a bucket loses data. A collision strategy keeps both entries findable.',
    detail: {title: 'A fast starting point, not a guarantee', body: 'The hash narrows the search to a bucket. A key comparison confirms the entry. Real hash maps use stronger hash functions and vary in how they resolve collisions or resize.'},
    questions: [
      {prompt: 'With four buckets and key % 4, what happens to keys 2 and 6?', options: ['They map to different buckets', 'Both map to bucket 2', 'The second key is invalid'], answer: 1, hint: 'Find the remainder after dividing each key by 4.', explain: '2 % 4 and 6 % 4 are both 2, so the keys collide.'},
      {prompt: 'For two entries in the same bucket, what identifies the correct value?', options: ['The key itself', 'The bucket number alone', 'The position of the larger value'], answer: 0, hint: 'Both entries already have the same bucket number.', explain: 'Compare the stored key with the one you requested.'},
    ],
    recall: {term: 'Hash collision', answer: 'Two different keys map to the same bucket. A collision strategy keeps the keys distinguishable.'},
  },
  {
    id: 'select', track: 'sql', title: 'SELECT, WHERE, ORDER BY', subtitle: 'Filter a table, sort the matches, and choose what to show.', minutes: 6,
    explanations: {
      explorer: 'Think of a library list. First keep books that meet your rule, line them up by pages, then write down just the details you want.',
      builder: 'WHERE keeps rows that satisfy a condition. ORDER BY sorts the result, and SELECT determines which columns appear.',
      pro: 'The query filters on a row predicate and projects title and pages. ORDER BY pages DESC guarantees descending pages; rows with tied keys need a second sort key for a deterministic relative order.',
    },
    remember: ['WHERE filters rows.', 'SELECT picks result columns.', 'ORDER BY controls result order; ASC sorts low to high.'],
    mistake: 'Rows do not have a guaranteed order without ORDER BY, even if they appear sorted in one run.',
    detail: {title: 'Read the query in stages', body: 'A useful mental model is FROM, WHERE, SELECT, ORDER BY. The demo sorts by pages after choosing it as an output column. A database may execute the query differently while preserving the result.'},
    questions: [
      {prompt: 'Which clause keeps only books with at least 100 pages?', options: ['SELECT pages', 'ORDER BY pages', 'WHERE pages >= 100'], answer: 2, hint: 'Pick the clause that tests a row.', explain: 'WHERE evaluates the pages condition for each row.'},
      {prompt: 'Which direction puts the largest page count first?', options: ['DESC', 'ASC', 'Both'], answer: 0, hint: 'Descending means moving down from high values.', explain: 'ORDER BY pages DESC sorts from the largest value to the smallest.'},
    ],
    recall: {term: 'WHERE', answer: 'A SQL clause that keeps rows whose condition evaluates to true.'},
  },
  {
    id: 'join', track: 'sql', title: 'JOIN', subtitle: 'Match records from two tables using a shared ID.', minutes: 8,
    explanations: {
      explorer: 'Imagine matching book cards to an author list. The number on the book card tells you whose name to attach.',
      builder: 'A JOIN pairs rows using an ON condition. INNER JOIN keeps matches only. LEFT JOIN keeps unmatched rows from the left table too.',
      pro: 'An equijoin produces one result per matching pair of rows. For LEFT JOIN, a left row with no partner produces one result with NULL on the right.',
    },
    remember: ['ON defines which rows match.', 'Inner joins discard unmatched rows.', 'Left joins retain unmatched left rows with NULL values on the right.'],
    mistake: 'A join can return several rows per book if several right-side rows match. Joining on a unique ID can make each book match at most one author.',
    detail: {title: 'Why an ID is a good join key', body: 'Names can repeat or change. A stable ID connects one record to a specific author. A NULL join key does not match with ordinary =, which is why an unassigned book behaves differently in the two joins.'},
    questions: [
      {prompt: 'Which join keeps a book even when it has no matching author?', options: ['INNER JOIN', 'LEFT JOIN with books on the left', 'Both'], answer: 1, hint: 'Look for the join that preserves one side.', explain: 'LEFT JOIN keeps the book and returns NULL for its missing author.'},
      {prompt: 'Two right rows match a single left row. How many matched result rows are produced?', options: ['0', '1', '2'], answer: 2, hint: 'Count the matching pairs.', explain: 'Each matching left/right pair produces its own row.'},
    ],
    recall: {term: 'LEFT JOIN', answer: 'Keep every left row, pairing it with each matching right row. Missing right values appear as NULL.'},
  },
  {
    id: 'group-by', track: 'sql', title: 'GROUP BY', subtitle: 'Put matching rows together, then count or average each group.', minutes: 7,
    explanations: {
      explorer: 'Sort a pile of books into topic piles. Then count the books in each pile or work out the average number of pages.',
      builder: 'GROUP BY forms one group per distinct genre. COUNT(*) counts rows in each group. AVG(pages) computes the average pages of each group.',
      pro: 'Aggregation returns one result row per grouping key. COUNT(*) counts rows; COUNT(pages) and AVG(pages) ignore NULL pages. HAVING filters the groups after aggregation.',
    },
    remember: ['GROUP BY builds groups.', 'An aggregate calculates a value for each group.', 'WHERE filters rows before grouping; HAVING filters groups.'],
    mistake: 'Selecting title alongside genre and COUNT(*) is ambiguous: a genre can contain many titles. Standard SQL requires an aggregate or a valid grouped result for each selected expression.',
    detail: {title: 'Grouping changes the unit of the result', body: 'The input has one row per book. After grouping by genre, the result has one row per genre. To keep only genres with two or more books, add HAVING COUNT(*) >= 2 after GROUP BY.'},
    questions: [
      {prompt: 'What does grouping books by genre with COUNT(*) return?', options: ['One row per book', 'One row per genre with a count', 'One number for all books'], answer: 1, hint: 'A group represents one distinct genre.', explain: 'The query returns one result row per genre, along with the number of books in that group.'},
      {prompt: 'Which clause keeps groups that have at least two rows?', options: ['WHERE COUNT(*) >= 2', 'ORDER BY COUNT(*)', 'HAVING COUNT(*) >= 2'], answer: 2, hint: 'The count is available after the groups exist.', explain: 'HAVING checks an aggregate condition on each finished group.'},
    ],
    recall: {term: 'GROUP BY', answer: 'Collect rows with the same grouping key so that aggregates such as COUNT(*) return one result per group.'},
  },
];

export const reviewCards = [
  {id: 'variable', track: 'python' as const, term: 'Variable', answer: 'A name that refers to a value. Assigning to it can make it refer to a different value.'},
  ...lessons.map(lesson => ({id: lesson.id, track: lesson.track, ...lesson.recall})),
  {id: 'big-o', track: 'dsa' as const, term: 'Big O', answer: 'An upper bound on how an algorithm’s cost grows as its input grows, ignoring fixed factors and smaller terms.'},
  {id: 'select-columns', track: 'sql' as const, term: 'SELECT', answer: 'The list of columns or expressions to include in a SQL query’s result.'},
];
