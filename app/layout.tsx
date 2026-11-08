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
import ConnectionProvider from '@/components/connection-provider';
import type {Metadata} from 'next';
import {Atkinson_Hyperlegible_Mono,Lexend} from 'next/font/google';
const ui=Lexend({subsets:['latin'],display:'swap',variable:'--font-lexend',weight:['400','500','600','700'],preload:true});
const code=Atkinson_Hyperlegible_Mono({subsets:['latin'],display:'swap',variable:'--font-atkinson-mono',weight:['400','500','600'],preload:true});
const promise='Students make. Teachers guide.';
export const metadata:Metadata={
 metadataBase:new URL('https://classcode-sand.vercel.app'),
 title:{default:`ClassCode — ${promise}`,template:'%s | ClassCode'},
 description:`${promise} A browser-based coding workspace for Python, Turtle graphics, web projects, and classroom assignments.`,
 alternates:{canonical:'/'},
 icons:{icon:'/classcode-mark.svg',shortcut:'/classcode-mark.svg'},
 openGraph:{type:'website',siteName:'ClassCode',title:`ClassCode — ${promise}`,description:`${promise} A browser-based coding workspace for students and teachers.`,url:'/',images:[{url:'/opengraph-image',width:1200,height:630,alt:'ClassCode: Students make. Teachers guide.'}]},
 twitter:{card:'summary_large_image',title:`ClassCode — ${promise}`,description:`${promise} A browser-based coding workspace for students and teachers.`,images:['/opengraph-image']}
};
const softwareSchema={'@context':'https://schema.org','@type':'SoftwareApplication',name:'ClassCode',applicationCategory:'EducationalApplication',operatingSystem:'Web',url:'https://classcode-sand.vercel.app',description:promise};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth" className={`${ui.variable} ${code.variable}`}><body><ConnectionProvider>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(softwareSchema)}}/></ConnectionProvider></body></html>}
