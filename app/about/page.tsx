import type {Metadata} from 'next';
import TrustPage from '@/components/trust-page';
export const metadata:Metadata={title:'About ClassCode',robots:{index:false,follow:true}};
export default function AboutPage(){return <TrustPage kicker="ABOUT CLASSCODE" title="A coding workspace for curious minds." intro="ClassCode brings a browser code editor, beginner-friendly starting points, and teacher classroom tools into one place." sections={[
 {title:'What you can do here',body:<p>Students can create Python, Turtle, web, Java, C, and C++ projects, use the browser editor, and share a live draft with a joining teacher. Teachers can create classes, invite students, assign challenges, review submissions, and see automated checks. Java, C, and C++ execution is not available in the current editor.</p>},
 {title:'Who runs ClassCode',body:<p><strong>TODO:</strong> publish the verified owner or operating organization, location, and the person responsible for this service. This repository does not identify a legal operator or a public support contact.</p>},
 {title:'Support',body:<p><strong>TODO:</strong> add a monitored support and privacy contact. Until that is published, do not send account credentials or sensitive student information to an unverified address.</p>}
 ]}/>}
