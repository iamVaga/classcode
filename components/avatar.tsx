export const buddyNames=['Orbit the robot','Nova the astronaut','Pixel the cat','Ember the fox','Echo the owl','Bao the panda','Spark the dragon','Lumi the wizard','Bolt the knight','Pip the bunny','Mochi the bear','Ziggy the alien'];
export default function Avatar({kind=0,color='#c4b5fd',size=48}:{kind?:number;color?:string;size?:number}){
 const k=((kind%12)+12)%12;
 return <svg className="character-avatar" width={size} height={size} viewBox="0 0 80 80" data-buddy-gear={typeof document==="undefined"?"none":document.documentElement.dataset.buddyGear||"none"} role="img" aria-label={buddyNames[k]} style={{flexShrink:0,overflow:'visible'}}>
  <ellipse cx="40" cy="71" rx="22" ry="4" fill="#101327" opacity=".15"/>
  <g className="character-body" stroke="#282444" strokeWidth="2.2" strokeLinejoin="round">
   <path d="M24 48Q13 44 12 55M56 48Q66 43 69 51" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"/>
   <path d="M28 61L26 68H34L37 60M44 60L46 68H54L51 60" fill={color}/>
   <rect x="24" y="39" width="32" height="26" rx="12" fill={color}/>
   <path d="M31 54H49" stroke="#fff" opacity=".5"/>
   {k===0&&<><path d="M40 17V8"/><circle cx="40" cy="7" r="4" fill="#5eead4"/><rect x="15" y="25" width="7" height="14" rx="3" fill={color}/><rect x="58" y="25" width="7" height="14" rx="3" fill={color}/></>}
   {[2,3,6].includes(k)&&<path d="M21 27L18 8L35 20M47 20L63 8L60 29" fill={k===3?'#fbab67':color}/>}
   {k===4&&<path d="M20 25L17 12L33 20M47 20L63 12L60 27" fill={color}/>}
   {[5,10].includes(k)&&<><circle cx="22" cy="20" r="10" fill={k===5?'#41415c':color}/><circle cx="58" cy="20" r="10" fill={k===5?'#41415c':color}/></>}
   {k===9&&<><ellipse cx="29" cy="14" rx="7" ry="17" fill={color}/><ellipse cx="51" cy="14" rx="7" ry="17" fill={color}/><path d="M29 5V19M51 5V19" stroke="#fff" strokeWidth="3"/></>}
   {k===11&&<><path d="M25 23L17 10M55 23L63 10"/><circle cx="17" cy="9" r="4" fill="#5eead4"/><circle cx="63" cy="9" r="4" fill="#5eead4"/></>}
   <rect x="19" y="18" width="42" height="35" rx={k===0?12:18} fill={k===3?'#ffbc82':k===5?'#fff5eb':color}/>
   {k===1&&<circle cx="40" cy="34" r="25" fill="#dddafa"/>}
   {k===8&&<path d="M19 31Q18 13 40 13Q62 13 61 31L55 47H25Z" fill="#c5cce2"/>}
   {k===7&&<path d="M15 25L34 0L49 15L64 25Z" fill="#8171e9"/>}
   {k===6&&<path d="M31 18L36 8L43 18L49 10L52 24" fill="#6ee7be"/>}
   {[2,3,4,5,6,9,10].includes(k)?<>
    {k===3&&<path d="M20 32Q31 28 40 42Q51 28 60 32Q56 52 40 54Q22 49 20 32Z" fill="#fff3da" stroke="none"/>}
    {(k===4||k===5)&&<g fill={k===5?'#37354b':'#fff1c9'}><circle cx="31" cy="34" r="9"/><circle cx="49" cy="34" r="9"/></g>}
    <g className="character-eyes" fill={k===5?'white':'#292543'} stroke="none"><ellipse cx="32" cy="34" rx="3" ry="4"/><ellipse cx="48" cy="34" rx="3" ry="4"/></g>
    <path d="M36 41Q40 38 44 41L40 45Z" fill={k===4?'#ffb44f':'#393049'}/><path d="M40 45Q36 50 33 46M40 45Q43 50 47 46" fill="none"/>
   </>:<>   <rect x="24" y="28" width="32" height="17" rx={k===11?9:7} fill="#24243d"/>
   <g className="character-eyes" fill={k===3?'#ffd38c':'#80ffe2'} stroke="none"><ellipse cx="33" cy="36" rx={k===4?5:3} ry={k===4?5:4}/><ellipse cx="47" cy="36" rx={k===4?5:3} ry={k===4?5:4}/><circle cx="34" cy="34" r="1" fill="white"/><circle cx="48" cy="34" r="1" fill="white"/></g>
   <path d="M35 47Q40 51 45 47" fill="none" strokeWidth="1.7" strokeLinecap="round"/>
   </>}
   {k===2&&<path d="M20 40L10 37M20 44L10 45M60 40L70 37M60 44L70 45" strokeWidth="1.5"/>}
   <path d="M38 56L40 53L42 56L45 57L42 59L40 62L38 59L35 57Z" fill="#fff6bd" stroke="none"/>
   <g className="buddy-scarf" fill="#fb8069"><path d="M25 49Q40 57 55 49L54 55Q39 62 25 55Z"/><path d="M46 55L57 65L47 66L42 57Z"/></g>
   <g className="buddy-crown" fill="#ffd05f"><path d="M23 18L20 5L31 11L40 2L48 11L59 5L55 19Z"/><circle cx="40" cy="13" r="2" fill="#9650ba"/></g>
  </g>
 </svg>
}
