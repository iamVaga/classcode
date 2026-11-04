import {ImageResponse} from 'next/og';

export const alt='ClassCode: Students make. Teachers guide.';
export const size={width:1200,height:630};
export const contentType='image/png';

export default function OpenGraphImage(){
 return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'68px',background:'linear-gradient(135deg,#f7f4fb 0%,#fff 58%,#edf5ef 100%)',color:'#282238',fontFamily:'Arial,sans-serif'}}>
  <div style={{display:'flex',flexDirection:'column',width:'62%'}}>
   <div style={{display:'flex',alignItems:'center',gap:'15px',fontSize:25,fontWeight:700,color:'#765293'}}><div style={{width:44,height:44,border:'2px solid #765293',borderRadius:13,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>&lt;/&gt;</div>classcode</div>
   <div style={{display:'flex',flexDirection:'column',marginTop:61,fontSize:63,lineHeight:1.1,fontWeight:700,letterSpacing:'-3px'}}>Students make.<span style={{color:'#815a9e'}}>Teachers guide.</span></div>
   <div style={{display:'flex',marginTop:26,fontSize:23,lineHeight:1.5,color:'#675f70'}}>A browser-based coding workspace for Python, Turtle, web projects, and classrooms.</div>
  </div>
  <div style={{width:360,height:290,border:'1px solid #ddd5e8',borderRadius:22,background:'#fff',boxShadow:'0 20px 60px #30203d19',display:'flex',flexDirection:'column',padding:20}}>
   <div style={{display:'flex',gap:8,marginBottom:25}}><i style={{width:10,height:10,borderRadius:10,background:'#c5a7dc'}}/><i style={{width:10,height:10,borderRadius:10,background:'#d9c8e8'}}/><i style={{width:10,height:10,borderRadius:10,background:'#e7ddef'}}/></div>
   <div style={{display:'flex',flexDirection:'column',gap:7,fontFamily:'monospace',fontSize:19,lineHeight:1.5,color:'#655080'}}><div style={{display:'flex'}}>name = <span style={{color:'#3f806e'}}>&quot;curious coder&quot;</span></div><div style={{display:'flex'}}>print(f<span style={{color:'#3f806e'}}>&quot;Hello, {'{name}'}!&quot;</span>)</div><div style={{display:'flex',color:'#9b6fa7'}}>for step in range(5):</div><div style={{display:'flex'}}>&nbsp;&nbsp;draw_something(step)</div></div>
   <div style={{display:'flex',marginTop:'auto',padding:13,borderRadius:11,background:'#f5f2f8',fontSize:15,color:'#746b7d'}}>A small start. Your next idea.</div>
  </div>
 </div>,size);
}
