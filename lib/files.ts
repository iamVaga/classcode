export function fileNameError(name:string,files:Record<string,string>,type:'python'|'web'):string|null {
 const value=name.trim();
 if(!value)return 'Enter a file name.';
 if(value.length>100)return 'Use a file name with 100 characters or fewer.';
 if(!/^[\w-]+\.(py|html|css|js|txt)$/.test(value))return 'Use letters, numbers, underscores or hyphens, followed by .py, .html, .css, .js or .txt.';
 if(Object.hasOwn(files,value))return 'A file with this name already exists. Choose another name.';
 if(type==='python'&&value==='turtle.py')return 'Choose another name: turtle.py is reserved for the Turtle library.';
 return null;
}
