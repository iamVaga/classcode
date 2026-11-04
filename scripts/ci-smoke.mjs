const origin=process.env.CLASSCODE_URL||'http://127.0.0.1:3011';
const paths=['/','/privacy','/terms','/safety','/about','/robots.txt','/sitemap.xml'];
let response;
for(let attempt=0;attempt<45;attempt++){
 try{response=await fetch(origin);if(response.ok)break}catch{}
 await new Promise(resolve=>setTimeout(resolve,1000));
}
if(!response?.ok)throw new Error(`ClassCode did not become ready at ${origin}`);
for(const path of paths){
 const result=await fetch(new URL(path,origin));
 if(!result.ok)throw new Error(`${path} returned HTTP ${result.status}`);
 const body=await result.text();
 if(path==='/'&&!body.includes('Students make.'))throw new Error('The home page is missing the product promise.');
 if(path==='/robots.txt'&&!body.includes('/sitemap.xml'))throw new Error('robots.txt does not advertise the sitemap.');
 if(path==='/sitemap.xml'&&!body.includes('https://classcode-sand.vercel.app/'))throw new Error('The sitemap is missing its canonical home URL.');
 if(path==='/'){
  for(const [name,expected] of [['X-Content-Type-Options','nosniff'],['X-Frame-Options','DENY']])if(result.headers.get(name)!==expected)throw new Error(`Missing security header ${name}.`);
 }
 console.log(`${result.status} ${path}`);
}
