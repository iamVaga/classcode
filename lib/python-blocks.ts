import * as Blockly from 'blockly';
import {Order, pythonGenerator} from 'blockly/python';

pythonGenerator.addReservedWords('turtle');

const commands = [
  {name: 'forward', label: 'move forward', input: 'steps', value: 100},
  {name: 'backward', label: 'move backward', input: 'steps', value: 100},
  {name: 'right', label: 'turn right', input: 'degrees', value: 90},
  {name: 'left', label: 'turn left', input: 'degrees', value: 90},
  {name: 'circle', label: 'draw a circle', input: 'radius', value: 50},
  {name: 'pensize', label: 'set pen width', input: 'pixels', value: 3},
  {name: 'penup', label: 'lift pen'},
  {name: 'pendown', label: 'lower pen'},
  {name: 'pencolor', label: 'set pen color', input: 'color', value: 'teal'},
  {name: 'bgcolor', label: 'set background color', input: 'color', value: 'white'},
];

for (const {name, label, input, value} of commands) {
  const type = `classcode_turtle_${name}`;
  Blockly.defineBlocksWithJsonArray([{
    type,
    message0: input ? `${label} %1 ${typeof value === 'number' ? input : ''}`.trim() : label,
    args0: input ? [{type: 'input_value', name: 'VALUE', check: typeof value === 'number' ? 'Number' : 'String'}] : [],
    previousStatement: null,
    nextStatement: null,
    colour: 170,
  }]);
  pythonGenerator.forBlock[type] = (block, generator) => {
    const argument = input ? generator.valueToCode(block, 'VALUE', Order.NONE) || JSON.stringify(value) : '';
    return `turtle.${name}(${argument})\n`;
  };
}

const numberBlock = (value: number) => ({type: 'math_number', fields: {NUM: value}});
const category = (name: string, colour: string, types: string[]) => ({
  kind: 'category', name, colour, contents: types.map(type => ({kind: 'block', type})),
});

export function mountPythonBlocks(element: HTMLElement, onChange: (code: string, saveError: boolean) => void) {
  const workspace = Blockly.inject(element, {
    media: '/blockly/',
    sounds: false,
    toolbox: {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category', name: 'Turtle', colour: '#14796d',
          contents: commands.map(({name, value}) => ({
            kind: 'block', type: `classcode_turtle_${name}`,
            inputs: typeof value === 'number' ? {VALUE: {shadow: numberBlock(value)}} :
              typeof value === 'string' ? {VALUE: {shadow: {type: 'text', fields: {TEXT: value}}}} : undefined,
          })),
        },
        category('Loops', '#725096', ['controls_repeat_ext', 'controls_whileUntil', 'controls_for']),
        category('Logic', '#3c6596', ['controls_if', 'logic_compare', 'logic_operation', 'logic_boolean', 'logic_negate']),
        category('Math', '#455fa0', ['math_number', 'math_arithmetic', 'math_random_int']),
        category('Text', '#967024', ['text_print', 'text', 'text_join', 'text_length']),
        {kind: 'category', name: 'Variables', custom: 'VARIABLE', colour: '#a1465d'},
      ],
    },
    grid: {spacing: 24, length: 2, colour: '#c2cccf'},
    trashcan: true,
    zoom: {controls: true, pinch: true, minScale: 0.4, maxScale: 2},
    move: {scrollbars: true, drag: true, wheel: true},
    renderer: 'zelos',
  });
  const storageKey = 'classcode-python-blocks-v1';
  let restored = false;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      Blockly.serialization.workspaces.load(JSON.parse(saved), workspace);
      restored = true;
    }
  } catch {
    workspace.clear();
  }
  if (!restored) {
    Blockly.serialization.workspaces.load({blocks: {languageVersion: 0, blocks: [{
      type: 'controls_repeat_ext', x: 28, y: 32,
      inputs: {
        TIMES: {shadow: numberBlock(4)},
        DO: {block: {
          type: 'classcode_turtle_forward',
          inputs: {VALUE: {shadow: numberBlock(100)}},
          next: {block: {type: 'classcode_turtle_right', inputs: {VALUE: {shadow: numberBlock(90)}}}},
        }},
      },
    }]}}, workspace);
  }

  function update() {
    let saveError = false;
    try {
      localStorage.setItem(storageKey, JSON.stringify(Blockly.serialization.workspaces.save(workspace)));
    } catch {
      saveError = true;
    }
    const code = pythonGenerator.workspaceToCode(workspace);
    const usesTurtle = /^\s*turtle\./m.test(code);
    onChange(usesTurtle ? `import turtle\n\n${code}` : code, saveError);
  }
  workspace.addChangeListener(event => {
    if (!event.isUiEvent && event.type !== Blockly.Events.FINISHED_LOADING) update();
  });
  const resize = new ResizeObserver(() => Blockly.svgResize(workspace));
  resize.observe(element);
  update();
  return () => {
    resize.disconnect();
    workspace.dispose();
  };
}
