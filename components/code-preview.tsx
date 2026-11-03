import {highlight} from '@/lib/highlight';
export default function CodePreview({code}:{code:string}){return <code className="color-code">{highlight(code).map((token,i)=><span className={'syntax-'+token.kind} key={i}>{token.text}</span>)}</code>}
