export type CodeToken={text:string;kind:string};
// A bounded display tokenizer; text is rendered as React text, never HTML.
export function highlight(code:string):CodeToken[]{
 if(code.length>100000)return [{text:code,kind:'plain'}];
 const pattern=/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|#[^\n]*|\/\/[^\n]*|<!--[\s\S]*?-->|\b(?:import|from|as|def|class|return|for|while|in|if|else|elif|break|continue|True|False|None|const|let|function|new|export|default)\b|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_]\w*(?=\s*\()|<\/?[a-zA-Z][\w-]*|[{}[\]():=+*/<>-])/g;
 const result:CodeToken[]=[];let end=0;
 for(const match of code.matchAll(pattern)){if(match.index>end)result.push({text:code.slice(end,match.index),kind:'plain'});const text=match[0];const kind=/^["'`]/.test(text)?'string':/^(#|\/\/|<!--)/.test(text)?'comment':/^\d/.test(text)?'number':/^<\/?[a-zA-Z]/.test(text)?'tag':/^[{}[\]():=+*/<>-]$/.test(text)?'punctuation':/^(import|from|as|def|class|return|for|while|in|if|else|elif|break|continue|True|False|None|const|let|function|new|export|default)$/.test(text)?'keyword':'function';result.push({text,kind});end=match.index+text.length}
 if(end<code.length)result.push({text:code.slice(end),kind:'plain'});return result;
}
