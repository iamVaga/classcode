import {expect,test} from '@playwright/test';

const viewports = [
 {width:1366,height:768},
 {width:1280,height:720},
 {width:1024,height:768},
 {width:390,height:844},
];

for(const viewport of viewports){
 test(`home stays visible and compact at ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>{
   window.IntersectionObserver=class {
    observe() {}
    unobserve() {}
    disconnect() {}
   } as unknown as typeof IntersectionObserver;
  });
  for(const saved of [false,true]){
   await page.goto('/');
   if(saved){
    await page.evaluate(()=>localStorage.setItem('classcode-projects',JSON.stringify([{
     id:'demo-saved-project',name:'Saved test project',type:'python',
     files:{'main.py':'print(1)'},version:1,updated:new Date().toISOString(),
    }])));
    await page.reload();
    await expect(page.getByText('Your latest project is right where you left it.')).toBeVisible();
   }
   await page.locator('footer.studio-footer').scrollIntoViewIfNeeded();
   const measurements=await page.evaluate(()=>{
    const sections=Array.from(document.querySelectorAll<HTMLElement>('.discovery-hero,.jump-back,.discovery-section,.teacher-overview,.analyser-preview,.how-it-works,.student-safety,.final-project-cta,.studio-footer'));
    return {
     overflow:document.documentElement.scrollWidth>innerWidth,
     opacity:sections.map(section=>getComputedStyle(section).opacity),
     gaps:sections.slice(1).map((section,index)=>section.getBoundingClientRect().top-sections[index].getBoundingClientRect().bottom),
    };
   });
   expect(measurements.overflow).toBe(false);
   expect(measurements.opacity.every(opacity=>opacity==='1')).toBe(true);
   expect(Math.max(...measurements.gaps)).toBeLessThanOrEqual(120);
  }
 });

 test(`editor fits the viewport and renders line numbers at ${viewport.width}px`,async({page})=>{
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.setItem('classcode-bandwidth','saver'));
  await page.goto('/');
  await page.locator('.starter-python').click();
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
  await expect(page.getByRole('button',{name:'Live session',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'New file',exact:true}).click();
  await expect(page.getByRole('heading',{name:'New file',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'New file',exact:true})).toBeFocused();
 });
}
