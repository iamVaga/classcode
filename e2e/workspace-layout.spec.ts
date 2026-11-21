import {expect,test} from '@playwright/test';

const viewports = [
 {width:1366,height:768},
 {width:1280,height:720},
 {width:1024,height:768},
 {width:390,height:844},
];

for(const viewport of viewports){
 test(`workspace opens the project library at ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>{
   localStorage.setItem('classcode-projects',JSON.stringify([{
    id:'demo-saved-project',name:'Saved test project',type:'python',
    files:{'main.py':'print(1)'},version:1,updated:new Date().toISOString(),
   }]));
  });
  await page.goto('/');
  await page.getByRole('button',{name:'Open workspace',exact:true}).click();
  await expect(page.getByRole('heading',{name:'My projects',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:/Saved test project/})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Workspace navigation'}).getByText('Discover',{exact:true})).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  await page.getByRole('button',{name:'Customize avatar',exact:true}).click();
  const picker=page.getByRole('dialog',{name:'Build a buddy to code with.'});
  await expect(picker).toBeVisible();
  await picker.getByRole('button',{name:'Use this buddy',exact:true}).click();
  await expect(picker).toHaveCount(0);
  await page.getByRole('button',{name:'ClassCode home',exact:true}).click();
  await expect(page.getByRole('heading',{name:/Make real projects/})).toBeVisible();
 });

 test(`editor fits the viewport and renders line numbers at ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.setItem('classcode-bandwidth','saver'));
  await page.goto('/');
  await page.getByRole('button',{name:/Python.*Open in editor/}).click();
  const editor=page.getByRole('textbox',{name:'Code editor'});
  await editor.fill('');
  await expect(page.getByLabel('Line numbers')).toHaveText('1');
  await expect(editor).toHaveAttribute('placeholder',/Type your code here/);
  const dimensions=await page.evaluate(()=>{
   const header=document.querySelector<HTMLElement>('.ide-header')!;
   const toolbar=document.querySelector<HTMLElement>('.coding-toolbar')!;
   return [document.documentElement.scrollWidth,header.scrollWidth,toolbar.scrollWidth];
  });
  expect(Math.max(...dimensions)).toBeLessThanOrEqual(viewport.width);
  await expect(page.getByRole('button',{name:'Run',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Share with my teacher',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'New file',exact:true}).click();
  await expect(page.getByRole('heading',{name:'New file',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'New file',exact:true})).toBeFocused();
 });
}
