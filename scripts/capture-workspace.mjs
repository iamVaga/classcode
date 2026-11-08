import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const baseURL=process.env.CLASSCODE_URL||'http://localhost:3000/';
const phase=process.env.CLASSCODE_SCREENSHOT_PHASE==='before'?'before':'after';
const sizes=[[1366,768],[1280,720],[1024,768],[390,844]];
await mkdir('screenshots',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROME_PATH});
try{
 const context=await browser.newContext({colorScheme:'dark',reducedMotion:'reduce'});
 await context.addInitScript(()=>localStorage.setItem('classcode-bandwidth','saver'));
 for(const [width,height] of sizes){
  const page=await context.newPage({viewport:{width,height}});
  await page.setViewportSize({width,height});
  const capture=(name,fullPage=false)=>page.screenshot({path:`screenshots/${phase}-${name}-${width}.png`,fullPage});
  try{
   await page.goto(baseURL);
   await page.locator('footer.studio-footer').scrollIntoViewIfNeeded();
   await page.evaluate(()=>window.scrollTo(0,0));
   await capture('home',true);
   await page.locator('.starter-python').click();
   const editor=page.getByRole('textbox',{name:'Code editor'});
   const codeTab=page.getByRole('navigation',{name:'Workspace panes'}).getByRole('button',{name:'Code',exact:true});
   const output=page.locator('.console-output');
   const run=page.getByRole('button',{name:'Run',exact:true});
   await editor.fill('');
   await capture('editor');
   await page.getByRole('button',{name:'New file',exact:true}).click();
   await page.getByRole('heading',{name:phase==='before'?'Create a new file':'New file',exact:true}).waitFor();
   await capture('file');
   await page.keyboard.press('Escape');
   await editor.fill('print("hello")');
   await run.click();
   const outputState=phase==='before'?'attached':'visible';
   await output.getByText('Execution finished.',{exact:true}).waitFor({timeout:75_000,state:outputState});
   await output.getByText('hello',{exact:true}).waitFor({state:outputState});
   await capture('run');
   if(width<800&&phase==='after')await codeTab.click();
   await editor.fill('print(1/0)');
   await run.click();
   await output.getByText('See the original Python error').waitFor({state:phase==='before'?'attached':'visible'});
   if(width<800&&phase==='after'){
    await capture('error-output');
    await codeTab.click();
   }
   if(phase==='after')await page.locator('.light-line-gutter .error-line').waitFor();
   await capture('error');
   await editor.fill('import turtle\nturtle.forward(100)\nturtle.left(90)\nturtle.forward(60)');
   await run.click();
   await page.locator('.python-drawing-output canvas').waitFor();
   await capture('turtle');
   console.log(`${width}×${height}: captured all screens`);
  }finally{
   await page.close();
  }
 }
}finally{
 await browser.close();
}
