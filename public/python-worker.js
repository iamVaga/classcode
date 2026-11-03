let runtime;
let previousFiles=[];
let turtleSource='';
onmessage=async({data})=>{try{
 if(!runtime){postMessage({phase:'Loading Python runtime… First load depends on your connection.'});importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');const candidate=await loadPyodide();postMessage({phase:'Preparing Turtle graphics…'});const response=await fetch('/turtle.py');if(!response.ok)throw Error('Could not load browser Turtle');turtleSource=await response.text();runtime=candidate;}
 runtime.FS.writeFile('/home/pyodide/turtle.py',turtleSource);
 runtime.setStdout({batched:text=>postMessage({text})});runtime.setStderr({batched:text=>postMessage({text})});
 for(const name of previousFiles){try{runtime.FS.unlink('/home/pyodide/'+name)}catch{}}
 const modules=[...previousFiles,...Object.keys(data.files)].filter(n=>n.endsWith('.py')).map(n=>n.slice(0,-3));
 const pyModules=runtime.toPy([...modules,'turtle']);runtime.globals.set('_cc_modules',pyModules);pyModules.destroy();
 runtime.runPython("import sys, os, importlib\nsys.dont_write_bytecode=True\nos.chdir('/home/pyodide')\nfor _cc_module in _cc_modules:\n    sys.modules.pop(_cc_module, None)\nimportlib.invalidate_caches()");
 for(const [name,content] of Object.entries(data.files)){if(name==='turtle.py')throw Error('Rename turtle.py so it does not shadow the Turtle library.');runtime.FS.writeFile('/home/pyodide/'+name,content);}
 previousFiles=Object.keys(data.files);
 postMessage({ready:true});
 const scope=runtime.toPy({__name__:'__main__'});
 try{await runtime.runPythonAsync(data.code,{globals:scope});}finally{try{await runtime.runPythonAsync("import sys\nif 'turtle' in sys.modules:\n    sys.modules['turtle']._flush()",{globals:scope});}finally{scope.destroy()}}
 postMessage({done:true});
}catch(error){postMessage({text:String(error),done:true,error:true});}};
