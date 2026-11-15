import {ImageResponse} from 'next/og';

export const alt = 'ClassCode. Students build real projects with live help from teachers.';
export const size = {width:1200, height:630};
export const contentType = 'image/png';

export default function OpenGraphImage() {
 return new ImageResponse(
  <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',gap:56,padding:64,background:'linear-gradient(135deg,#f8faf6,#dcf0e5)',color:'#102520'}}>
   <div style={{width:590,display:'flex',flexDirection:'column',gap:26}}>
    <div style={{display:'flex',fontSize:28,fontWeight:700,color:'#006b53'}}>ClassCode</div>
    <div style={{display:'flex',flexDirection:'column',fontSize:61,fontWeight:700,lineHeight:1.1,letterSpacing:'-2.5px'}}>
     Students build real projects<span style={{color:'#006b53'}}>with live help from teachers.</span>
    </div>
    <div style={{display:'flex',fontSize:24,color:'#455b54'}}>A browser coding workspace for classrooms.</div>
   </div>
   <div style={{width:430,display:'flex',flexDirection:'column',background:'#101d26',color:'#dbe9ef',border:'1px solid #364c58',borderRadius:20,fontSize:22,boxShadow:'0 18px 48px #10252024',overflow:'hidden'}}>
    <div style={{display:'flex',justifyContent:'space-between',padding:20,background:'#172935'}}><span>square.py</span><span style={{color:'#9bebcb'}}>Teacher joined</span></div>
    <div style={{display:'flex',flexDirection:'column',gap:10,padding:22}}>
     <span>for side in range(4):</span><span style={{paddingLeft:22}}>turtle.forward(100)</span><span style={{paddingLeft:22,color:'#ffd0a3'}}>turtle.left(45)</span>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:9,padding:20,background:'#172935',fontSize:21}}>
     <span style={{color:'#9bebcb',fontWeight:700}}>Teacher suggestion</span><span>Try a 90° turn at each corner.</span>
    </div>
   </div>
  </div>,size
 );
}
