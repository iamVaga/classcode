import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('the experiment tabs work with arrow keys and update the result',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Students make. Teachers guide.'})).toBeVisible();
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
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 const serious=results.violations.filter(item=>item.impact==='serious'||item.impact==='critical');
 if(serious.length)console.error('Axe details',JSON.stringify(serious.map(item=>({id:item.id,impact:item.impact,nodes:item.nodes.map(node=>({target:node.target,html:node.html,summary:node.failureSummary}))})),null,2));
 expect(serious.map(item=>({id:item.id,help:item.help,nodes:item.nodes.length}))).toEqual([]);
});

test('layout fits a 320px viewport without horizontal overflow',async({page})=>{
 await page.setViewportSize({width:320,height:740});
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'Students make. Teachers guide.'})).toBeVisible();
 const layout=await page.evaluate(()=>({viewport:window.innerWidth,document:document.documentElement.scrollWidth,header:(()=>{const h=document.querySelector('.studio-header')!,n=h.querySelector('nav')!,c=document.querySelector('.connection-control')!;return {rect:[h.getBoundingClientRect().left,h.getBoundingClientRect().right,h.getBoundingClientRect().width],css:{width:getComputedStyle(h).width,maxWidth:getComputedStyle(h).maxWidth,boxSizing:getComputedStyle(h).boxSizing},nav:[n.getBoundingClientRect().left,n.getBoundingClientRect().right],connection:[c.getBoundingClientRect().left,c.getBoundingClientRect().right],settingsOpen:!!h.querySelector('details[open]')}})(),offenders:[...document.querySelectorAll('body *')].map(el=>({tag:el.tagName,className:typeof el.className==='string'?el.className:'',left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right),scroll:el.scrollWidth,client:el.clientWidth})).filter(el=>el.left< -1||el.right>window.innerWidth+1).slice(0,12)}));
 expect(layout.document<=layout.viewport,JSON.stringify(layout)).toBe(true);
});

test('a student can open a Python project, run it, and stop a loop',async({page})=>{
 test.setTimeout(180_000);
 await page.goto('/');
 await page.getByRole('button',{name:/Open Hello, Python/}).click();
 await expect(page.getByText('Python 3')).toBeVisible();
 const editor=page.locator('.monaco-editor').first();
 await editor.click();
 await page.keyboard.press('ControlOrMeta+A');
 await page.keyboard.insertText('print("ClassCode is ready")');
 await page.getByRole('button',{name:/Run/}).click();
 await expect(page.getByText('ClassCode is ready')).toBeVisible({timeout:120_000});
 await editor.click();
 await page.keyboard.press('ControlOrMeta+A');
 await page.keyboard.insertText('while True:\n    pass');
 await page.getByRole('button',{name:/Run/}).click();
 await page.getByRole('button',{name:/Stop/}).click();
 await expect(page.getByText(/Stopped/)).toBeVisible();
});
