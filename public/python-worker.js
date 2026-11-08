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
 try{
  runtime.globals.set('_cc_source',data.code);
  const findings=runtime.runPython(`
import ast, builtins, symtable
_cc_findings=[]
try:
    _cc_tree=ast.parse(_cc_source, filename='main.py')
    _cc_table=symtable.symtable(_cc_source, 'main.py', 'exec')
    _cc_defined={s.get_name() for s in _cc_table.get_symbols() if s.is_assigned()}
    _cc_known=set(dir(builtins)) | _cc_defined
    _cc_pending=[_cc_table]
    while _cc_pending:
        _cc_current=_cc_pending.pop()
        _cc_pending.extend(_cc_current.get_children())
        for _cc_symbol in _cc_current.get_symbols():
            _cc_name=_cc_symbol.get_name()
            if _cc_symbol.is_referenced() and _cc_symbol.is_global() and not _cc_symbol.is_assigned() and _cc_name not in _cc_known:
                _cc_node=next((n for n in ast.walk(_cc_tree) if isinstance(n, ast.Name) and n.id==_cc_name and isinstance(n.ctx, ast.Load)), None)
                _cc_findings.append((f"NameError: name '{_cc_name}' is not defined", getattr(_cc_node, 'lineno', 1)))
                _cc_known.add(_cc_name)
except SyntaxError as _cc_error:
    _cc_findings.append((f"SyntaxError: {_cc_error.msg}", _cc_error.lineno or 1))
_cc_findings[:20]
`);
  if(findings&&typeof findings.toJs==='function'){const values=findings.toJs();if(values?.length)postMessage({analysis:Array.from(values,row=>({traceback:row[0],line:row[1]}))});findings.destroy?.()}
  runtime.globals.delete('_cc_source');
  await runtime.runPythonAsync(data.code,{globals:scope});
 }finally{try{runtime.globals.delete('_cc_source');await runtime.runPythonAsync("import sys\nif 'turtle' in sys.modules:\n    sys.modules['turtle']._flush()",{globals:scope});}finally{scope.destroy()}}
 postMessage({done:true});
}catch(error){postMessage({text:String(error),done:true,error:true});}};
