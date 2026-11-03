'use client';
import {useEffect,useRef} from 'react';
export type TurtleCommand={op:string;id?:number;x?:number;y?:number;angle?:number;visible?:boolean;color?:string;shape?:string;x1?:number;y1?:number;x2?:number;y2?:number;width?:number;height?:number;size?:number;text?:string;align?:string;points?:number[][];stroke?:string};
export default function TurtleCanvas({commands}:{commands:TurtleCommand[]}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const frame=requestAnimationFrame(()=>{
  const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
  const setup=commands.findLast(c=>c.op==='setup');el.width=setup?.width||600;el.height=setup?.height||600;
  const background=commands.findLast(c=>c.op==='background')?.color||'#ffffff';
  ctx.fillStyle=background;ctx.fillRect(0,0,el.width,el.height);ctx.save();ctx.translate(el.width/2,el.height/2);ctx.lineCap='round';ctx.lineJoin='round';
  const cursors=new Map<number,TurtleCommand>();let start=0;
  commands.forEach((c,i)=>{if(c.op==='clearall')start=i+1});
  const cleared=new Map<number,number>();commands.forEach((c,i)=>{if(c.op==='clear')cleared.set(c.id||0,i)});
  for(let i=start;i<commands.length;i++){
   const c=commands[i];if(i<(cleared.get(c.id||0)||-1))continue;
   ctx.strokeStyle=c.color||'#8b5cf6';ctx.fillStyle=c.color||'#8b5cf6';ctx.lineWidth=c.width||2;
   if(c.op==='line'){ctx.beginPath();ctx.moveTo(c.x1||0,-(c.y1||0));ctx.lineTo(c.x2||0,-(c.y2||0));ctx.stroke()}
   if(c.op==='dot'){ctx.beginPath();ctx.arc(c.x||0,-(c.y||0),(c.size||5)/2,0,Math.PI*2);ctx.fill()}
   if(c.op==='fill'&&c.points?.length){ctx.beginPath();c.points.forEach(([x,y],j)=>j?ctx.lineTo(x,-y):ctx.moveTo(x,-y));ctx.closePath();ctx.fill();ctx.strokeStyle=c.stroke||c.color||'#8b5cf6';ctx.stroke()}
   if(c.op==='text'){ctx.font=`${Math.min(300,c.size||12)}px sans-serif`;ctx.textAlign=['left','right','center'].includes(c.align||'')?c.align as CanvasTextAlign:'left';ctx.fillText((c.text||'').slice(0,10000),c.x||0,-(c.y||0))}
   if(c.op==='cursor')cursors.set(c.id||0,c);
  }
  for(const c of cursors.values()){if(!c.visible)continue;ctx.save();ctx.translate(c.x||0,-(c.y||0));ctx.rotate(-(c.angle||0)*Math.PI/180);ctx.fillStyle=c.color||'#8b5cf6';ctx.strokeStyle='#172033';ctx.lineWidth=1.5;ctx.beginPath();if(c.shape==='turtle'){ctx.ellipse(0,0,10,7,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(12,0,4,0,Math.PI*2)}else{ctx.moveTo(12,0);ctx.lineTo(-8,7);ctx.lineTo(-4,0);ctx.lineTo(-8,-7);ctx.closePath()}ctx.fill();ctx.stroke();ctx.restore()}
  ctx.restore();
 });return()=>cancelAnimationFrame(frame)},[commands]);
 return <div className="turtle-stage"><div className="turtle-stage-label"><span>◈ TURTLE CANVAS</span><span>{commands.findLast(c=>c.op==='title')?.text||'Make code visible'}</span></div><canvas ref={canvas} aria-label="Python Turtle drawing output"/><p>Coordinates start at the center · Run again to redraw</p></div>
}
