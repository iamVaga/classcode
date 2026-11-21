import './globals.css';
import './studio.css';
import './auth.css';
import './hero-polish.css';
import './editor.css';
import './motion.css';
import './classroom.css';
import './assignments.css';
import './snippets.css';
import './product-polish.css';
import './design-tokens.css';
import './design-system.css';
import '@/components/landing.css';
import './reference-redesign.css';
import ConnectionProvider from '@/components/connection-provider';
import ThemeProvider from '@/components/theme-provider';
import {connection} from 'next/server';
import type {Metadata} from 'next';
import {Atkinson_Hyperlegible_Mono,Fredoka,Lexend} from 'next/font/google';
const ui=Lexend({subsets:['latin'],display:'swap',variable:'--font-lexend',weight:['400','500','600','700'],preload:true});
const code=Atkinson_Hyperlegible_Mono({subsets:['latin'],display:'swap',variable:'--font-atkinson-mono',weight:['400','500','600'],preload:true});
const round=Fredoka({subsets:['latin'],display:'swap',variable:'--font-fredoka',weight:['400','500','600','700'],preload:true});
const promise='Students code. Teachers join live.';
const description='A browser coding workspace where students build real projects and teachers join live to suggest fixes. Start with Python, Turtle, Web, Java, C++, C, PyBlock or Pygame Studio.';
export const metadata:Metadata={
 metadataBase:new URL('https://classcode-sand.vercel.app'),
 title:{default:`ClassCode — ${promise}`,template:'%s | ClassCode'},
 description,
 alternates:{canonical:'/'},
 icons:{icon:'/classcode-mark.svg',shortcut:'/classcode-mark.svg'},
 openGraph:{type:'website',siteName:'ClassCode',title:`ClassCode — ${promise}`,description,url:'/'},
 twitter:{card:'summary_large_image',title:`ClassCode — ${promise}`,description,images:['/opengraph-image']}
};
const softwareSchema={'@context':'https://schema.org','@type':'SoftwareApplication',name:'ClassCode',applicationCategory:'EducationalApplication',operatingSystem:'Web',url:'https://classcode-sand.vercel.app',description:promise};
export default async function Layout({children}:{children:React.ReactNode}){
 await connection();
 return <html lang="en" data-theme="dark" data-scroll-behavior="smooth" className={`${ui.variable} ${code.variable} ${round.variable}`}>
  <body>
   <ThemeProvider><ConnectionProvider>{children}</ConnectionProvider></ThemeProvider>
   <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(softwareSchema)}}/>
  </body>
 </html>;
}
