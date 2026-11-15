import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('the experiment tabs work with arrow keys and update the result',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Students build real projects with live help from teachers.'})).toBeVisible();
 const hello=page.getByRole('tab',{name:'Say hello'});
 await hello.focus();
 await page.keyboard.press('ArrowRight');
 const turtle=page.getByRole('tab',{name:'Draw a star'});
 await expect(turtle).toHaveAttribute('aria-selected','true');
 await expect(page.getByText('Pick a pen color')).toBeVisible();
 await page.getByRole('button',{name:'gold',exact:true}).click();
 await expect(page.getByRole('img',{name:'gold star'})).toBeVisible();
 await turtle.focus();
 await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('tab',{name:'Make a page'})).toHaveAttribute('aria-selected','true');
 await expect(page.getByText('Name your planet')).toBeVisible();
});

test('sign-in presents email and Google choices without implying the provider is configured',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await expect(page.getByLabel('Email address')).toBeVisible();
 await expect(page.getByRole('button',{name:/Continue with Google|Google/})).toBeVisible();
});

test('the landing page has no serious axe violations',async({page})=>{
 await page.goto('/');
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
 const serious=results.violations.filter(item=>item.impact==='serious'||item.impact==='critical');
 if(serious.length)console.error('Axe details',JSON.stringify(serious.map(item=>({id:item.id,impact:item.impact,nodes:item.nodes.map(node=>({target:node.target,html:node.html,summary:node.failureSummary}))})),null,2));
 expect(serious.map(item=>({id:item.id,help:item.help,nodes:item.nodes.length}))).toEqual([]);
});

test('layout fits a 320px viewport without horizontal overflow',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Students build real projects with live help from teachers.'})).toBeVisible();
 const layout=await page.evaluate(()=>({viewport:window.innerWidth,document:document.documentElement.scrollWidth}));
 expect(layout.document<=layout.viewport,JSON.stringify(layout)).toBe(true);
});

test('a successful Python run can be restored after editing', async ({page}) => {
 await page.addInitScript(() => localStorage.setItem('classcode-bandwidth', 'saver'));
 await page.route('**/python-worker.js', route => route.fulfill({
  contentType: 'application/javascript',
  body: 'self.onmessage = () => { postMessage({ready:true}); postMessage({done:true}); };',
 }));
 await page.goto('/');
 await page.getByRole('button',{name:/Python.*Open in editor/}).click();
 const editor = page.locator('.light-editor textarea');
 const original = await editor.inputValue();
 await page.getByRole('button', {name:'Run', exact:true}).click();
 await expect(page.getByText('Execution finished.')).toBeVisible();
 await editor.fill('print("Changed")');
 await page.getByText('More',{exact:true}).click();
 await page.getByRole('button', {name:'Project revision history'}).click();
 await page.getByRole('button', {name:'Restore last successful run'}).click();
 await page.getByRole('button', {name:'Replace files'}).click();
 await expect(editor).toHaveValue(original);
});

test('a student can open a Python project, run it, and stop a loop',async({page})=>{
 test.setTimeout(180_000);
 await page.addInitScript(() => localStorage.setItem('classcode-bandwidth', 'saver'));
 await page.goto('/');
 await page.getByRole('button',{name:/Python.*Open in editor/}).click();
 await expect(page.getByText('Python 3',{exact:true})).toBeVisible();
 const editor=page.locator('.light-editor textarea');
 await editor.fill('print("ClassCode is ready")');
 await page.getByRole('button',{name:'Run',exact:true}).click();
 await expect(page.getByText('ClassCode is ready',{exact:true})).toBeVisible({timeout:120_000});
 await expect(page.getByText('Execution finished.',{exact:true})).toBeVisible();
 await editor.fill('print("Keyboard run")');
 await editor.press('Control+Enter');
 await expect(page.locator('.console-output').getByText('Keyboard run',{exact:true})).toBeVisible();
 await expect(page.getByText('Execution finished.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Run',exact:true}).click();
 await expect(page.getByText('Execution finished.',{exact:true})).toBeVisible();
 await expect(page.locator('.console-output').getByText('Keyboard run',{exact:true})).toHaveCount(1);
 await page.getByRole('button',{name:'Reset output'}).click();
 await expect(page.locator('.console-output').getByText('Keyboard run',{exact:true})).toHaveCount(0);
 await editor.fill('print(input("Name?"))');
 await page.getByRole('button',{name:'Run',exact:true}).click();
 await page.getByLabel('Name?',{exact:true}).fill('Ada');
 await page.getByRole('button',{name:'Run with these values'}).click();
 await expect(page.locator('.console-output').getByText('Name?Ada',{exact:true})).toBeVisible({timeout:75_000});
 await expect(page.getByText('Execution finished.',{exact:true})).toBeVisible();
 await editor.fill('if True\n    print("oops")');
 await page.getByRole('button',{name:'Run',exact:true}).click();
 await expect(page.locator('.light-line-gutter .error-line')).toHaveText('1');
 await page.getByText('See the original Python error').click();
 await expect(page.locator('.console-output details pre')).toContainText('SyntaxError');
 await editor.fill('while True:\n    pass');
 await page.getByRole('button',{name:'Run',exact:true}).click();
 await page.getByRole('button',{name:/Stop/}).click();
 await expect(page.getByText('Stopped by you.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Run',exact:true}).click();
 await expect(page.getByText(/30 second execution limit reached/)).toBeVisible({timeout:110_000});
 await expect(page.getByRole('button',{name:'Run',exact:true})).toBeEnabled();
});

test('the live teaching example lets a student dismiss or accept a fix', async ({page}) => {
 await page.goto('/');
 const demo = page.locator('#live-join');
 const join = demo.getByRole('button',{name:'Join as teacher'});
 const reset = demo.getByRole('button',{name:'Reset teacher demo'});
 await join.click();
 const accept = demo.getByRole('button',{name:'Accept'});
 await expect(accept).toBeFocused();
 await demo.getByRole('button',{name:'Dismiss'}).click();
 await expect(demo.getByRole('status')).toContainText('dismissed');
 await expect(demo.locator('pre')).toContainText('turtle.left(45)');
 await expect(reset).toBeFocused();
 await reset.click();
 await join.click();
 await accept.press('Enter');
 await expect(demo.getByRole('status')).toContainText('accepted');
 await expect(demo.locator('pre')).toContainText('turtle.left(90)');
});

test('the hint demo exposes one clue at a time, then replaces the typo', async ({page}) => {
 await page.goto('/');
 const demo = page.locator('#hint-ladder');
 await demo.getByRole('button',{name:'Show a hint'}).click();
 await expect(demo.getByRole('status')).toContainText('Hint 1 of 3');
 await demo.getByRole('button',{name:'Show next clue'}).click();
 await expect(demo.getByRole('status')).toContainText('Hint 2 of 3');
 await expect(demo.locator('pre')).toContainText('print(totla)');
 await demo.getByRole('button',{name:'Reveal the fix'}).click();
 await expect(demo.getByRole('status')).toContainText('Hint 3 of 3');
 await expect(demo.locator('pre')).toContainText('print(total)');
});
